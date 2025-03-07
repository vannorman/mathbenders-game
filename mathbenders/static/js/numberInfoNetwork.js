    // PROBLEM (dislike): Two clients see the same two numbers collide. 
    // Due to client side prediction, both clients predict a new # created (with different objId).
    // Server recevies this cSP from BOTH clients and creates tWO numbers.
    // As a result, client creates one number by CSP, server sends that creation event which is ignored (matching objId)
    // As a result, server sends another number to same client due to a different client reporting it, no matching objId
    // Fundamentally, a collision produces two different objId results on two different clients which needs to be resolved
    // our hacky solution: don't allow collisions to occur unless all numbers are validated/reconciled by server
    // Additionally, for server creation events as a result of two collisions, we need to check the parents to validate that it won't be duplicated on another client.
    // because we only allow ONE collision to happen with ONE of the two numbers created by client (after just thrown), server can ALWAYS guarantee that parents of a collided created number are the same for both clients, and so clients can avoid double creation for the child of those two parents.

NumberInfo.prototype.NetworkCollision = function (result){
    const resultNi = result.other?.script?.numberInfo;
    const noiOther = result.other?.script?.networkObjectInfo;
    const noiSelf = this.entity.script.networkObjectInfo;
    const puiOther = result.other?.script?.pickUpItem;
    const puiSelf = this.entity.script.pickUpItem;
    if (!noiSelf || !noiOther) return;
    const serverValidationOther = noiOther.serverValidated;
    const serverValidationSelf = noiSelf.serverValidated;
    const bothValid = serverValidationOther == true && serverValidationSelf == true;
    const justThrownThreshold = 2000;
    const numberWasJustThrown = (Date.now() - puiSelf?.lastThrownTime) < justThrownThreshold || (Date.now() - puiOther?.lastThrownTime) < justThrownThreshold;
    if (!bothValid && !numberWasJustThrown){
        // don't allow collision unless both objects are validated OR unless we just threw one of the two objects.
//        console.log(noiOther.objectProperties.objId.substr(0,4)+" val:"+noiOther.objectProperties.serverValidated);
        const valText = serverValidationSelf == false ? noiOther.objId.substr(0,4) : noiSelf.objId.substr(0,4);
        //console.log("%c "+valText+" invalid, not colliding. hmf. ","color:red");
        return;
    }
    if (this.allowCombination && resultNi && resultNi.allowCombination){
        this.entity.enabled = false;
        const objId1 = this.entity.script.networkObjectInfo?.objId;
        const objId2 = result?.other?.script?.networkObjectInfo?.objId;
        // Network collision
        if (objId1 != null && objId2 != null){
            const collisionResult = NumberInfo.GetCollisionResolution({
                obj1:this.entity,
                obj2:result.other,
            });
            //console.log("collide: "+objId1.substr(0,5)+", "+objId2.substr(0,5));
            Network.clientReportCollisionPair({
                objId1:objId1,
                objId2:objId2,
                collisionResult: collisionResult
            });
        }
    }
};

NumberInfo.TryResolveCollision = function(data) {
    var detectedIndex = -1;
    //console.log("try w count "+NumberInfo.networkCollisionPairs.length+"from : "+data.objId1.substr(0,5)+","+data.objId2.substr(0,5));
    NumberInfo.networkCollisionPairs.forEach(pair => {
        if ((pair[0] == data.objId1 && pair[1] == data.objId2) || (pair[0] == data.objId2 && pair[1] == data.objId1)){
            //console.log("pair detected!");
            detectedIndex = NumberInfo.networkCollisionPairs.indexOf(pair);
        } else {
            //console.log("nopair");
        }
    });
    if (detectedIndex != -1){
        //console.log("detected: "+detectedIndex);
        NumberInfo.ResolveCollision(data);
        Network.destroyObject(data.objId1); // ooh gettin' messy
        Network.destroyObject(data.objId2);
        NumberInfo.networkCollisionPairs.splice(detectedIndex,1);
    } else {
        //console.log("added: "+data.objId1.substr(0,5)+","+data.objId2.substr(0,5));
        NumberInfo.networkCollisionPairs.push([data.objId1,data.objId2]);
    }
}


