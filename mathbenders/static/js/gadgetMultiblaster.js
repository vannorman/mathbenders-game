
var GadgetMultiblaster = pc.createScript('gadgetMultiblaster');
GadgetMultiblaster.attributes.add('onFireFn', { type: 'object'}); 
//GadgetMultiblaster.attributes.add('createBulletFn', { type: 'object'}); 
GadgetMultiblaster.attributes.add('onSelectSound', { type: 'object'}); 
GadgetMultiblaster.attributes.add('onPickupFn', { type: 'object'}); 
GadgetMultiblaster.attributes.add('camera', { type: 'entity'}); 
GadgetMultiblaster.attributes.add('ammo', { type: 'object', array:true}); 
GadgetMultiblaster.attributes.add('fireTimeDelta', { type: 'number'});
GadgetMultiblaster.attributes.add('lastFiredTime', { type: 'number'});
GadgetMultiblaster.attributes.add('ammoGfx', { type: 'entity', array:true});
GadgetMultiblaster.attributes.add('heldItemGfx', { type: 'entity'});
GadgetMultiblaster.attributes.add('bulletScale', { type: 'number', default:0.6});


// Depends on PickUpItem and SwordCollider and Gadget
GadgetMultiblaster.prototype.onSelectFn = function(){
    this.fillAmmoGfx();
}

GadgetMultiblaster.prototype.initialize = function() {
    this.name="mult";
    this.entity.addComponent('collision');
    this.entity.addComponent('rigidbody',{type:'kinematic'});
    this.entity.script.create('pickUpItem');
    this.entity.script.pickUpItem.priority = 2;
    this.entity.script.pickUpItem.heldRot = new pc.Quat().setFromEulerAngles(110,0,0);
    this.entity.script.pickUpItem.heldPos = new pc.Vec3(0.7,0.3,-0.2);
    ApplyTextureAssetToEntity({entity:this.entity,textureAsset:assets.textures.gadget});
    this.onFireFn = AudioManager.play({source:assets.sounds.multiblasterFire,position:pc.Vec3.ZERO,volume:0.4,pitch:1,positional:false});

    this.entity.script.create('gadget',{attributes:{
            subGadget:this,
            type:Gadget.Multiblaster,
            }});


    this.entity.setLocalEulerAngles(new pc.Vec3(90,0,0));

    this.ammo = [];
    this.lastFiredTime = 0;
    this.fireTimeDelta = 0.12;
    
};


GadgetMultiblaster.prototype.canPickupNumber = function(num) {
    return num !== undefined && this.ammo.length == 0;
}

GadgetMultiblaster.prototype.onNumberPickup = function(num,gfx) {
    this.ammo = Array(10).fill(num);
    this.fillAmmoGfx();
};

GadgetMultiblaster.prototype.fillAmmoGfx = function(){
    if (this.ammo.length == 0) {
        return;
    }
    let num = this.ammo[0];
    let count = this.ammo.length;
    this.ammoGfx.forEach(x=>x.destroy());

    // First number in the hopper is big and centered so you can see it.

    const options = {
        noCollision :true, 
        numberInfo : {
            fraction : num
        }
    } 
    let b = Game.Instantiate.NumberSphere(options);
    b.removeComponent('collision')
    b.setLocalScale(new pc.Vec3(0.45,0.45,0.45)),
    this.heldItemGfx.addChild(b);
    b.setLocalPosition(0,0.2,0);
    this.ammoGfx.push(b);

    
    // fill ammo gfx
    Utils.GetCircleOfPoints3d({degreesToComplete:360,radius:.3,scale:.18,autoCount:false,count:9}).forEach(pos => { 
        if (count-- > 0){
            let b = Game.Instantiate['NumberSphere']({
                noCollision:true,
                numberInfo:{fraction:{numerator:num.numerator,denominator:num.denominator}},
            });
            b.setLocalScale(new pc.Vec3(0.2,0.2,0.2)),
            this.heldItemGfx.addChild(b);
            b.setLocalPosition(pos); 
            this.ammoGfx.push(b);
        }
    })
   

}


GadgetMultiblaster.prototype.onFire = function() {
    if (this.ammo.length > 0){
        const timeSinceLastFired = Date.now() - this.lastFiredTime;
        if (timeSinceLastFired > this.fireTimeDelta * 1000) {
            if (this.onFireFn) this.onFireFn(); // handle audio
            let frac = this.ammo.pop();
            const firePos = this.heldItemGfx.getPosition().clone().add(this.heldItemGfx.down);
            //console.log("Fp:"+firePos.trunc());
            const sc = this.bulletScale;


//            const s = this.createBulletFn(firePos);
            const s = Game.Instantiate.NumberSphere({position:firePos});
            s.script.destroy('pickUpItem');
            s.setLocalScale(new pc.Vec3(sc,sc,sc));

            //s.name="bullet";
            s.script.create('destroyAfterSeconds');
            // setTimeout(function(){s.destroy();},2000) // doesn't work if bullet was combined with another bullet which creates a new number.


            s.script.numberInfo.setFraction(frac);
            s.rigidbody.linearVelocity=this.heldItemGfx.down.clone().mulScalar(50)
//            s.rigidbody.applyForce(this.camera.forward.clone().mulScalar(this.fireSpeed));
            this.lastFiredTime = Date.now();
            this.ammoGfx.pop().destroy();
        }
    }

}
GadgetMultiblaster.prototype.tryNumberPickup = function(entity){
    if (this.canPickupNumber(entity.script?.numberInfo?.fraction)){
        this.onNumberPickup(
            entity.script.numberInfo.fraction,
            this.heldItemGfx);
        entity.destroy();
        return true;
    }
    return false;
 
}
GadgetMultiblaster.prototype.mouseHeld = function(){
    this.onFire();
}
GadgetMultiblaster.prototype.onMouseDown= function(){
    this.onFire();
};

GadgetMultiblaster.prototype.createHeldItemGfx = function(){
    // dislike that we have a local, raw way here vs Game.Instantiate[templateName]({gfxOnly:true}) elsewhere.
    const heldItemGfx = this.entity.clone();
    heldItemGfx.enabled = true;
    heldItemGfx.getComponentsInChildren('script').forEach(x=>{ // remove all scripts
        Object.keys(x._scriptsIndex).forEach(y => { x.destroy(y); })
    });
    if (heldItemGfx.collision) heldItemGfx.removeComponent('collision')
    this.heldItemGfx = heldItemGfx;
    Game.hig = heldItemGfx;
    return heldItemGfx;
} 
GadgetMultiblaster.prototype.silentUpdate = function(dt){};

