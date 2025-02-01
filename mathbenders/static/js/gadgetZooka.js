

var GadgetZooka = pc.createScript('gadgetZooka');
GadgetZooka.attributes.add('onFireFn', { type: 'object'}); 
//GadgetZooka.attributes.add('createBulletFn', { type: 'object'}); 
GadgetZooka.attributes.add('onSelectSound', { type: 'object'}); 
GadgetZooka.attributes.add('onPickupFn', { type: 'object'}); 
GadgetZooka.attributes.add('camera', { type: 'entity'}); 
GadgetZooka.attributes.add('ammo', { type: 'object', array:true}); 
GadgetZooka.attributes.add('fireTimeDelta', { type: 'number'});
GadgetZooka.attributes.add('lastFiredTime', { type: 'number'});
GadgetZooka.attributes.add('ammoGfx', { type: 'entity', array:true});
GadgetZooka.attributes.add('heldItemGfx', { type: 'entity'});
GadgetZooka.attributes.add('bulletScale', { type: 'number', default:1.2});


// Depends on PickUpItem and SwordCollider and Gadget
GadgetZooka.prototype.onSelectFn = function(){
    this.fillAmmoGfx();
}

GadgetZooka.prototype.initialize = function() {
    this.name="zook";
    this.entity.addComponent('collision');
    this.entity.addComponent('rigidbody',{type:'kinematic'});
    this.entity.script.create('pickUpItem');
    this.entity.script.pickUpItem.priority = 2;
    this.entity.script.pickUpItem.heldRot = new pc.Quat().setFromEulerAngles(165,25,180);
    this.entity.script.pickUpItem.heldPos = new pc.Vec3(0,-0.5,0.5);
    ApplyTextureAssetToEntity({entity:this.entity,textureAsset:assets.textures.gadget});

    this.entity.script.create('gadget',{attributes:{
            subGadget:this,
            type:Gadget.Zooka,
            }});


    this.entity.setLocalEulerAngles(new pc.Vec3(90,0,0));

    this.ammo = [];
    this.lastFiredTime = 0;
    this.fireTimeDelta = 0.12;
    
};


GadgetZooka.prototype.canPickupNumber = function(num) {
    return num !== undefined && this.ammo.length < 3;
}

GadgetZooka.prototype.onNumberPickup = function(num,gfx) {
    this.ammo.push(num);
    this.fillAmmoGfx();
};

GadgetZooka.prototype.fillAmmoGfx = function(){
    this.ammoGfx.forEach(x=>x.destroy());
    if (this.ammo.length == 0) {
        return;
    }
    for (let i=0;i<this.ammo.length;i++){
        let num = this.ammo[i];
        const options = {
            noCollision :true, 
            numberInfo : {
                fraction : num
            }
        } 
        let b = Game.Instantiate.NumberSphere(options);
        this.heldItemGfx.addChild(b);
        this.ammoGfx.push(b);
        if(i==0) {
            const ammoPos1 = new pc.Vec3(0,1,2);
            b.setLocalPosition(ammoPos1);
            Game.a = b;
        }
        if(i==1) {
            const ammoPos2 = new pc.Vec3(-1,0,1);
            b.setLocalPosition(ammoPos2);
            Game.b = b;
        }
        if (i==3) {
            const ammoPos3 = new pc.Vec3(0,0,0);
            b.setLocalPosition(ammoPos3);
            Game.c = b;
        }

    }
}


GadgetZooka.prototype.onFire = function() {
    if (this.ammo.length > 0){
        const timeSinceLastFired = Date.now() - this.lastFiredTime;
        if (timeSinceLastFired > this.fireTimeDelta * 1000) {
            if (this.onFireFn) this.onFireFn(); // handle audio
            let frac = this.ammo.shift();

            // Constant and unique per gadget
            const firePos = Camera.main.entity.getPosition().add(Camera.main.entity.forward.mulScalar(5));

            //console.log("Fp:"+firePos.trunc());
            const sc = this.bulletScale;

            const s = Game.Instantiate.NumberRocket({position:firePos});
            Game.s=s;

            s.script.numberInfo.setFraction(frac);
            s.rigidbody.linearVelocity=Camera.main.entity.forward.mulScalar(50)
            s.rigidbody.mass=0.01; //hacky prevent pushing numbers when hit
            s.rigidbody.linearDamping = 0;

            let p = Fx.SmokeParticles();
            pc.app.root.addChild(p);
            p.addComponent('script');
            p.script.create('followTarget',{attributes:{target:s}});
            p.script.create('destroyAfterSeconds',{attributes:{seconds:8}});

            s.script.create('explodeOnImpact',{attributes:{ smokeTrailParticleEntity:p}});

            p.moveTo(s.getPosition());

            this.lastFiredTime = Date.now();
            this.fillAmmoGfx(); 
        }
    }
}
GadgetZooka.prototype.tryNumberPickup = function(entity){
    if (this.canPickupNumber(entity.script?.numberInfo?.fraction)){
        this.onNumberPickup(
            entity.script.numberInfo.fraction,
            this.heldItemGfx);
        entity.destroy();
        return true;
    }
    return false;
 
}
GadgetZooka.prototype.mouseHeld = function(){
    this.onFire();
}

GadgetZooka.prototype.onMouseDown= function(){
    this.onFire();
};

GadgetZooka.prototype.createHeldItemGfx = function(){
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
GadgetZooka.prototype.silentUpdate = function(dt){};


