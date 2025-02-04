/*
### NUMBER INFO
- lives on any instance of a number in game
- handles fraction text display, collision detection, collision resolution
*/

var NumberInfo = pc.createScript('numberInfo');
NumberInfo.attributes.add('moveSpeed', { type: 'number', default: 4, title: 'Move Speed' });
NumberInfo.attributes.add('ints', { type: 'entity', array:true });
NumberInfo.attributes.add('destroyFxFn', { type:'object'});
NumberInfo.attributes.add('ignoreCollision', { type:'boolean', default: false});
NumberInfo.attributes.add('allowCombination', { type: 'boolean', default: true, });
NumberInfo.attributes.add('fraction', { type: 'object' });

NumberInfo.Shape = {
    Sphere : "Sphere",
    Cube : "Cube",
    None : "None",
}

NumberInfo.prototype.initialize = function() {
}


// NumberInfo.prototype.get numberType() { return "Sphere" };

NumberInfo.prototype.Setup = function() {
    Object.defineProperty(this,'numberType', {get: function(){
        if (this.entity.render === undefined){
            return NumberInfo.Shape.None;
        } else {
            switch(this.entity.render.type){
                case 'box':return NumberInfo.Shape.Cube;
                case 'sphere':return NumberInfo.Shape.Sphere;
                default: return "Uh oh";
                
            }
        }
    }})

    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
    if (this.fraction == null) this.fraction = new Fraction(2,1); // dislike!!!
    this.cubeSize = this.entity.getLocalScale().x;
    if (this.numberType == NumberInfo.Shape.Cube){
        let d = this.cubeSize / 2 + 0.03;
        this.int1 = this.createTextEntity('Text1', new pc.Vec3(0, 0, d));
        this.int2 = this.createTextEntity('Text2', new pc.Vec3(d, 0, 0));
        this.int3 = this.createTextEntity('Text3', new pc.Vec3(0, d, 0));
        this.int4 = this.createTextEntity('Text4', new pc.Vec3(0, 0, -d));
        this.int5 = this.createTextEntity('Text5', new pc.Vec3(-d, 0, 0));
        this.int6 = this.createTextEntity('Text6', new pc.Vec3(0, -d, 0));    
        this.ints = [this.int1,this.int2,this.int3,this.int4,this.int5,this.int6,];
    } else if (this.numberType == NumberInfo.Shape.Sphere) {
        this.pivot = new pc.Entity("numPivot");
        this.entity.addChild(this.pivot);
        this.int1 =  Utils.AddText( { 
            color:this.getColor(),
            parent:this.pivot,
            scale:0.10,
            localPos:new pc.Vec3(0,0,0.59),
        });
        this.pivot.addComponent('script');
        this.pivot.script.create('alwaysFaceCamera',{attributes:{reverse:true,useRadius:true,radius:16}});
        this.entity.script.create('rigidbodySleep',{attributes:{radius:200}});
        this.ints = [this.int1];
        Game.int1 = this.int1;

        // Can we PLEASE move the "text" to its own shader so that we don't need Update loop checking 1,000,000 numbers every frame to see if they need to face the player? @Eytan #Performance

    } else if (this.numberType == NumberInfo.Shape.Hoop) {
        // Let the hoop add its own text
        //console.log("Hoop detected");
    } else {
        console.log('shapeless');
    }
}



NumberInfo.prototype.getColor = function(){
    
    return this.fraction.numerator < 0 ? pc.Color.WHITE : pc.Color.BLACK;
}

