var GadgetSword = pc.createScript('gadgetSword');
if (!Gadget) var Gadget = function(){};
GadgetSword.attributes.add('eventHappenedThisSwing', {type:'bool',default:false});

//GadgetSword.prototype = Object.create(Gadget.prototype);
//GadgetSword.prototype.constructor = GadgetSword;
// Attempted class inheritence / method overwrite via https://forum.playcanvas.com/t/inheritence-and-oop-with-playcanvas/7551/18
// It doesn't work, script.gadget does not discover script.gadgetSword, unclear how to get gadgetSword from gadget

GadgetSword.attributes.add('onSelectFn', { type: 'object'}); 
GadgetSword.attributes.add('onFireFn', { type: 'object'}); 
GadgetSword.attributes.add('onPickupFn', { type: 'object'}); 
GadgetSword.attributes.add('ints', { type: 'entity', array:true });
GadgetSword.attributes.add('swingRot', {type:'quat',default:new pc.Quat()});
GadgetSword.attributes.add('swinging', {type:'bool',default:false});


GadgetSword.prototype.init = function() {
    this.entity.addComponent('collision');
    if (!this.entity.rigidbody) this.entity.addComponent('rigidbody');
    this.entity.rigidbody.type = pc.RIGIDBODY_TYPE_KINEMATIC;
    this.entity.script.create('pickUpItem');
    this.entity.script.pickUpItem.priority = 2;
    this.entity.script.pickUpItem.heldRot = new pc.Quat().setFromEulerAngles(0,90,0);
    this.entity.script.pickUpItem.heldPos = new pc.Vec3(0.7,0.3,-0.2);
    this.swingRot = new pc.Quat().setFromEulerAngles(90, 180, 90);
    ApplyTextureAssetToEntity({entity:this.entity,textureAsset:assets.textures.gadget});
    this.entity.setLocalEulerAngles(new pc.Vec3(90,-90,90))
    this.swinging = false;
    this.heldItemGfx = null; // a clone of the sword visibile
    this.startRot = new pc.Quat().setFromEulerAngles(0,90,0); // this.heldItemGfx.getLocalEulerAngles();

    // a poor substitute for virtual classes and inheritance.
    this.entity.script.create('gadget',{attributes:{subGadget:this,type:Gadget.Sword,}});

        

};

GadgetSword.prototype.mouseHeld = function(){}
GadgetSword.prototype.tryNumberPickup = function(entity){}


GadgetSword.prototype.createHeldItemGfx = function(){

    // sneak in a "WasSelectd" trigger..
    this.swinging  =false;

    // This is called when player selects inventory slot with this gadget (e.g. player "equips" this gadget) and is recreated each time
    const heldItemGfx = this.entity.clone();
    heldItemGfx.enabled = true;
    heldItemGfx.getComponentsInChildren('script').forEach(x=>{ // remove all scripts
        Object.keys(x._scriptsIndex).forEach(y => { x.destroy(y); })
    });
    if (heldItemGfx.collision) heldItemGfx.removeComponent('collision')
    this.heldItemCollider = Cube({scale:new pc.Vec3(0.1,2.0,0.1)});
    this.heldItemCollider.render.meshInstances[0].material = Materials.green;

    
    heldItemGfx.addChild(this.heldItemCollider);
   this.heldItemCollider.render.enabled=false; // hidden, comment to debug collider visual
   // c.removeComponent('rigidbody');
    this.heldItemCollider.addComponent('script');
    this.heldItemCollider.script.create('collisionDetector',{attributes:{reportTo:this}});
    this.heldItemCollider.setLocalPosition(new pc.Vec3(0,1,0));
    // Game.h = this.heldItemCollider;

//    this.entity.addChild(heldItemGfx);
    pc.app.root.addChild(heldItemGfx);
    heldItemGfx.name = "swordWithCollider";
    this.heldItemGfx = heldItemGfx; // note: This instance of gadgetsword will retain a reference even tho the entity is destroyed when player switches away from this gadget in inventory.js 
    return heldItemGfx;
}

