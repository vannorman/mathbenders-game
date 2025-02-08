import Template from './template.js';
import HeldItem from './heldItem.js';
export class Gadget extends Template {
    static icon = assets.textures.ui.trash;
    static pickupSound = assets.sounds.getGadget;
    static texture = assets.textures.gadget;
    static model;
    static ammo=[];
    static ammoGfx=[];

    #mouseHeld;

    constructor(){
        super();
        this.entity = new pc.Entity("Gadget "+this.constructor.name);
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    }

   onPickup(){
        AudioManager.play({source:assets.sounds.getGadget});
        console.log('SUP pickup');
   }

   onSelect(){
        console.log('SUP select');
   }

    static createHeldItem(){
    }

    destroyHeldItemGfx(){
        this.heldItemGfx.destroy();
    }

    updateAmmoGfx(){}

    clearAmmoGfx(){
        this.ammoGfx.forEach(x=>x.destroy());
    }
 
    collectAmmo(args={}){}
 
    onMouseDown(){}
 
    onMouseUp(){}
 
    fire(){}
 
    update(){}

}

export class Multiblaster extends Gadget {
    // Specifically not a template
    // In no case will this ever exist except when player has it or selects it in inventory
    // This conflicts with the way Slot handles Template so ok it is a template
    static icon = assets.textures.ui.icons.multiblaster;
    static model = assets.models.gadgets.multiblaster;
    #lastFiredTime=0;
    #bulletScale=0.6;

    constructor(){
        super();
    }

    static createHeldItem(){
        const heldItemGfx = Multiblaster.model.resource.instantiateRenderEntity();
        ApplyTextureAssetToEntity({entity:heldItemGfx,textureAsset:assets.textures.gadget});
    
        console.log('SUP crt held item gfx');
        return new HeldItem({
            entity:heldItemGfx,
        });


    }

    onMouseDown(){
        if (this.ammo.length > 0){
            this.fire();
        } else {
            // AudioManager.play(clicksound)
        }

    }

    fire(){
        AudioManager.play({
            source:assets.sounds.multiblasterFire,
            position:pc.Vec3.ZERO,
            volume:0.4,
            pitch:1,
            positional:false
        });
        const timeSinceLastFired = Date.now() - this.#lastFiredTime;
        if (timeSinceLastFired > this.fireTimeDelta * 1000) {
            let frac = this.ammo.pop();
            const firePos = this.heldItemGfx.getPosition().clone().add(this.heldItemGfx.down);
            const sc = this.#bulletScale;

            const s = Game.Instantiate.NumberSphere({position:firePos});
            s.script.destroy('pickUpItem');
            s.setLocalScale(new pc.Vec3(sc,sc,sc));

            s.name="bullet";
            s.script.create('destroyAfterSeconds');
            s.script.numberInfo.setFraction(frac);
            s.rigidbody.linearVelocity=this.heldItemGfx.down.clone().mulScalar(50)
            this.#lastFiredTime = Date.now();
            this.ammoGfx.pop().destroy();
        }
    }

    collectAmmo(args={}){
        const {fraction=new Fraction(-9,8)}=args;
        this.ammo = Array(10).fill(fraction);
        this.updateAmmoGfx();
    }

    updateAmmoGfx(){
        this.clearAmmoGfx();
        if (this.ammo.length == 0) {
            return;
        }
        let num = this.ammo[0];
        let count = this.ammo.length;
        this.ammoGfx.forEach(x=>x.destroy());

        const options = {
            noCollision :true, 
            numberInfo : {
                fraction : num
            }
        } 

        // Ammo (0) in the hopper is big and centered so you can see it.
        let b = Game.Instantiate.NumberSphere(options);
        b.setLocalScale(new pc.Vec3(0.45,0.45,0.45)),
        this.heldItemGfx.addChild(b);
        b.setLocalPosition(0,0.2,0);
        this.ammoGfx.push(b);

        // Ammo (1-9) in a circle at base
        const ammoScale = new pc.Vec3(0.2,0.2,0.2);
        const circle = Utils.GetCircleOfPoints3d({degreesToComplete:360,radius:.3,scale:.18,autoCount:false,count:9});
        circle.forEach(pos => { 
            if (count-- > 0){
                let b = Game.Instantiate['NumberSphere'](options);
//                {
//                    noCollision:true,
//                    numberInfo:{fraction:{numerator:num.numerator,denominator:num.denominator}},
//                });
                b.setLocalScale(ammoScale),
                this.heldItemGfx.addChild(b);
                b.setLocalPosition(pos); 
                this.ammoGfx.push(b);
            }
        });
     
    }

}