NumberInfo.prototype.createTextEntity = function(name,pos){
   let entity = new pc.Entity(name);
   this.entity.addChild(entity);
   entity.setLocalPosition(pos);
   let scale = 0.05;
   entity.setLocalScale(new pc.Vec3(1,1,1).mulScalar(scale));
    entity.addComponent('element', {
        type: 'text',
        // The text
        layers:[pc.LAYERID_WORLD],
        text: this.fraction.asString(),
        // Color of the text
        color: pc.Color.BLACK,
        // Align text to the center of the entity
        anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
        pivot: new pc.Vec2(0.5, 0.5),
        // Set a font size
        fontSize: 16,
        fontAsset: assets.fonts.montserrat,
    });
    // Rotate the text entity
    if (pos.x > 0) {
        entity.setLocalEulerAngles(0, 90, 0);
    } else if (pos.x < 0) {
        entity.setLocalEulerAngles(0, -90, 0);

    } else if (pos.y > 0) {
        entity.setLocalEulerAngles(-90, 0, 0);
    } else if (pos.y < 0) {
        entity.setLocalEulerAngles(90, 0, 0);
    } else if (pos.z > 0) {
        entity.setLocalEulerAngles(0, 0, 0);
    } else if (pos.z < 0) {
        entity.setLocalEulerAngles(0, 180, 0);
    }
    return entity;

};

NumberInfo.prototype.setObjectProperties = function(properties, context){
    context.fraction = properties.fraction;
    context.updateNumberText(properties, context);
};

NumberInfo.prototype.updateNumberText  = function(properties, context){
    for(var i=0; i< context.ints.length; i++){
        var int1 = context.ints[i];
        int1.element.text = properties.fraction.numerator;
    }
};



NumberInfo.prototype.onCollisionStart = function (result) {
    if (this.ignoreCollision || result.other.script?.numberInfo?.ignoreCollision) return;
    this.OfflineCollision(result);


    // PROBLEM (dislike): Two clients see the same two numbers collide. 
    // Due to client side prediction, both clients predict a new # created (with different objId).
    // Server recevies this cSP from BOTH clients and creates tWO numbers.
    // As a result, client creates one number by CSP, server sends that creation event which is ignored (matching objId)
    // As a result, server sends another number to same client due to a different client reporting it, no matching objId
    // Fundamentally, a collision produces two different objId results on two different clients which needs to be resolved
    // our hacky solution: don't allow collisions to occur unless all numbers are validated/reconciled by server
    // Additionally, for server creation events as a result of two collisions, we need to check the parents to validate that it won't be duplicated on another client.
    // because we only allow ONE collision to happen with ONE of the two numbers created by client (after just thrown), server can ALWAYS guarantee that parents of a collided created number are the same for both clients, and so clients can avoid double creation for the child of those two parents.

    if (false && network){
        NumberInfo.NetworkCollision(result);
    } else {
    }
}

NumberInfo.prototype.OfflineCollision = function (result){
//    console.log("COL.");
    //console.log(result);
    const resultNi = result.other?.script?.numberInfo;
    if (this.allowCombination && resultNi && resultNi.allowCombination){
        this.entity.enabled = false;
    
        NumberInfo.ResolveCollisionOffline({obj1:this.entity,obj2:result.other});
    } else {
        // console.log('no ni:"'+resultNi+", alow:"+this.allowCombination+", resl al:"+resultNi?.allowCombination);
    }

}