GadgetSword.prototype.onMouseDown = function(){

    this.swing();
}
GadgetSword.prototype.onCollisionReport = function(result){
    const entity = result.other;
    if (this.swinging){
        const ni = entity.script && entity.script.numberInfo ? entity.script.numberInfo  : null;
        if (ni && entity.script.pickUpItem?.canPickup && !this.eventHappenedThisSwing) { // dislike "Canpickup" being a proxy for "Canchop"
            this.heldItemCollider.enabled = false;
            this.eventHappenedThisSwing = true; // don't allow additional number chops
            this.chop(ni);
        } else {
            // we hit NOT a choppable thing. Abort the swing 
            this.advanceSwingStep();
        }
    }
}

GadgetSword.prototype.swing = function (){
    if (!this.swinging ){
        this.angle = 90;
        if (this.onFireFn) this.onFireFn();
        this.swinging = true;

        this.swingTargetRot = this.swingRot;
        this.swingPercentComplete = 0;
        this.swingStep = 0;

    }
};

    

GadgetSword.prototype.silentUpdate = function(dt){
    if (this.swinging ){
        // Move graphices

        let swingSpeed = 2;
        this.swingPercentComplete += dt * swingSpeed;
        let rot = new pc.Quat().lerp(this.heldItemGfx.getLocalRotation(),this.swingTargetRot,this.swingPercentComplete * 2);
        this.heldItemGfx.setLocalRotation(rot);
        this.angle = new pc.Quat().delta(this.heldItemGfx.getLocalRotation(),this.swingTargetRot);
        if (this.angle < .01) {
            if (this.swingStep == 0){
                this.advanceSwingStep(); // pull sword back
            } else {
                // reset for next chop
                this.heldItemCollider.enabled = true;
                this.swinging = false;
                this.eventHappenedThisSwing = false; 
            }
        }
    }
 }

GadgetSword.prototype.chop = function(ni){
    this.eventHappenedThisSwing = true;
    const postSliceDist = 0.86
    const leftPos = ni.entity.getPosition().clone().add(Camera.main.entity.left.clone().mulScalar(postSliceDist));
    const rightPos = ni.entity.getPosition().clone().add(Camera.main.entity.right.clone().mulScalar(postSliceDist));
    const leftDir = leftPos.clone().sub(ni.entity.getPosition().clone()).normalize();
    const rightDir = leftDir.clone().mulScalar(-1);
    const postSliceSpeed = ni.numberType == NumberInfo.Shape.Sphere ? 0.2 : 1.1;
    const leftVel = leftDir.mulScalar(postSliceSpeed);
    const rightVel = rightDir.mulScalar(postSliceSpeed);
    const resultFrac = Fraction.Divide(ni.fraction,new Fraction(2,1));
    const op = ni.entity.script.objectProperties;
    const templateName = op.objectProperties?.templateName; 
    if (!templateName){
        console.log("no template name on"+ni.entity.name);
    }

    const leftResultProperties = {
        position : leftPos,
        rigidbodyType : pc.RIGIDBODY_TYPE_DYNAMIC,
        rigidbodyVelocity : leftVel,
        numberInfo : { fraction : resultFrac }
    } 

    const rightResultProperties = {
        position : rightPos,
        rigidbodyType : pc.RIGIDBODY_TYPE_DYNAMIC,
        rigidbodyVelocity : rightVel,
        numberInfo : { fraction : resultFrac }
    } 
 
    data = {
        templateName : templateName,
        rightResultProperties : rightResultProperties,
        leftResultProperties : leftResultProperties,
        // network should know about number to destroy somehow, eventually. Instead we just pass this numebr
        objToDestroy : ni.entity,
    }
    ni.entity.enabled=false; // hide lag from destroy? Shouldnt destroy be instnat?
    this.resolveChop(data); 
}

GadgetSword.prototype.resolveChop = function(data) {
//    Game.destroyObject(data.objToDestroy); 
    data.objToDestroy.destroy();
    Game.Instantiate[data.templateName](data.leftResultProperties);
    Game.Instantiate[data.templateName](data.rightResultProperties);
}

GadgetSword.prototype.advanceSwingStep = function(){
    this.swingPercentComplete = 0;
    this.swingStep++;
    this.swingTargetRot = this.startRot; //new pc.Quat().setFromEulerAngles(this.startRot);
}
