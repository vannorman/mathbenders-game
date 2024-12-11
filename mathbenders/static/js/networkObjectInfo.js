const NetworkObjectInfo = pc.createScript("networkObjectInfo");
NetworkObjectInfo.attributes.add('objId', { type: 'string' });
NetworkObjectInfo.attributes.add('ownerId', { type: 'string' });
NetworkObjectInfo.attributes.add('previousOwnerId', { type: 'string' });
NetworkObjectInfo.attributes.add('objectProperties', { type: 'object' }); // as it's instantiated with specific options like scale, save these options for serializing this object later.
NetworkObjectInfo.attributes.add('serverValidated', { type: 'boolean', default:false}); 
NetworkObjectInfo.attributes.add('ancestors', { type: 'string', array:true});

NetObjState = {
    NoOwner             : "NoOwner",
    RequestingOwnership : "RequestingOwnership",
    Owned               : "Owned",
    ReleasingOwnership  : "ReleasingOwnership",
}

NetworkObjectInfo.prototype.hasStaleOwner = function(){
    return this.ownerId != "None";
}


NetworkObjectInfo.prototype.initialize = function(){
    this.releasingOwnershipTimer = 0;
    this.lastEnabledTime = Date.now();
    this.entity.on("state", function (enabled) { 
        if (enabled) this.lastEnabledTime = Date.now();
    });

    this.debugText = Utils.AddTextFloater({floaterOffset:new pc.Vec3(0,2.0,0),color:new pc.Color(1.0,0.8,0.8),text:"debug",parent:this.entity,localPos:pc.Vec3.ZERO,scale:0.07}).element;
    this.debugText.entity.addLabel('debugText');
    this.debugText.entity.enabled=false;
   cb = this.entity;

    this.nowPos = this.entity.getPosition();
    this.lastPos = this.entity.getPosition();
    this.setNetObjState(NetObjState.Owned,"init");
};

NetworkObjectInfo.prototype.setNetObjState= function(newState,src="?"){
//    console.log("Set:"+newState+", from;"+src);
    // Note that the objState itself is currently local only, not shared / synced to network.
    return;
    this.objState = newState;
    switch(newState){
        case NetObjState.NoOwner: 
            break;
        case NetObjState.RequestingOwnership: 
            Network.requestOwnership({objId:this.objId});

            // this.fire("ClientRequestOwnershipObj",this.entity); 
            break;
        case NetObjState.Owned:
            if (this.ownerId != clientId){
                console.log("owned but req");
                Network.requestOwnership({objId:this.objId});
            } else {
                console.log("owned by me");
            }
            break;
        case NetObjState.ReleasingOwnership: 
            this.releasingOwnershipTimer = 0.1;
            Network.releaseOwnership({objId:this.objId});
            // this.fire("ClientReleaseOwnershipObj",this.entity); 
            break;
    }

};


NetworkObjectInfo.prototype.update = function(dt){

    // Check if player is close by some thresholdRadiusius, and preemptively ask for control 
    const distToPlayer = pc.Vec3.distance(Game.player.getPosition(),this.entity.getPosition());
    const thresholdRadius = 1.5;

    return;
    switch(this.objState){
        case NetObjState.NoOwner: 
            // If player gets close, request control for that player
            if (distToPlayer < thresholdRadius){
                this.setNetObjState(NetObjState.RequestingOwnership);
            }
            break;
        case NetObjState.RequestingOwnership: 
        case NetObjState.Owned: 
            // If owned, only release ownership if entity is enabled (not inventoried), dist to player is far, movement is low, 
            if (this.entity.enabled == true && distToPlayer > thresholdRadius && !this.objWasMoving()) {
                  
                this.setNetObjState(NetObjState.ReleasingOwnership,"upds");
            }
            break;
        case NetObjState.ReleasingOwnership:
            this.releasingOwnershipTimer -= dt;
            if (this.releasingOwnershipTimer < 0){
                // stuck? try releasing ownership again.
                this.setNetObjState(NetObjState.ReleasingOwnership,"retry");
            }
            break;
    }

    this.debugText.text = this.objState + "\n" + this.ownerId.substr(0,6) + "\n" + this.entity.getPosition().clone().trunc();
};
NetworkObjectInfo.prototype.objWasMoving = function(){
    if (this.entity.rigidbody) {
        const timeSinceEnabled = Date.now() - this.lastEnabledTime;
        const enabledThresholdCrossed = 50;
        const speed = this.entity.rigidbody.linearVelocity.length();
        return timeSinceEnabled < enabledThresholdCrossed || speed > .001;
    } else {
        return false;
    }
    /*
    this.nowPos = this.entity.getPosition();
    const movementThisFrame = pc.Vec3.distance(this.nowPos.clone(),this.lastPos.clone());
    this.lastPos = this.nowPos.clone();
    const thresholdMovement = .001;
    const wasMoving = movementThisFrame > thresholdMovement;
    console.log("Moving:"+wasMoving);
    return wasMoving;*/
}

NetworkObjectInfo.prototype.setObjectProperties = function(properties){
    const subProperties = this.entity.getScriptsWithAttribute('setProperties');
    subProperties.forEach(x => {
        x.setProperties(properties);
        // ni.setFraction(JsonUtil.JsonToFraction(props.numberInfo.fraction));
    });
    if (this.entity.rigidbody) {
        this.entity.rigidbody.type = properties.rigidbodyType;
    }
    this.entity.setPosition(JsonUtil.JsonToVec3(properties.position));
    this.entity.setEulerAngles(JsonUtil.JsonToVec3(properties.rotation));
    this.entity.enabled = properties.enabled;
}

NetworkObjectInfo.prototype.getObjectProperties = function(){
    var properties = this.objectProperties;
    subProperties = this.entity.getScriptsWithAttribute('getProperties');
    subProperties.forEach(x => {
        properties = x.getProperties(properties); // append / replace the existing properties
    });

    properties.position = JsonUtil.Vec3ToJson(this.entity.getPosition());
    properties.rotation = JsonUtil.Vec3ToJson(this.entity.getEulerAngles());
    properties.enabled = this.entity.enabled;
    const rigidbodyVelocity = this.entity.rigidbody ? JsonUtil.Vec3ToJson(this.entity.rigidbody.linearVelocity) : null;
    properties.rigidbodyVelocity = rigidbodyVelocity;
    
    


    return this.objectProperties;
}


