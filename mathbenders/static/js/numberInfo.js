var NumberInfo = pc.createScript('numberInfo');
NumberInfo.attributes.add('moveSpeed', { type: 'number', default: 4, title: 'Move Speed' });
NumberInfo.attributes.add('destroyFxFn', { type:'object'});
NumberInfo.attributes.add('ignoreCollision', { type:'boolean', default: false});
NumberInfo.attributes.add('fraction', { type: 'object' });
NumberInfo.attributes.add('type', { type: 'number', default: 1});

NumberInfo.Type = {
    Bullet : 0,
    Sphere: 1,
    Cube: 2,
    Creature : 3
};



NumberInfo.prototype.initialize = function() {
    
    this.destroyFxFn = function(x) {Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter})},

    this.entity.collision?.on('collisionstart', this.onCollisionStart, this);
    if (this.fraction == null) {
        console.log("%c ERROR: No frac on "+this.entity.getGuid(),"color:red;font-weight:bold;");
    }
   // this.fraction = new Fraction(7,1); // dislike!!!
    this.cubeSize = this.entity.getLocalScale().x;
    const zDelta = .05;
    if (this.type == NumberInfo.Type.Cube){
        let d = this.cubeSize / 2 + zDelta;
        this.int1 = this.createTextEntity('Text1', new pc.Vec3(0, 0, d));
        this.int2 = this.createTextEntity('Text2', new pc.Vec3(d, 0, 0));
        this.int3 = this.createTextEntity('Text3', new pc.Vec3(0, d, 0));
        this.int4 = this.createTextEntity('Text4', new pc.Vec3(0, 0, -d));
        this.int5 = this.createTextEntity('Text5', new pc.Vec3(-d, 0, 0));
        this.int6 = this.createTextEntity('Text6', new pc.Vec3(0, -d, 0));    
        this.ints = [this.int1,this.int2,this.int3,this.int4,this.int5,this.int6,];
    } else if (this.type== NumberInfo.Type.Sphere) {
        this.pivot = new pc.Entity("numPivot");
        this.entity.addChild(this.pivot);
        
        let sphereText = this.createTextEntity('Text1',pc.Vec3.ZERO);
        this.int1 = sphereText;
//        this.int1 =  Utils.AddText( { 
//            color:this.getColor(),
//            parent:this.pivot,
//            scale:0.10,
//            localPos:new pc.Vec3(0,0,0.59),
//        });
        this.pivot.addComponent('script');
        this.pivot.script.create('alwaysFaceCamera',{attributes:{reverse:true,useRadius:true,radius:16}});
        // this.entity.script.create('rigidbodySleep',{attributes:{radius:200}});
        this.ints = [this.int1];
        this.pivot.addChild(sphereText);
        const zDist = 0.52;
        sphereText.setLocalPosition(0,0,zDist);

        // Can we move the "text" to its own shader so that we don't need Update loop checking 1,000,000 numbers every frame to see if they need to face the player? @Eytan #Performance

    } else {
        console.log('shapeless');
    }

    this.setFraction(this.fraction);
}



NumberInfo.prototype.getColor = function(){
    
    return this.fraction.numerator < 0 ? pc.Color.WHITE : pc.Color.BLACK;
}

