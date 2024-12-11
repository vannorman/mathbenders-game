/*
Network.Instantiate[templateName] = function(options={}){
            const data = {
                ancestors : options.ancestors, // for numberinfo collisions.
                objId : crypto.randomUUID(),
                ownerId : clientId,
                previousOwnerId : "None",
                properties : {
                    templateName : templateName,
                    position : options.position || pc.Vec3.ZERO,
                    rotation : options.rotation || pc.Vec3.ZERO,
                    gfxOnly : options.gfxOnly || false,
                    enabled : options.enabled || true,
                    rigidbodyType : options.rigidbodyType || pc.RIGIDBODY_TYPE_DYNAMIC,
                    rigidbodyVelocity : options.rigidbodyVelocity || pc.Vec3.ZERO,
                }
            }
            //console.log("%c Created: "+data.objId.substr(0,5),'color:#7f7');
            data.properties = { ...data.properties, ...options}; // dislike? WTF is this??
            // dislike - need promise creation/resolution to actually return values if we're waiting for network
            // for now let's simply return the objectregristry creation, since we're doing client side prediction
            data.serverValidated = true; // prepopulate this value as true so server doesn't need to hold this variable. 
            // dislike the logic organization but, alternative seems to be too much logic / variables on server, would rather keep it here.
            Network.requestCreation(data); 
            if (Network.Settings.ClientSidePrediction == true){
                data.serverValidated = false;// "CreateObjectFromServer" is a lie, so serverValidated = false .. so we know .. dislike lol

                return ObjectRegistry.createObjectFromServer(data);
            } else {
                console.log("No client side prediction, couldn't return obj without a promise");

            }

        }
*/

// request ownership bug. need to decide how we want to handle ownership e..g when a client creates, throws, moves, destroys a number
// if one client throws a number it's client side prediction and telling server so other clients know where it is, and orig client gets validation
// if another client approaches that number it should gain ownership before contact for it to pickup
// but if two clients stand in proximity to a number either client should be primed to pick up the number? That can result in duplicates, so one client should have priority.

// position bug. 
// pick up a number, throw it and stand still. Number moves as expected then disappears and gets created at its throw position, causing you to pick it up. What's happening: server receives "number create" event from client on throw, but server doeesn't get updated position/velocity of that number after the throw. So the client successfully sends the "create number here" event but is unsuccessful in sending "and now each frame the number is .. here and has .. momentum", so server only propagates the "number is here" event.

// collision errors.
// client 1 : I saw a collision and made the result.
// Server : I will tell other clients about the result.
// Client 2 : I saw the same collision and made my own result.
// Sever : I think I saw this same result already? So I won't propagate it.
// client 1 : I think I saw this result already? so I won't honor it.

// When server sends client a new number creation as a result of the collision
// Client should know that this new number with new uuid should actually replace their existing uuid for the collision
// Because ultimately two clients saw the collision but only one has authority over it.
// Debug / fix process: Debug log with Date.time() at every collision/creation step for 2 clients. 
// Give one client authority.
// Reverse / update decisions on second client according to first to eliminate double creations.

// ideas:
// client can't allow collision between a client-side-predicted number creation and a server-created number.
// server must validate the csp number and flag it as validated before it can combine with another server-created number.

// Where is my schema for networkObjectInfo.objectProperties?

