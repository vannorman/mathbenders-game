var GadgetBow = pc.createScript('gadgetBow');
GadgetBow.attributes.add('onFireFn', { type: 'object'}); 
GadgetBow.attributes.add('onSelectFn', { type: 'object'}); 
GadgetBow.attributes.add('onPickupFn', { type: 'object'}); 
GadgetBow.attributes.add('camera', { type: 'entity'}); 
GadgetBow.attributes.add('ammo', { type: 'object', array:true}); 
GadgetBow.attributes.add('fireTimeDelta', { type: 'number'});
GadgetBow.attributes.add('lastFiredTime', { type: 'number'});
GadgetBow.attributes.add('ammoGfx', { type: 'entity', array:true});
GadgetBow.attributes.add('heldItemGfx', { type: 'entity'});
GadgetBow.attributes.add('bulletScale', { type: 'number', default:0.2});

// Why do these variables only persist if I add them as attributes? I thought declaring this.var=x in initialize was enough but not? see thirdpersoncontroller...

// Depends on PickUpItem and SwordCollider and Gadget

GadgetBow.prototype.initialize = function() {
    this.entity.addComponent('collision');
    this.entity.addComponent('rigidbody',{type:'kinematic'});
    this.entity.script.create('pickUpItem');
    this.entity.script.pickUpItem.priority = 2;
    this.entity.script.pickUpItem.heldRot = new pc.Quat().setFromEulerAngles(90,0,135);
    this.entity.script.pickUpItem.heldPos = new pc.Vec3(0.7,0.3,-0.2);
    this.entity.script.pickUpItem.heldScale = 0.1;//new pc.Vec3(0.1,0.1,0.1); // dislike this on pickupitem.js instead of gadgetbow.js overwriting it
    this.entity.script.create('gadget',{attributes:{
            subGadget:this,
            type:Gadget.Bow,
            }});
  

    ApplyTextureAssetToEntity(this.entity,assets.textures.gadget);

    this.entity.setLocalEulerAngles(new pc.Vec3(90,0,0));

    this.ammo = [];
    this.lastFiredTime = 0;
    this.fireTimeDelta = 0.12;
    
};


GadgetBow.prototype.canPickupNumber = function(num) {
    return this.ammo.length == 0;
}
GadgetBow.prototype.onNumberPickup = function(num,gfx) {
    this.ammo = Array(10).fill(num);
    this.ammoGfx.forEach(x=>x.destroy());
    // fill ammo gfx
    GetCircleOfPoints(360,.3,.18).forEach(x => { 
        a=x; 
        b = NumberCube(pc.Vec3.ZERO,new pc.Vec3(.2,.2,.2)); 
        b.removeComponent('collision');
        b.reparent(gfx); 
        b.setLocalPosition(a); 
        this.ammoGfx.push(b);
    })

}


GadgetBow.prototype.onFire = function() {
    if (this.ammo.length > 0){
        const timeSinceLastFired = Date.now() - this.lastFiredTime;
        if (timeSinceLastFired > this.fireTimeDelta * 1000) {
            if (this.onFireFn) this.onFireFn(); // handle audio
            let frac = this.ammo.pop();
            const firePos = this.heldItemGfx.getPosition().clone().add(this.heldItemGfx.down);
            const sc = this.bulletScale;


            s = NumberSphere(firePos,new pc.Vec3(sc,sc,sc));
            s.name="bullet";

            // TODO bullets should ignore each other and never combine
            cb=s;
            s.script.numberInfo.setFraction(frac);
            s.rigidbody.linearVelocity=this.heldItemGfx.down.clone().mulScalar(50)
//            s.rigidbody.applyForce(this.camera.forward.clone().mulScalar(this.fireSpeed));
            this.lastFiredTime = Date.now();
            this.ammoGfx.pop().destroy();
        }
    }

}
GadgetBow.prototype.mouseHeld = function(){}

GadgetBow.prototype.tryNumberPickup = function(entity){
    if (this.canPickupNumber(entity.script.numberInfo.fraction)){
        this.onNumberPickup(
            entity.script.numberInfo.fraction,
            this.heldItemGfx);
        entity.destroy();
        return true;
    }
     return false;
 
}
GadgetBow.prototype.onMouseDown= function(){
    this.onFire();
};
GadgetBow.prototype.createHeldItemGfx = function(){
    console.log("create.");
    const heldItemGfx = this.entity.clone();
    heldItemGfx.getComponentsInChildren('script').forEach(x=>{ // remove all scripts
        Object.keys(x._scriptsIndex).forEach(y => { x.destroy(y); })
    });
    if (heldItemGfx.collision) heldItemGfx.removeComponent('collision')
    this.heldItemGfx = heldItemGfx;
    heldItemGfx.setLocalScale(0.1,0.1,0.1);
    return heldItemGfx;
} 

GadgetBow.prototype.silentUpdate = function(dt){};

