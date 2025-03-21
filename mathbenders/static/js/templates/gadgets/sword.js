import Gadget from './base.js';

import HeldItem from './heldItem.js';

export default class Sword extends Gadget {
    static _icon = assets.textures.ui.icons.sword;
    static model = assets.models.gadgets.sword;
    static swingCollider;

    // KEep track of swings as they happen
    // Dislike awkward statics here
    static get swinging() { return Sword.state == Sword.State.SwingingUp || Sword.state == Sword.State.SwingingDown; };
    static eventHappenedThisSwing = false;
    static angle = 90;
    static swingRot;
    static swingStep = 0;
    static swingPercentComplete = 0;
    static #UpdateInitialized = false; // leads to issues if not checked
    static swingTargetRot; //new pc.Quat().setFromEulerAngles(0,180,0); 
    static swingTargetRotUp = new pc.Quat().setFromEulerAngles(0,90,0); 
    static swingTargetRotDown = new pc.Quat().setFromEulerAngles(-90,0,-90); 

    static State = Object.freeze({
        Ready: 0,
        SwingingUp: 1,
        SwingingDown: 2
    });

    static state = Sword.State.Ready;

    static {
        if (!Sword.#UpdateInitialized){
            pc.app.on('update',function(dt){Sword.silentUpdate(dt);});
            Sword.#UpdateInitialized=true;
        } 
    }

    constructor () {
        super();
    }

    loadNumber(){
        console.log("Sword shouldn't even hear about this I guess");
    }

    setup(){
    }

    onMouseDown(){
        this.fire();
    }
    
    fire(){
        if (Sword.state == Sword.State.Ready) {
            console.log("Was ready, begin swing down.");
            Sword.setState(Sword.State.SwingingDown);
        }
    }

    static setState(state){
        Sword.state = state;
        Sword.swingPercentComplete = 0;
        switch(state){
        case Sword.State.SwingingDown:
            Sword.swingTargetRot = Sword.swingTargetRotDown;
            break;
        case Sword.State.SwingingUp:
            Sword.swingTargetRot = Sword.swingTargetRotUp;
            break;
        case Sword.State.Ready:
            Sword.eventHappenedThisSwing = false;
            // reset for next chop
            if (Sword.swingCollider) {
                Sword.swingCollider.enabled = true;
            }
            Sword.swingTargetRot = Sword.swingTargetRotUp;
                
            break;
        }
    }


    static silentUpdate(dt){
        if (Sword.swinging) {
            const heldItemGfx = Player.inventory.heldItem.entity;
            if (!heldItemGfx) {
                console.error("No held item entity found");
                return;
            }
            
            // Move graphics
            let swingSpeed = 5;
            Sword.swingPercentComplete += dt * swingSpeed;
            Sword.swingPercentComplete = Math.min(Sword.swingPercentComplete, 1); // Clamp to prevent values over 1
            // console.log("State:"+Sword.state+", perc:"+Sword.swingPercentComplete.toFixed(2)); 
            // Get current rotation and slerp towards target rot.
            const rot = heldItemGfx.getLocalRotation();
            let currentRot = rot;
            rot.slerp(currentRot, Sword.swingTargetRot, Sword.swingPercentComplete);
            heldItemGfx.setLocalRotation(rot);
            
            
            // Check if we've completed this step of the swing based on percentage only
            if (Sword.swingPercentComplete >= 0.99) {
                switch(Sword.state){
                case Sword.State.SwingingDown:
                    Sword.setState(Sword.State.SwingingUp);
                    break;
                case Sword.State.SwingingUp:
                    Sword.setState(Sword.State.Ready);
                    break;
                }
            }
        }
    }

    static onCollisionReport(result){
        console.log("Col:"+result.other.name);
        const entity = result.other;
        if (Sword.swinging){
            const ni = entity.script && entity.script.numberInfo ? entity.script.numberInfo  : null;
            if (ni && !Sword.eventHappenedThisSwing) { // dislike "Canpickup" being a proxy for "Canchop"
                Sword.swingCollider.enabled = false;
                Sword.eventHappenedThisSwing = true; // don't allow additional number chops
                Sword.chop(ni);
            } else {
                console.log("not chop. event:"+Sword.eventHappenedThisSwing);
                // we hit NOT a choppable thing. Abort the swing 
                Sword.setState(Sword.State.SwingingUp);
            }
        } else {
            console.log("notswing. st:"+Sword.state);
        }
    }

    static createHeldItem(){ 
        // awkward or Improper for this to be a static method when we need a ref to the sword collider.
        const heldItemGfx = Sword.model.resource.instantiateRenderEntity();
        ApplyTextureAssetToEntity({entity:heldItemGfx,textureAsset:assets.textures.gadget});
   
        // Ensure the entity has a valid initial rotation
        const initialRotation = new pc.Vec3(0,90,0);
        heldItemGfx.setLocalEulerAngles(initialRotation);

        let swingCollider = Cube({scale:new pc.Vec3(0.1,2.0,0.1)});
        swingCollider.render.meshInstances[0].material = Materials.green;
        
        swingCollider.render.enabled=false; // hidden, comment to debug collider visual
        swingCollider.addComponent('script');
        swingCollider.script.create('collisionDetector',{attributes:{reportTo:Sword}});
        swingCollider.setLocalPosition(new pc.Vec3(0,1,0));

        heldItemGfx.addChild(swingCollider);
        heldItemGfx.name = "swordWithCollider";
        // Sword.heldItemGfx = heldItemGfx; 
        Sword.swingCollider = swingCollider; 
        
        console.log('Created sword held item with initial rotation: ' + initialRotation);
        return new HeldItem({
            entity:heldItemGfx,
            position:new pc.Vec3(0.7,0.2,-0.2),
            rotation:initialRotation,
        });
    }

    static chop(ni){
        Sword.eventHappenedThisSwing = true;
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
     
        const data = {
            templateName : templateName,
            rightResultProperties : rightResultProperties,
            leftResultProperties : leftResultProperties,
            // network should know about number to destroy somehow, eventually. Instead we just pass Sword.numebr
            objToDestroy : ni.entity,
        }
        ni.entity.enabled=false; // hide lag from destroy? Shouldnt destroy be instnat?
    
        // RESOLVE CHOP
        data.objToDestroy.destroy();
        Game.Instantiate[data.templateName](data.leftResultProperties);
        Game.Instantiate[data.templateName](data.rightResultProperties);
    }


}

// Make Sword available globally if needed
window['Sword'] = Sword;
// Export the Sword class
export { Sword };