NumberInfo.prototype.createTextEntity = function(name, pos) {
    let entity = new pc.Entity(name);
    this.entity.addChild(entity);
    entity.setLocalPosition(pos);
    let scale = 0.05;
    entity.setLocalScale(new pc.Vec3(1,1,1).mulScalar(scale));
   // console.log(this.fraction); 
    // Create the main integer text
    entity.addComponent('element', {
        type: 'text',
        layers: [pc.LAYERID_WORLD],
        text: this.fraction.asString(),
        color: this.getColor(),
        anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
        pivot: new pc.Vec2(0.5, 0.5),
        fontSize: this.getFontSize(this.fraction.asString().toString()),
        fontAsset: assets.fonts.montserrat_bold,
    });
    // Create fraction elements if needed
    if (this.fraction.asString().toString().includes('/')) {
        // Create numerator
        let numerator = new pc.Entity('numerator');
        entity.addChild(numerator);
        numerator.setLocalPosition(0, 3.5, 0);
        let fontAsset = this.fraction.numerator > 0 ? assets.fonts.montserrat_bold : assets.fonts.montserrat;
        numerator.addComponent('element', {
            type: 'text',
            layers: [pc.LAYERID_WORLD],
            text: this.fraction.numerator.toString(),
            color: this.getColor(),
            anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
            pivot: new pc.Vec2(0.5, 0.5),
            fontSize: this.getFontSize(this.fraction.numerator.toString(),true),
            fontAsset: fontAsset,
        });

        // Create line
        let line = new pc.Entity('line');
        entity.addChild(line);
        const yPos = this.fraction.numerator > 0 ? 5 : 6;
        line.setLocalPosition(0, yPos, 0);
        line.addComponent('element', {
            type: 'text',
            layers: [pc.LAYERID_WORLD],
            text: '_',
            color: this.getColor(),
            anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
            pivot: new pc.Vec2(0.5, 0.5),
            fontSize: 15, //this.getFontSize('_'),
            fontAsset: fontAsset,
        });

        // Create denominator
        let denominator = new pc.Entity('denominator');
        entity.addChild(denominator);
        denominator.setLocalPosition(0, -4.5, 0);
        denominator.addComponent('element', {
            type: 'text',
            layers: [pc.LAYERID_WORLD],
            text: this.fraction.denominator.toString(),
            color: this.getColor(),
            anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
            pivot: new pc.Vec2(0.5, 0.5),
            fontSize: this.getFontSize(this.fraction.denominator.toString(),true),
            fontAsset: fontAsset,
        });


        // Store references to fraction elements
        this.fractionElements = {
            numerator: numerator,
            line: line,
            denominator: denominator
        };

        // Initially show fraction elements and hide integer
        this.updateFractionDisplay(entity, true);
    }

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

Game2={};
Game2.ft = 8;
Game2.fd = 1.5
Game2.it = 8;
Game2.id = 5;
NumberInfo.prototype.getFontSize = function(text, isFraction=false) {
    let s = 0;
    const len = text.length;
    if (isFraction) s = Math.max(3, Game2.ft - len * Game2.fd);
    else s = Math.max(12, Game2.it - len * Game2.id);
    return s;
};

NumberInfo.prototype.updateFractionDisplay = function(entity, isFraction) {
    if (this.fractionElements) {
        // Show/hide fraction elements
        this.fractionElements.numerator.enabled = isFraction;
        this.fractionElements.line.enabled = isFraction;
        this.fractionElements.denominator.enabled = isFraction;
        
        // Show/hide integer text
        entity.element.enabled = !isFraction;
    }
};

NumberInfo.prototype.updateNumberText = function() {
    const fractionString = this.fraction.asString().toString();
    const isFraction = fractionString.includes('/');
    
    for (let i = 0; i < this.ints.length; i++) {
        const textEntity = this.ints[i];
        
        if (isFraction) {
            // Update fraction elements
            if (this.fractionElements) {
                this.fractionElements.numerator.element.text = this.fraction.numerator.toString();
                this.fractionElements.numerator.element.fontSize = this.getFontSize(this.fraction.numerator.toString(),true);
                this.fractionElements.denominator.element.text = this.fraction.denominator.toString();
                this.fractionElements.denominator.element.fontSize = this.getFontSize(this.fraction.numerator.toString(),true);
                this.updateFractionDisplay(textEntity, true);
            }
        } else {
            // Update integer text
            textEntity.element.text = fractionString;
//            console.log("Fontsize:"+textEntity.element.
            textEntity.element.fontSize=this.getFontSize(this.fraction.numerator.toString());
            if (this.fractionElements) {
                this.updateFractionDisplay(textEntity, false);
            }
        }
    }
};


NumberInfo.prototype.onCollisionStart = function (result) {
    // if (this.ignoreCollision || result.other.script?.numberInfo?.ignoreCollision) return; //huh?
    this.OfflineCollision(result);
}


NumberInfo.GetCombinationHierarchyResult = function(ni1,ni2){
    let midpoint = ni1.entity.getPosition();
    let resultNi = ni1;
    let allowed = false;
    // console.log(ni1.type+","+ni2.type);
    switch(ni1.type){
        case NumberInfo.Type.Bullet:
            switch(ni2.type){
                case NumberInfo.Type.Bullet: 
                    if (ni1.entity.rigidbody.linearVelocity.length() > ni2.entity.rigidbody.linearVelocity.length()){
                        midpoint = ni2.entity.getPosition();
                    } else {
                        midpoint = ni1.entity.getPosition();
                    }
                    resultNi = ni2;
                    allowed=true;
                    break;
                case NumberInfo.Type.Sphere: 
                case NumberInfo.Type.Cube:
                case NumberInfo.Type.Creature: 
                    midpoint = ni2.entity.getPosition();
                    resultNi = ni2;
                    allowed=true;
                    break;
            }
            break;
         case NumberInfo.Type.Sphere:
            switch(ni2.type){
                case NumberInfo.Type.Bullet: 
                    midpoint = ni1.entity.getPosition();
                    resultNi = ni1;
                    allowed=true;

                    break;
                case NumberInfo.Type.Sphere: 
                    if (ni1.entity.rigidbody.linearVelocity.length() > ni2.entity.rigidbody.linearVelocity.length()){
                        midpoint = ni2.entity.getPosition();
                    } else {
                        midpoint = ni1.entity.getPosition();
                    }
                    resultNi = ni1;
                    allowed=true;
                    break;
                case NumberInfo.Type.Cube:
                case NumberInfo.Type.Creature: 
                    midpoint = ni2.entity.getPosition();
                    resultNi = ni2;
                    allowed=true;
                    break;
            }
            break;
         case NumberInfo.Type.Cube:
            switch(ni2.type){
                case NumberInfo.Type.Bullet:
                case NumberInfo.Type.Sphere: 
                    midpoint = ni1.entity.getPosition();
                    resultNi = ni1;
                    allowed=true;
                    break;
                case NumberInfo.Type.Cube:  
                case NumberInfo.Type.Creature: 
                    midpoint = null;
                    resultNi = null;
                    allowed=false;
                    break;
            }
            break;
        case NumberInfo.Type.Creature:
            switch(ni2.type){
                case NumberInfo.Type.Bullet: 
                case NumberInfo.Type.Sphere: 
                    midpoint = ni1.entity.getPosition();
                    resultNi = ni1;
                    allowed=true;
                    break;
                case NumberInfo.Type.Cube:
                case NumberInfo.Type.Creature: 
                    midpoint = null;
                    resultNi = null;
                    allowed=false;
                    break;
            }
            break;
        default: console.error("NO COMB"); break;
    }

    return {allowed:allowed,resultNi:resultNi,midpoint:midpoint};
}


NumberInfo.prototype.OfflineCollision = function (result){
    const resultNi = result.other?.script?.numberInfo;
    if (resultNi){
        let chr = NumberInfo.GetCombinationHierarchyResult(this,resultNi);
        if (chr.allowed == true){
            this.entity.enabled = false;
            NumberInfo.ResolveCollisionOffline({obj1:this.entity,obj2:result.other,chr:chr});
        } else {
            // Not allowed to combine
            // console.log("Null.");
        }
    } else {
        // collid w floor
    }

}

NumberInfo.ResolveCollisionOffline = function(data){
    const {obj1,obj2,chr} = data;
    data.objId1 = obj1.getGuid();
    data.objId2 = obj2.getGuid();
    var detectedIndex = -1;
    NumberInfo.collisionPairs.forEach(pair => {
        if ((pair[0] == data.objId1 && pair[1] == data.objId2) || (pair[0] == data.objId2 && pair[1] == data.objId1)){
            detectedIndex = NumberInfo.collisionPairs.indexOf(pair);
        } else {
        }
    });
    if (detectedIndex == -1){
        // This combination pair wasn't already matched, so add it for detecting
        // This is needed since each collision produces *two* events, one from each collider, and must match each other
        NumberInfo.collisionPairs.push([data.objId1,data.objId2]);
     } else {
        // Two collider events were matched with each other; proceed

        const collisionResult = NumberInfo.GetCollisionResolutionOffline({obj1:obj1,obj2:obj2,chr:chr});
        if (!collisionResult) {
            console.log("skip col");
            return;
        }

        // Create the number
        NumberInfo.ProduceCollisionResult(collisionResult);
       
        // destroy collided objects, remove them from collisionPairs
        NumberInfo.collisionPairs.splice(detectedIndex,1);
        obj1.destroy();
        obj2.destroy();

    }
}
NumberInfo.ProduceCollisionResult = function(collisionResult){
    const TemplateToClone = collisionResult.TemplateToClone;
    const fractionKey = TemplateToClone.name;
    const maxNumber = collisionResult.maxNumber;
    const options = {
        position : JsonUtil.JsonToVec3(collisionResult.position),
        rotation : JsonUtil.JsonToVec3(collisionResult.rotation),
        rigidbodyType : collisionResult.rigidbodyType,
        rigidbodyVelocity : collisionResult.resultVelocity,
        properties : {
            FractionModifier : collisionResult.resultFrac
        },
    }
    if (collisionResult.resultFrac.numerator == 0) {
        // Awkward place for a destroy fx don't you think?
        NumberInfo.destroyNumberFx({position:options.position,maxNumber:maxNumber});
    } else {
        // console.log("options:"+JSON.stringify(options));
        const result = new TemplateToClone(options);
        // @Eytan here we have (competing / awkward) a data issue where NumberSphere and NumberCube have different "keys" for Fraction 
        // (as defined by editablePropertiesMap)
        // NumberSphere(options); //Game2.Instantiate[templateName](options); // TODO: Replace with Promise return

        result.entity.script.create('sinePop');
        AudioManager.play({source:assets.sounds.numberEat,position:options.position,positional:true,refDist:20});
    }


}
NumberInfo.collisionPairs = [];

NumberInfo.networkCollisionPairs = [];




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


        // Was it a sphere?
        if (this.entity._templateInstance?.name == 'NumberSphere'){

        }
        this.ints.forEach(x => {
            let el = x.element;
            // bug - because of setFractionAfterSeconds, it fails to find text after text was rebuilt once.
            el.color = this.getColor();
            el.text=this.fraction.asString();
            const len = el.text.length;
            const fontSize = Math.max(1.5,8 - len*1.25);
            el.fontSize = fontSize;

        })
        this.updateNumberText();
      
       this.entity.render.meshInstances[0].material = this.fraction.numerator < 0 ? Materials.celBlack : Materials.celWhite;
       this.entity.render.meshInstances[0].material.update();
    }
}
    
NumberInfo.CollisionPairs = {};
NumberInfo.GetCollisionResolutionOffline = function(collisionData){
    const { obj1, obj2, chr} = collisionData;

    let n1 = obj1.script.numberInfo;
    let n2 = obj2.script.numberInfo;
    let resultNi = chr.resultNi;
    let midpoint = chr.midpoint;
    
    const TemplateToClone = resultNi.entity._templateInstance.constructor;
    const rbType = resultNi.entity.rigidbody.type;
    const rot = resultNi.entity.getEulerAngles();

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
        TemplateToClone : TemplateToClone,
        rotation : rot,
        position : JsonUtil.Vec3ToJson(midpoint), // because we pass to server and back, server prefers json over vec3 obj
        maxNumber : Math.abs(frac1.numerator/frac1.denominator),
    }
    return resultData;
}

