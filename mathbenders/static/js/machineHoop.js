/*
### MACHINE HOOP
- assembly of numberHoop (assets.hoop) object and machineCrossingDetector
- detects crossing then apply an operation to numbers and inventory on crossing
*/


var MachineHoop = pc.createScript('machineHoop');
MachineHoop.attributes.add('numberTextBack', { type: 'entity' });
MachineHoop.attributes.add('numberTextFront', { type: 'entity' });
MachineHoop.attributes.add('modifyOp', { type: 'string', default: '' });
MachineHoop.attributes.add('audioManager', { type: 'object' }); 
MachineHoop.attributes.add('popSound', { type: 'object' }); 
MachineHoop.attributes.add('onCrossFn', { type: 'function' }); 
MachineHoop.attributes.add('hoopMeshRenderAsset', { type: 'object' }); 
MachineHoop.attributes.add('hoopTextureAsset', { type: 'object' }); 
MachineHoop.attributes.add('fraction', { type: 'object' }); 

MachineHoop.prototype.init = function () {
    // Note: We rely on assets.hoop which is a parent with two child meshes, a "doorway plane" and an "arch"
    const doorway = this.entity.children[0];
    doorway.addComponent('script');
    doorway.addComponent('collision',{type:'mesh',renderAsset:assets.numberHoop.resource.renders[0]}); 
    doorway.script.create('machineCrossingDetector',{attributes:{
        // let machineCrossingDetector know "when an object triggers, what behaviors/qualities are required to fire an event"
        requiredFn: (x) => { 
            // only "Players" and "Numbers" fire the hoop event
            return x.getComponentsInChildren('thirdPersonController').length > 0 || x.getComponentsInChildren('numberInfo').length > 0; 
        },
        directionIndex:1, // because our hoop model, "y" direction is "forwards", hence 1th index of [x,y,z]
        halfwayDist:2.0, // because our hoop model is offset from center
        Cross : this.Cross,
        context : this
        }});

    const arch = this.entity.children[1];


    // If we apply textures simultaneously to both the hoop archway and the hoop doorway, one of them will appear as a grey texture. 
    // Current workaround is to setTimeout for the 2nd texture
    setTimeout(function(){
        ApplyTextureAssetToMeshInstance({opacity:true,meshInstance:doorway.render.meshInstances[0],textureAsset:assets.textures.hoop});},200);
    setTimeout(function(){
        ApplyTextureAssetToMeshInstance({opacity:true,meshInstance:doorway.render.meshInstances[1],textureAsset:assets.textures.hoop});
    },100);
    
    arch.addComponent('collision',{type:'mesh',renderAsset:this.hoopMeshRenderAsset});
    arch.render.meshInstances[0].material = Materials.red;
    arch.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC})

    this.setFraction(new Fraction(2,1));
};

MachineHoop.prototype.setFraction = function(frac){
    this.fraction = Fraction.ReduceOverIntegers(frac);
    this.updateText();
};

MachineHoop.prototype.updateText = function(){
    this.entity.getComponentsInChildren('element').forEach(x=>{x.entity.destroy();})
    Utils.AddText({
        color:pc.Color.WHITE, 
        text:"x"+this.fraction.asString(),
        scale:0.22, 
        parent:this.entity, 
        rotation: new pc.Vec3(90,0,180), 
        localPos:new pc.Vec3(0,1.8,1.4)
    })
    Utils.AddText({
        color:pc.Color.WHITE, 
        text:"/"+this.fraction.asString(),
        scale:0.22, 
        parent:this.entity, 
        rotation: new pc.Vec3(90,0,0), 
        localPos:new pc.Vec3(0,1.618,1.4)
    })

};


MachineHoop.ModifyNumber = function(options){
    const { direction, fracToModify, hoopFrac } = options;
    // console.log("J:"+JSON.stringify(options));
    let frac = direction ? hoopFrac : Fraction.Inverse(hoopFrac);
    let result = Fraction.Multiply(frac,fracToModify);
    return result;
}

MachineHoop.prototype.Cross = function (options){
    const { obj,direction,context} = options;
    if (typeof context.onCrossFn === 'function') context.onCrossFn(obj.getPosition()); // for fx.
        // Operate on a number 
    if (obj.script.numberInfo){
        const result = MachineHoop.ModifyNumber({direction:direction,fracToModify:obj.script.numberInfo.fraction, hoopFrac:context.fraction});
        obj.script.numberInfo.setFraction(result);
   } else {
        // console.log("HUH? No number hmmmmmmmmmm");
        // probably thirdpersoncontroller, need to pop all my invs
        Player.inventory.script.modifyInventoryNumbers(x => {
            return MachineHoop.ModifyNumber({direction:direction,fracToModify:x,hoopFrac:context.fraction});
        });
    }
    delete(this.crossingObjs[obj.getGuid()]); // "This" refers to the CrossingDetector script instance; since Cross is called from there
}


MachineHoop.prototype.getModifiedFraction = function (original) {
    if (this.modifyOp && typeof window[this.modifyOp] === 'function') {
        return window[this.modifyOp](original);
    }
    return original;
};

MachineHoop.prototype.setProperties = function(properties){
    if (properties.machineHoop) {
        this.fraction = JsonUtil.JsonToFraction(properties.machineHoop.fraction);
    } else {
        console.log("FAIL setprops on mh:"+JSON.stringify(properties));
    }
    return properties;
}


MachineHoop.prototype.getProperties = function(properties){
    properties.machineHoop = {
        fraction : this.fraction
    }
    return properties;
}



