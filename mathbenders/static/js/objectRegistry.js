/*
### OBJECT REGISTRY
- registers and tracks network object creation / modification
- attaches "networkObjectInfo" to objects and sets properties
- lets this client tell the network about current objects state / client changes to object
*/
ObjectRegistry = {
    setObjectVelocity(data){
        const obj = ObjectRegistry._registeredObjects[data.objId];
        if (obj && obj.entity && obj.entity.rigidbody){
            obj.entity.rigidbody.linearVelocity = JsonUtil.JsonToVec3(data.velocity);
            // console.log("%c set obj velocity:"+JSON.stringify(data.velocity),"color:blue");
        }
    },

    playerHasOwnership(obj){
        cb = obj;
        const objId = obj.script?.networkObjectInfo?.objId;
        const ownerId = ObjectRegistry._registeredObjects[objId].ownerId;
        if (ownerId == clientId) {
            return true;
        } else {
            return false;
        }
    },
    updateMovedObjects(objectsList){
        //console.log(JSON.stringify(objectsList));
        //if (objectsList.length > 0) console.log("update:"+objectsList[0].objId.substr(0,4)+","+JSON.stringify(objectsList[0].position));
        objectsList.forEach(x => {
            const obj = ObjectRegistry._registeredObjects[x.objId];
            if (obj && obj.entity && (x.ownerId != clientId)){ // || x.staleOwnerId != clientId)){
                
                const pos = JsonUtil.JsonToVec3(x.properties.position);
                const rot =JsonUtil.JsonToVec3(x.properties.rotation); 
                if (obj.entity.rigidbody) {
                    obj.entity.rigidbody.linearVelocity = JsonUtil.JsonToVec3(x.properties.rigidbodyVelocity);
                    //console.log("Set:"+obj.entity.name+" to:"+obj.entity.rigidbody.linearVelocity.length());
                }
               // obj.entity.moveTo(pos,rot);
                obj.entity.enabled = x.properties.enabled;
          //      console.log("Moved:"+obj.name);
            } else {
            }
            
        });
    },
    _registeredObjects : {},
    lastDataSent : {},
    lastDataReceived : {},
    objectsCreatedHistory : [], // need to preserve history, even after objects are deleted, to prevent server duplicates
    objectsCreatedByAncestorsHistory : [], 
    createObjectsForNewPlayer(objects){
        
        objects.forEach(x=>{
            this.createObjectFromServer(x);
           });
    },
    validateObjectCreatedFromServer(data){
        if (data.objId in ObjectRegistry._registeredObjects){ 
            // Server told us about this object, but client had already predicted it. 
            // Set server validation true then return; no further updates to this object should be needed (except maybe position ..?lol)
            ObjectRegistry._registeredObjects[data.objId].serverValidated = true; // we a
        }

    },
    createObjectFromServer(data){
        // overall, dislike how data is handled here.
        // dislike some data set via getters/setters after registerObejct.
        // dislike some data set by obj.networkObjectInfo.attribute = value.
        // data should be kept in one place! But if it lives only on the object, we have to do extra work to find it from registeredObjects, for example if the server says to destroy an objId or setOwner, and if data lives only in registeredObjects, we have to do extra work to get that data if we already have the object and something local happens (such as a collision event)
        var properties = data.properties;
        if (data.objId in ObjectRegistry._registeredObjects){ 
            // Server told us about this object, but client had already predicted it. 
            // Set server validation true then return; no further updates to this object should be needed (except maybe position ..?lol)
            ObjectRegistry._registeredObjects[data.objId].serverValidated = true; // we a
            properties.position = JsonUtil.JsonToVec3(properties.position);
            properties.rotation = JsonUtil.JsonToVec3(properties.rotation);
            ObjectRegistry._registeredObjects[data.objId].entity.moveTo(properties.position,properties.rotation);
//            console.log("and move to");
            return;
        } else {
            // console.log("Cr "+data.objId.substr(0,4)+", it wasnt in:"+JSON.stringify(ObjectRegistry._registeredObjects));
        }
        if (ObjectRegistry.objectsCreatedHistory.includes(data.objId)){
            console.log("%c Ignoring dupe req (csp)","color:#c88");
            return;
        }
    
        if (data.ancestors){
            // attempted monkey patch to prevent duplicating numbers when two clients see collisions. (failed)
            // dislike so many things about it but just trying stuff. Most "disliked" thing is that "ancestors" are now stored on server object data, which means they can persist into future games where they are no longer relevant.
            let matched = false;
            ObjectRegistry.objectsCreatedByAncestorsHistory.forEach(arr=>{
                if (arrayEquals(arr,data.ancestors)){
//                    console.log("Matched:"+data.ancestors[0].substr(0,4)+","+data.ancestors[1].substr(0,4));
                    matched = true;
                }
            });
            if (matched){
                // console.log("we had ancestors that matched a previous set of ancestors, therefore this number is a duplicate");
                return;
            } else if (!matched) {
                ObjectRegistry.objectsCreatedByAncestorsHistory.push(data.ancestors);
//                console.log("%c nomatch, new Ancestors:"+data.ancestors[0].substr(0,4)+","+data.ancestors[1].substr(0,4),"color:green");

            }            
        }


        ObjectRegistry.objectsCreatedHistory.push(data.objId);
        properties.position = JsonUtil.JsonToVec3(properties.position);
        properties.rotation = JsonUtil.JsonToVec3(properties.rotation);
       
        const obj = Game.Instantiate[data.properties.templateName](data.properties);
        if (!obj.script) obj.addComponent('script');
        obj.script.create('networkObjectInfo',{
            attributes:{
                objectProperties:data.properties, // dislike objId being divorced from objectProperties .
                objId:data.objId,
                ownerId:data.ownerId,
                previousOwnerId:data.previousOwnerId,
                serverValidated:data.serverValidated,
            }
        });
        
        obj.script.networkObjectInfo.setObjectProperties(properties);

        const registryData = {
            entity : obj,
            ownerId : data.ownerId,
            objId : data.objId
        }
        ObjectRegistry.registerObject(registryData);
        cb=obj;
        return obj;
    },
    serverValidateObject(objId){

    },
    destroyObject(data){
        this.destroyIfExists(data.objId);
        return;
    }, 
    destroyIfExists(objId){
        const obj = ObjectRegistry._registeredObjects[objId];
        if (obj && obj.entity){
            obj.entity.destroy();
            delete(ObjectRegistry._registeredObjects[objId]);
        } else {
        //    console.log ("%c FAIL destroy, clientsideprediction?:"+objId.substr(0,5),"color:red");
        }
    },
    touchObject(id){
        ObjectRegistry._registeredObjects[id].lastTouchedTime = Date.now(); // Ideally we only send stuff over the network that needs updating.
    },
    tagObjectForDestroy(objId){
        // TODO How do we deal with a client who joins later and thinks this object still exists?
        if (ObjectRegistry._registeredObjects[objId]) {
            Network.destroyObject(objId); 
            ObjectRegistry._registeredObjects[objId].destroyedTime = Date.now();
            ObjectRegistry._registeredObjects[objId].wasDestroyed = true;
        }
    },
    setOwnership(data){
        console.log("Server set owner of :"+data.objId.substr(0,4)+" to "+data.playerName);
        console.log(data)
        // console.log("%c Owner set"+JSON.stringify(data).substr(0,20),"color:cyan");
        const obj = ObjectRegistry._registeredObjects[data.objId];
        if (obj){
       //     console.log("%c setting owner:  ... "+data.ownerId,"color:$f99");
            const noi = pc.app.root.findByGuid(obj.guid).script?.networkObjectInfo;
            if (noi) {
                if (data.ownerId == noi.ownerId) {
                    // skip
                    return;
                }
                if (data.ownerId == "None"){
                    noi.setNetObjState(NetObjState.NoOwner,"setownserver");
                } else {
                    noi.setNetObjState(NetObjState.Owned);
                }
                noi.ownerId = data.ownerId;
            } else {
                console.log("FAIL find:"+data.objId.substr(0,10),"color:red");
            }
        }
    },
    registeredObjectsEntities : {},
    get getClientOwnedObjects(){
        var clientOwned = [];
         
        Object.keys(ObjectRegistry._registeredObjects).forEach(x => {
            const obj = ObjectRegistry._registeredObjects[x];
            const entity = pc.app.root.findByGuid(obj.guid);
            const noi = entity?.script?.networkObjectInfo;
            if (obj && entity && obj.ownerId == clientId
                && noi?.objState == NetObjState.Owned){
                const data = {
                    objId : x,
                    ownerId : clientId,
                    properties : noi.getObjectProperties()
                } 
                clientOwned.push(data);
            }
        });
//        if (clientOwned.length >0 ) console.log("sending:"+clientOwned[0].objId.substr(0,4));
        return clientOwned;
    },
    registerObject(options={}){
        const { entity, objId, ownerId } = options;

//        obj.on('destroy',(x)=>{ObjectRegistry.tagObjectForDestroy(objId);},obj);
//        obj.on('collision',(x)=>{ObjectRegistry.objCollision(objId);},obj);
//        obj.on('enable',(x)=>{ObjectRegistry.touchObject(objId);},obj);
//        obj.on('disable',(x)=>{ObjectRegistry.touchObject(objId);},obj);
        const guid = entity.getGuid();
        ObjectRegistry._registeredObjects[objId] = {  // shared server and local
            guid : guid, // all get/set below rely on guid to find the entity, and rely on networkobjectinfo being attached
            _entity : null,
            get entity(){
                if (this._entity == null) { this._entity = pc.app.root.findByGuid(guid); }
                return this._entity;
            },
            _networkObjectInfo : null,
            get networkObjectInfo() {
                if (this._networkObjectInfo == null){ this._networkObjectInfo = this.entity.script.networkObjectInfo; }
                return this._networkObjectInfo;
            },
            get objId(){
                return this.networkObjectInfo.objId;
            },
            get serverValidated(){
                return this.networkObjectInfo.serverValidated;
            },
            set serverValidated(value){
                this.networkObjectInfo.serverValidated = value;
            },
            set objId(value){
                this.networkObjectInfo.objId = value;
            },
            get ownerId(){
                return this.networkObjectInfo.ownerId;
            },
            set ownerId(value){
               this.networkObjectInfo.ownerId = value; 
            },
        };
    },
 
}