NumberInfo.ResolveCollisionOffline = function(data){
    const {obj1,obj2} = data;
    data.objId1 = obj1.getGuid();
    data.objId2 = obj2.getGuid();
    var detectedIndex = -1;
    //console.log("try w count "+NumberInfo.collisionPairs.length+"from : "+data.objId1.substr(0,5)+","+data.objId2.substr(0,5));
    NumberInfoManager.collisionPairs.forEach(pair => {
        if ((pair[0] == data.objId1 && pair[1] == data.objId2) || (pair[0] == data.objId2 && pair[1] == data.objId1)){
            //console.log("pair detected!");
            detectedIndex = NumberInfoManager.collisionPairs.indexOf(pair);
        } else {
            //console.log("nopair");
        }
    });
    if (detectedIndex == -1){
        NumberInfoManager.collisionPairs.push([data.objId1,data.objId2]);
        //console.log("detected: "+detectedIndex);
     } else {
        // Successful number combination

        // get resulting number and produce it
        const collisionResult = NumberInfoManager.GetCollisionResolutionOffline({obj1:obj1,obj2:obj2});
        NumberInfo.ProduceCollisionResult(collisionResult);
       
        // destroy collided objects, remove them from collisionPairs
        NumberInfoManager.collisionPairs.splice(detectedIndex,1);
        obj1.destroy();
        obj2.destroy();

    }
}
NumberInfo.ProduceCollisionResult = function(collisionResult){
    
    const templateName = collisionResult.templateNameToClone;
    const maxNumber = collisionResult.maxNumber;
    const options = {
        position : JsonUtil.JsonToVec3(collisionResult.position),
        rotation : JsonUtil.JsonToVec3(collisionResult.rotation),
        rigidbodyType : collisionResult.rigidbodyType,
        rigidbodyVelocity : collisionResult.resultVelocity,
        numberInfo : {fraction : collisionResult.resultFrac },
//        extraScripts : [{scriptName:'sinePop',scriptAttributes:{popTime:2},expirationDate:Date.now()+1500}],
    }
    if (options.numberInfo.fraction.numerator == 0) {
        NumberInfo.destroyNumberFx({position:options.position,maxNumber:maxNumber});
    } else {
        // console.log("Sinepop:"+templateName);
        const result = Game.Instantiate[templateName](options); // TODO: Replace with Promise return
        result.script.create('sinePop');

        // Awkward way to propagate "destroy after seconds" which was detected if both parent numbers had destroyAfterSEconds
        if (collisionResult.destroyAfterSecondsScript){
            result.script.create('destroyAfterSeconds',{attributes:{seconds:collisionResult.destroyAfterSeconds}});
        }

        AudioManager.play({source:assets.sounds.numberEat,position:options.position,positional:true,refDist:20});
    }


}
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


NumberInfo.networkCollisionPairs = [];

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

NumberInfo.ResolveCollision = function(data){
    const collisionResult = data.collisionResult;
    //console.log("resolve collision");
    
    const templateName = collisionResult.templateNameToClone;
    const options = {
        position : JsonUtil.JsonToVec3(collisionResult.position),
        rigidbodyType : collisionResult.rigidbodyType,
        rigidbodyVelocity : collisionResult.resultVelocity,
        numberInfo : {fraction : collisionResult.resultFrac },
//        extraScripts : [{scriptName:'sinePop',scriptAttributes:{popTime:2},expirationDate:Date.now()+1500}],
    }
    if (options.numberInfo.fraction.numerator == 0) {
        //Fx.Shatter({position:options.position});  // network??
        //AudioManager.play({source:assets.sounds.shatter});// depends on audiomanager instance?
    } else {
        //console.log("Sinepop");
        options.ancestors = [data.objId1,data.objId2];
        const result = Network.Instantiate[templateName](options); // TODO: Replace with Promise return
        result.script.create('sinePop');
        AudioManager.play({source:assets.sounds.numberEat,position:options.position});
    }
}


NumberInfo.prototype.setFractionAfterSeconds = function(fraction, ms){
    if (this.setFractionAfterSecondsTimeout) clearTimeout(this.setFractionAfterSecondsTimeout);
    const $this = this;
    this.setFractionAfterSecondsTimeout = setTimeout(function(){
        $this.entity.script.create('sinePop');
        $this.setFraction(fraction);
    },ms);
}

