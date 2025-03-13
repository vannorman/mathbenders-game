import Gadget from './base.js';

import HeldItem from './heldItem.js';

export default class Sword extends Gadget {
    static _icon = assets.textures.ui.icons.sword;
    static model = assets.models.gadgets.sword;
    static swingCollider;

    // KEep track of swings as they happen
    // Dislike awkward statics here
    static swinging = false;
    static eventHappenedThisSwing = false;
    static angle = 90;
    static swingRot;
    static swingStep = 0;
    static swingPercentComplete = 0;
    static #UpdateInitialized = false; // leads to issues if not checked
    static startRot = new pc.Quat().setFromEulerAngles(0,90,0);
    static swingTargetRot = new pc.Quat().setFromEulerAngles(0,180,0); // Changed to a different angle for the swing
    static {
        if (!Sword.#UpdateInitialized){
            pc.app.on('update',function(dt){Sword.silentUpdate(dt);});
            Sword.#UpdateInitialized=true;
        } 
    }

    constructor () {
        super();
        this.swinging = false;
    }

    setup(){
       /* 
        sword.addComponent('script');
        sword.script.create('gadgetSword',{attributes:{ 
            onSelectFn:()=>{AudioManager.play({source:assets.sounds.swordDraw});},
            onFireFn:()=>{AudioManager.play({source:assets.sounds.swordSwing});},
            onPickupFn:()=>{AudioManager.play({source:assets.sounds.swordDraw});},
            
            }});
        sword.script.gadgetSword.init(); //hacky af way to make sure init happens even if obj is disabled.
*/
    }

    onMouseDown(){
        this.fire();
    }
    
    fire(){
        // Only start swinging if we're not already swinging
        if (!Sword.swinging) {
            Sword.resetSwingAnimation();
            Sword.swinging = true;
        }
    }

    static resetSwingAnimation() {
        Sword.swingStep = 0;
        Sword.swingPercentComplete = 0;
        Sword.eventHappenedThisSwing = false;
        // Make sure the target rotation is set for the first swing
        Sword.swingTargetRot = new pc.Quat().setFromEulerAngles(0,180,0);
    }

    static onCollisionReport(result){
        const entity = result.other;
        if (Sword.swinging){
            const ni = entity.script && entity.script.numberInfo ? entity.script.numberInfo  : null;
            if (ni && entity.script.pickUpItem?.canPickup && !Sword.eventHappenedThisSwing) { // dislike "Canpickup" being a proxy for "Canchop"
                Sword.swingCollider.enabled = false;
                Sword.eventHappenedThisSwing = true; // don't allow additional number chops
                Sword.chop(ni);
            } else {
                // we hit NOT a choppable thing. Abort the swing 
                Sword.advanceSwingStep();
            }
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

    static advanceSwingStep = function(){
        Sword.swingPercentComplete = 0;
        Sword.swingStep++;
        
        // If we're returning to the starting position
        if (Sword.swingStep % 2 === 0) {
            // Return to starting position
            Sword.swingTargetRot = new pc.Quat().setFromEulerAngles(0,90,0);
        } else {
            // Swing down
            Sword.swingTargetRot = new pc.Quat().setFromEulerAngles(0,180,0);
        }
        
        console.log("Advancing swing step to " + Sword.swingStep + ", target rotation: " + 
                   (Sword.swingStep % 2 === 0 ? "90" : "180") + " degrees");
    }

    static silentUpdate(dt){
        if (Sword.swinging) {
            try {
                const heldItemGfx = Player.inventory.heldItem.entity;
                if (!heldItemGfx) {
                    console.error("No held item entity found");
                    Sword.swinging = false;
                    return;
                }
                
                // Move graphics
                let swingSpeed = 2;
                Sword.swingPercentComplete += dt * swingSpeed;
                Sword.swingPercentComplete = Math.min(Sword.swingPercentComplete, 1); // Clamp to prevent values over 1
                
                // Get current rotation
                const currentRot = heldItemGfx.getLocalRotation();
                
                // Create a new quaternion for the interpolated rotation
                let rot = new pc.Quat();
                // Use lerp instead of slerp if slerp isn't available
                if (rot.slerp) {
                    rot.slerp(currentRot, Sword.swingTargetRot, Sword.swingPercentComplete);
                } else {
                    rot.lerp(currentRot, Sword.swingTargetRot, Sword.swingPercentComplete);
                }
                
                // Check for NaN values in the rotation
                if (isNaN(rot.x) || isNaN(rot.y) || isNaN(rot.z) || isNaN(rot.w)) {
                    console.error("NaN detected in rotation quaternion:", rot);
                    // Reset to a valid rotation
                    rot = new pc.Quat().setFromEulerAngles(0, 90, 0);
                }
                
                // Apply the rotation
                heldItemGfx.setLocalRotation(rot);
                
                // Occasionally log the progress for debugging
                if (Math.random() < 0.01) {
                    console.log("Swing progress: " + (Sword.swingPercentComplete * 100).toFixed(1) + 
                               "%, Step: " + Sword.swingStep);
                }
                
                // Check if we've completed this step of the swing based on percentage only
                if (Sword.swingPercentComplete >= 0.99) {
                    console.log("Completed swing step " + Sword.swingStep);
                    if (Sword.swingStep == 0) {
                        Sword.advanceSwingStep(); // pull sword back
                    } else {
                        // reset for next chop
                        if (Sword.swingCollider) {
                            Sword.swingCollider.enabled = true;
                        }
                        Sword.swinging = false;
                        Sword.eventHappenedThisSwing = false;
                        Sword.swingStep = 0;
                        Sword.swingPercentComplete = 0;
                        console.log("Swing animation complete, reset to initial state");
                    }
                }
            } catch (error) {
                console.error("Error in sword swing animation:", error);
                Sword.swinging = false;
            }
        }
    }
}

// Make Sword available globally if needed
window['Sword'] = Sword;
// Export the Sword class
export { Sword };