// bugs
// objectid is undefined on server when requestingownership - cannot read ownerid of undefined line 245 the debug
// sometimes server just stops propagating info
/*
### NETWORK
- inits sockets connectiong to server
- uses unique clientId (set by fingerprint.js in index.html)
- receives server updates about remote players, inventory, and objects
- sends server info about local player, inventory, and objects
*/
const Environment = {
    DEV : 'DEV',
    PROD : 'PROD',
},
Network = {
    Instantiate : {}, // will be populated by prefabs from game.js
    Settings : {
        ClientSidePrediction : true,
        Environment : Environment.DEV,
    },
    lastUpdateTime : 0,
    get serverName() {

        switch(Network.Settings.Environment){
            case Environment.PROD: return "elementa";
            case Environment.DEV: return "dev-elementa";
            default: return "dev-elementa";
        }
    },
    get serverUrl() {
        return 'https://'+Network.serverName+'.glitch.me/'; // Development server
    },
    socketId : null,
    sessionID : -1,
    playerName : "Noneyet",
    socket : null,
    instance : null,
    otherPlayers : {},
    clientSidePredictions : [],
    Init(playerNameElement,playerEntity){
        // Called from game.js
        Network.playerEntity = playerEntity; 
        // Flow:
        /*
            - Say hi to server with uuid
            - if (Does server know me? If yes, tell me my name and put it over my player
            - else (Was I new to server? If yes, tell server my fingerprint name and put it over my player
            - OK, now server keeps unique track of logged in players including me! Yay!
            - OK, now
            - Update function, ask server for names and positions of all things that aren't me, then create if needed then update pos and rot for each of them. 
            - Sooo...
                - We'll need a global dictionary of "things" so that we can label each thing that we tell the server about,
                - Then each client will also know which thing we're talking about due to its globally unique name. 
                - That way SERVER doesn't need to know anything about what's what, as long as all clients agree..
                - UPDATE: We now use Game.templatize[templateName] for all objects, so each client can share / update using this syntax
                - OK For now let's just do players as a cube! Hooray!
        */

//        Network.socket = io.connect(this.serverUrl, {withCredentials: true});
        
        const data = { 
            clientId : clientId,
            properties: {
                position : Network.playerEntity.getPosition().trunc(),
                inventory : Network.playerEntity.script.inventory.getProperties(),
                playerName : PlayerNameGenerator.getRandomName(), 
                // dislike, inventory and playername may be overwritten by server if clientId exists on server
            }
        };
        //Network.socket.emit ('playerConnected',data); // let the server know we're here.
        
        // Bind network functions that we'll be able to receive 
//        Network.socket.on ('initializePlayer', function (data) {
//            console.log("%c Init player:"+JSON.stringify(data.player),"color:#f70");
//            console.log("%c Network player init success ("+Network.serverName+"), Object count:"+Object.keys(data.objects).length,"color:#f7f");
//            if (false && network) ObjectRegistry.createObjectsForNewPlayer(data.objects);
//            Network.sessionId = data.player.sessionId;
//            playerNameElement.text = data.player.properties.playerName;
//            Network.playerName = data.player.properties.playerName;
//            Network.initialized = true;
//            const inventoryProps = data.player.properties.inventory;
//            Game.inventory.setProperties(data.player.properties.inventory);
//        });

//        Network.socket.on ('serverObjectsUpdate', function(data){ Network.ServerObjectsUpdate(data) });
//        Network.socket.on ('serverPlayersUpdate', function(data){ Network.ServerPlayersUpdate(data) });
//        Network.socket.on('sendServerObjectDataToClient',function(data){ ObjectRegistry.setObjectsInfoFromServer(data); });
//        Network.socket.on('sendDestroyedServerObjectDataToClient',function(data){ ObjectRegistry.updateDestroyedObjectsFromServer(data);});
//        Network.socket.on('authorityGranted',function(data){ ObjectRegistry.grantAuthority(data.objId,data.cb); this.requestAuthorityCallback();});
//        Network.socket.on('createObjectFromServer',function(data){ 
//            ObjectRegistry.createObjectFromServer(data) 
//        });
//        Network.socket.on('validateObjectCreatedFromServer',function(data){
//            ObjectRegistry.validateObjectCreatedFromServer(data) 
//        });
//        Network.socket.on('destroyObject',function(data){ 
//            ObjectRegistry.destroyObject(data)
//        });
//        Network.socket.on('serverDebug',function(data){ 
        //    Game.debugText.text=data.message 
//        });
//        Network.socket.on('setOwnership',function(data){ 
//            ObjectRegistry.setOwnership(data)
//        });
//        Network.socket.on('serverUpdatesObjectData',function(data){
//             if (data.objectsList.length > 0){
//                ObjectRegistry.updateMovedObjects(data.objectsList);
//
//             }
//        });
//        Network.socket.on('serverApprovesCollisionForClient',function(data){
//            NumberInfo.ResolveCollision(data); // just create the result only
//        });
//        Network.socket.on('setObjectVelocity',function(data){
//            ObjectRegistry.setObjectVelocity(data);
//        });
    },
    destroyObject(objId){
        const data = { objId : objId };
//        Network.socket.emit('requestDestroy',data);
        if (Network.Settings.ClientSidePrediction == true){
            ObjectRegistry.destroyObject(data)
        }
    },
    requestOwnership(data){
        console.log("Yepper");
        // data.playerName = Network.playerName;
        data.clientId = clientId;
//        Network.socket.emit('clientRequestOwnership',data);
    },
    releaseOwnership(data){
        data.playerName = Network.playerName;
        data.clientId = clientId;
//        Network.socket.emit('clientReleaseOwnership',data);
    },
    requestCreation(data){
//        Network.socket.emit('clientRequestCreation',data); 
    },
    killAll(){
//        Network.socket.emit('killAll');
    },
    SetupDebugTowerEntityForNetworking(){
    // debug object for Network info
        const playersTowerGroup = new pc.Entity("PlayerTower");
        pc.app.root.addChild(playersTowerGroup);
        playersTowerGroup.moveTo(new pc.Vec3(10,5000,-40));
        const playersTower = Utils.Cube({
            scale:new pc.Vec3(6,20,0.1),
            color:new pc.Color(0.3,1,0.3)
        });
        playersTowerGroup.addChild(playersTower);
        playersTower.setLocalPosition(0,0,0);
        Game.playersTowerText = Utils.AddText({
            color:new pc.Color(0.2,0,0.2),
            text:"Players:",
            parent:playersTowerGroup,
            localPos:new pc.Vec3(0,9,0.2),
            scale:0.12
        });
        
    },

    pickupRequestCallback : null,
    requestPickup(objId,callback){
        pickupRequestCallback = callback;
//        Network.socket.emit('requestPickup',{objId:objId,clientId:clientId});
    }, ServerPlayersUpdate(data){
//        console.log("server players update:"+JSON.stringify(data));
        var playerList = "";
        data.players.forEach(x => {
            // console.log(JSON.stringify(x.properties.position));
            if (x.properties.position == undefined){
                console.log("UN?"+JSON.stringify(x));
                return;
            }
            var pos = JsonUtil.JsonToVec3(x.properties.position);
            const idleTime = Date.now() - x.lastActiveTime; 
            const idleText = idleTime > 100 ? ": idleT:"+idleTime+"\n" : ": active";
            playerList += x.properties.playerName+idleText;
            if (x.clientId == clientId){
 //               console.log("me found!");
            } else {
                if (Network.otherPlayers[x.clientId] == null){
                    // Server gave a player, we Didn't find player in our local clients list, add it now.
                    //console.log("x:"+JSON.stringify(x));
                    const obj = { 
                        position:JsonUtil.JsonToVec3(pos), 
                        entity : Network.createOtherPlayerEntity(x.properties.playerName),
                        heldItemTemplateName : x.properties.inventory.heldItem.templateName,
                        heldItemProperties : x.properties.inventory.heldItem.properties,
                        };
                    Network.otherPlayers[x.clientId] = obj;
                   // Network.addOtherPlayerEntity(x.clientId,obj);
                }

                // Check if moveto pos would telefrag me
                if (pc.Vec3.distance(pos,Game.player.getPosition()) < 1.5){
                    pos = new pc.Vec3().add2(pos, pc.Vec3.UP);   // move other "ghost" player up so it doesn't telefrag
                }
                Network.otherPlayers[x.clientId].entity.moveTo(pos);

                // If the templatename changed, then destroy old and create new
                const prevHeldItemTemplateName =Network.otherPlayers[x.clientId].heldItemTemplateName;
                const newHeldItemTemplateName = x.properties.inventory.heldItem.templateName;
                // console.log("X props:"+JSON.stringify(x));
                if (prevHeldItemTemplateName != newHeldItemTemplateName){
                //    console.log("Prev held item was:"+prevHeldItemTemplateName+", new:"+newHeldItemTemplateName);
                    Network.otherPlayers[x.clientId].heldItemTemplateName = newHeldItemTemplateName;
                    const prevHeldItemGfx = Network.otherPlayers[x.clientId].heldItemGfx;
                    if (prevHeldItemGfx) { prevHeldItemGfx.destroy(); }
                    if (newHeldItemTemplateName != "None") {
                        Network.otherPlayers[x.clientId].heldItemGfx = Game.Instantiate[newHeldItemTemplateName]({
                            network : false,
                            position : x.properties.inventory.heldItem.position,
                            rotation : x.properties.inventory.heldItem.rotation,
                            localOnly : true,
                            gfxOnly : true,
                            numberInfo : x.properties.inventory.heldItem.numberInfo // relies on null value if not a number
                        });
                    }
                    if (x.properties.inventory.heldItem.numberInfo){
                        Network.otherPlayers[x.clientId].heldItemGfx.script
                    }
                }
                if (x.properties.inventory.heldItem.templateName != "None") {
                    const pos = JsonUtil.JsonToVec3(x.properties.inventory.heldItem.position);
                    const rot = JsonUtil.JsonToVec3(x.properties.inventory.heldItem.rotation);
                    var heldGfx = Network.otherPlayers[x.clientId].heldItemGfx;
                    if (!heldGfx){
                        // existing player did not already have a heldGfx, instantiate it.
                        Network.otherPlayers[x.clientId].heldItemGfx = Game.Instantiate[newHeldItemTemplateName]({
                            network : false,
                            position : x.properties.inventory.heldItem.position,
                            rotation : x.properties.inventory.heldItem.rotation,
                            localOnly : true,
                            gfxOnly : true});
                        heldGfx = Network.otherPlayers[x.clientId].heldItemGfx;
                    }
                    if (!heldGfx ){
                        //console.log("fail:"+newHeldItemTemplateName);
                    } else {
                        heldGfx.moveTo(pos,rot);
                    }
                }

            }
            Game.playersTowerText.element.text = "Server:\n"+Network.serverName+"\n\nPlayers:\n"+playerList;
        });
    }, addOtherPlayerEntity(key,obj){
      //  Network.otherPlayers[key] = obj;
    }, createOtherPlayerEntity(name){
       const other = Utils.Cubec(pc.Vec3.ZERO.add(pc.Vec3.onUnitSphere().flat().normalize().mulScalar(1.5)),Utils.RandomColor);
       const nameText = Utils.AddText({text:name,localPos:pc.Vec3.UP,scale:0.1,parent:other});
       nameText.addComponent('script');
       nameText.script.create('alwaysFaceCamera',{attributes:{reverse:true}});
       nameText.name="NameText";
       return other;
    }, clientReportCollisionPair(data){
        if (Network.Settings.ClientSidePrediction == true){
            NumberInfo.TryResolveCollision(data); // just create the result only
        } else {
            
//           Network.socket.emit('clientReportCollisionPair',data);

        }
    }, registerClientSidePrediction(data){
        // hmm
        this.clientSidePredictions.push(data);
        /*
            {
                objId : "asdf123bcde2345",
                predictedAction : [ 'move','destroy','create' ],
                
            }
        */
    }, update(dt){
        // Now that I have your attention
        // Currently, there is an ownership issue where after release of ownership, ownership is regained via postClientDataToServer fn. 
        // We need to make sure this fn does not overwrite the ownerid of the server.
        if (!Network.initialized){
            return;
        }
//        Network.socket.emit('updatePlayerByVisitorId',{
            // let the server know we're here, send our inventory
//            clientId:clientId,
//            properties:{
//                position:Network.playerEntity.getPosition().trunc(),
//                inventory:Network.playerEntity.script.inventory.getProperties(),
//                playerName:Network.playerName
//            }
//
//        });
        // request data from server about other objects.
//        Network.socket.emit ('requestServerPlayersUpdate'); 
      
        // request positions of objects owned by others.
        const gap = Date.now() - this.lastUpdateTime;
        this.lastUpdateTime = Date.now();
        const wasIdle = gap > 100;
        const includeObjsWithoutOwner = wasIdle ? true : false;
        // if (wasIdle) console.log("%c IDLE DETECTED! ", "color:cyan");
//        Network.socket.emit('clientRequestsObjectData',{clientId:clientId, includeObjsWithoutOwner:includeObjsWithoutOwner}); 
       
        const clientObjs=ObjectRegistry.getClientOwnedObjects;
        if (clientObjs.length > 0){
//            Network.socket.emit('clientSendClientOwnedObjectData', { 
//                objects:clientObjs,
//                clientId:clientId
//            }); 
        }
    }, 

};
console.log("%c Network connecting to:"+Network.serverName,"color:#9f9");