NumberInfo.destroyNumberFx = function(options={}){
    // BUG - it only shows "distortion" at ONE of the places at a time and not multiple
    // so 1 - 1 = 0 produces expected distortion
    // but a -1 rocket into a wall of 1s does not produce distortion
    const { position, maxNumber=1 }=options;
    Fx.Shatter({position:position});  // network??
    const pos = position;
    const slowFactor = 1.5 - (0.1 * Math.log10(1.0+maxNumber)); // log10 1=0, 10=1, 100=2, 1000=3
    const strength = 0.4 + Math.log10(Math.log10(Math.log10(100.0 + maxNumber)));
    const duration = 0.6 + Math.log10(maxNumber); // larger numbers should oscillate and have 2-3 "bounces" as fabric settles
    const blackHoleRadius = Math.log10(maxNumber) / maxNumber;
    const maxDist = 1.5 + Math.log10(maxNumber); // + Math.log2(maxNumber),
    const opts = {
        x : pos.x,
        y : pos.y,
        z : pos.z,
        strength : strength,
        slowFactor : slowFactor,//Math.min(1.5,1.0 / Math.log10(1.0 + maxNumber)),
        duration : duration, 
        blackHoleRadius : blackHoleRadius, 
        maxDist : maxDist,
    }
    warpFxByPointManager.addMat3(opts);
    AudioManager.play({source:assets.sounds.vorpalVortex,volume:1.0,positional:true,position:position});// depends on audiomanager instance?
        // console.log('mn:'+maxNumber);

}

NumberInfo.prototype.setFraction = function(fraction){
    this.fraction = fraction;
    if (this.fraction.numerator == 0){
        NumberInfo.destroyNumberFx({position:this.entity.getPosition().clone(),maxNumber:Math.abs(this.numerator)});

        this.entity.destroy();
    } else {
        const texts = this.entity.getComponentsInChildren('element');
        this.ints.forEach(x => {
            texts.push(x.element);
        })
        for(let i=0;i<texts.length;i++){
            // bug - because of setFractionAfterSeconds, it fails to find text after text was rebuilt once.
            if (!texts[i]) return;
            texts[i].color = this.getColor();
            texts[i].text=this.fraction.asString();
        }
      
       this.entity.render.meshInstances[0].material = this.fraction.numerator < 0 ? Materials.celBlack : Materials.celWhite;
       this.entity.render.meshInstances[0].material.update();
    }
}
    
NumberInfo.CollisionPairs = {};
NumberInfo.GetCollisionResolutionOffline = function(collisionData){
    const { obj1, obj2 } = collisionData;

    let midpoint = obj1.getPosition().clone().add(obj2.getPosition()).mulScalar(0.5);
    // Ensure kinematic wins in dynamic+kinematic combo
    let wasKin1 = false;
    let wasKin2 = false;
    if (obj1.rigidbody && obj1.rigidbody.type == pc.RIGIDBODY_TYPE_KINEMATIC) {
        midpoint = obj1.getPosition();
        wasKin1 = true;
    } else if (obj2.rigidbody && obj2.rigidbody.type == pc.RIGIDBODY_TYPE_KINEMATIC) {
        midpoint = obj2.getPosition();
        wasKin2 = true;
    }
    const rbType = (wasKin1 || wasKin2) ? pc.RIGIDBODY_TYPE_KINEMATIC : pc.RIGIDBODY_TYPE_DYNAMIC;
    const templateNameToClone = wasKin1 ? obj1.name : obj2.name; // object name is set to templateName in Game.Instantiate, should be stored on an objectInfo script, it is stored in networkObjectInfo but we're offline so shrugg 
    const rot = wasKin1 ? obj1.getEulerAngles() : wasKin2 ? obj2.getEulerAngles : pc.Vec3.ZERO;

    // Did both numbers have "destroy after seconds"? If so, this new one has it too
    const destroyAfterSecondsScript = (obj1.script.destroyAfterSeconds && obj2.script.destroyAfterSeconds) ? true : false;
    const destroyAfterSeconds = destroyAfterSecondsScript ? Math.max(obj1.script.destroyAfterSeconds.seconds,obj2.script.destroyAfterSeconds.seconds) : 0;

    // If two objs collide and one wasn't pick-uppable, then the result is not pick-uppable
    let pickup = true;
    if (!obj1.script.pickUpItem || !obj2.script.pickUpItem) pickup = false;
    var resultVelocity = pc.Vec3.ZERO;
    if (obj1.rigidbody?.type == pc.RIGIDBODY_TYPE_DYNAMIC && obj2.rigidbody?.type == pc.RIGIDBODY_TYPE_DYNAMIC) {
        resultVelocity = obj1.rigidbody.linearVelocity.clone().add(obj2.rigidbody.linearVelocity).mulScalar(0.5);
    }


    // Determine resulting frac from add
    const frac1 = obj1.script.numberInfo.fraction;
    const frac2 = obj2.script.numberInfo.fraction;
    const resultFrac = Fraction.Add(frac1,frac2);
    const resultData = {
        resultFrac : resultFrac,
        rigidbodyType : rbType,
        resultVelocity : resultVelocity,
        templateNameToClone : templateNameToClone,
        rotation : rot,
        position : JsonUtil.Vec3ToJson(midpoint), // because we pass to server and back, server prefers json over vec3 obj
        maxNumber : Math.abs(frac1.numerator/frac1.denominator),
        destroyAfterSecondsScript : destroyAfterSecondsScript,
        destroyAfterSeconds : destroyAfterSeconds,
    }
    //console.log(resultData);
    return resultData;
}

NumberInfo.GetCollisionResolution = function(collisionData){
    const { obj1, obj2 } = collisionData;

    let midpoint = obj1.getPosition().clone().add(obj2.getPosition()).mulScalar(0.5);
    // Ensure kinematic wins in dynamic+kinematic combo
    let wasKin1 = false;
    let wasKin2 = false;
    if (obj1.rigidbody && obj1.rigidbody.type == pc.RIGIDBODY_TYPE_KINEMATIC) {
        midpoint = obj1.getPosition();
        wasKin1 = true;
    } else if (obj2.rigidbody && obj2.rigidbody.type == pc.RIGIDBODY_TYPE_KINEMATIC) {
        midpoint = obj2.getPosition();
        wasKin2 = true;
    }
    const rbType = (wasKin1 || wasKin2) ? pc.RIGIDBODY_TYPE_KINEMATIC : pc.RIGIDBODY_TYPE_DYNAMIC;
    const templateNameToClone = wasKin1 ? obj1.script.networkObjectInfo.objectProperties.templateName : obj2.script.networkObjectInfo.objectProperties.templateName; // dislike cloning one of the two, just make a fresh one?

    // If two objs collide and one wasn't pick-uppable, then the result is not pick-uppable
    let pickup = true;
    if (!obj1.script.pickUpItem || !obj2.script.pickUpItem) pickup = false;
    var resultVelocity = pc.Vec3.ZERO;
    if (obj1.rigidbody?.type == pc.RIGIDBODY_TYPE_DYNAMIC && obj2.rigidbody?.type == pc.RIGIDBODY_TYPE_DYNAMIC) {
        resultVelocity = obj1.rigidbody.linearVelocity.clone().add(obj2.rigidbody.linearVelocity).mulScalar(0.5);
    }
    // Determine resulting frac from add
    const frac1 = obj1.script.numberInfo.fraction;
    const frac2 = obj2.script.numberInfo.fraction;
    const resultFrac = Fraction.Add(frac1,frac2);
    const resultData = {
        resultFrac : resultFrac,
        rigidbodyType : rbType,
        resultVelocity : resultVelocity,
        templateNameToClone : templateNameToClone,
        position : JsonUtil.Vec3ToJson(midpoint), // because we pass to server and back, server prefers json over vec3 obj
    }

    return resultData;
}

NumberInfo.prototype.setProperties = function(properties){
    if (properties.numberInfo) {
        this.setFraction(JsonUtil.JsonToFraction(properties.numberInfo.fraction));
    } else {
        //console.log("FAIL set props on ni:"+JSON.stringify(properties));
    }
}

NumberInfo.prototype.getProperties = function(properties){
    properties.numberInfo = {
        fraction: this.fraction,
    }
    return properties;
}

Fraction.getFractionAsString = function(fraction){
    return fraction.denominator == 1 ? fraction.numerator : fraction.numerator + "/" + fraction.denominator;

}
