import Template from './template.js';
import HeldItem from './heldItem.js';
export class Gadget extends Template {
    static _icon; //= assets.textures.ui.trash;
    static pickupSound = assets.sounds.getGadget;
    static texture = assets.textures.gadget;
    static model;
   
     ammo=[];
    ammoGfx=[];

    #mouseHeld;

    constructor(){
        super();
        this.entity = new pc.Entity("Gadget "+this.constructor.name);
        // pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    }

   onPickup(){
        AudioManager.play({source:assets.sounds.getGadget});
   }

   onSelect(){  
        // Hmm this never gets called currently. Inventory has its own "Select"?
        console.log('SUP select');
   }

    static createHeldItem(){
    }

    destroyHeldItemGfx(){
        this.heldItemGfx.destroy();
    }

    updateAmmoGfx(){}

    clearAmmoGfx(){
        this.ammoGfx.forEach(x=>x.entity.destroy());
    }
 
    collectAmmo(args={}){}
 
    onMouseDown(){}
 
    onMouseUp(){}
 
    fire(){}
 
    update(){}

    get properties(){
        return {
            ammo : this.ammo,
        }
    } 

    set properties(value){
        // console.log(value);
        const properties = value;
        if (properties.ammo) {
            this.ammo = properties.ammo;
        }
    }

}

export class Multiblaster extends Gadget {
    
    static _icon = assets.textures.ui.icons.multiblaster;
    static model = assets.models.gadgets.multiblaster;
    ammo = [];
    ammoGfx = [];
    #lastFiredTime=0;
    #bulletScale=0.6;
    fireTimeDelta=0.1;
    static get isGadget(){ return true;  }

    constructor(){
        super();
    }

    static createHeldItem(){
        const heldItemGfx = Multiblaster.model.resource.instantiateRenderEntity();
        ApplyTextureAssetToEntity({entity:heldItemGfx,textureAsset:assets.textures.gadget});
    
        // console.log('SUP crt held item gfx');
        return new HeldItem({
            entity:heldItemGfx,
            position:new pc.Vec3(0.7,0.5,-0.8),
            rotation:new pc.Vec3(115,0,0),
        });


    }

    setup(){
        // this gets called twice for some reason when we pick up a multiblaster...
        // console.log(`set up ${this.name}`);
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

            const s = new NumberSphere({position:firePos}).entity;
//            Game.Instantiate.NumberSphere({position:firePos});
            // s.script.destroy('pickUpItem');
            s.setLocalScale(new pc.Vec3(sc,sc,sc));
            s.tags.remove(Constants.Tags.PlayerCanPickUp); // todo: Both "Bullet" and "NumberSphere" should inherit from NumberObject
            // Never create stuff then remove stuff.. to get a different stuff lol

            s.name="bullet";
            s.script.create('destroyAfterSeconds');
            s.script.numberInfo.setFraction(frac);
            s.rigidbody.linearVelocity=this.heldItemGfx.down.clone().mulScalar(50)
            this.#lastFiredTime = Date.now();
            this.ammoGfx.pop().entity.destroy();
        }

        
    }

    loadNumber(args={}){
    console.log('load?');
    console.log(args);
//    collectAmmo(args={}){
        const {fraction=new Fraction(-9,8)}=args;
        if (this.ammo.length == 10){
            PlayerMessenger.Say("Ammo full!");
            return false;
        } else {

            this.ammo = Array(10).fill(fraction);
            this.updateAmmoGfx();
            this.popFxAmmo();
            return true;
        }

    }

    popFxAmmo(){
        this.ammoGfx?.forEach(x=>{x.entity.addComponent('script');x.entity.script.create('sinePop');});

    }

    get heldItemGfx(){
        // awkward. where does heldItemGfx live again?
        return Player.inventory.heldItem.entity;
    }

    updateAmmoGfx(){
        this.clearAmmoGfx();
        if (this.ammo.length == 0) {
            return;
        }
        let num = this.ammo[0];
        let count = this.ammo.length;
        this.clearAmmoGfx();
        const frac = new Fraction(num,1);
        const options =  {
            properties : {
               NumberSphereGfxOnly : frac
            }
        } 
        let b = new NumberSphereGfxOnly(options);
        b.entity.setLocalScale(new pc.Vec3(0.45,0.45,0.45));
        Game.hi = this.heldItemGfx;
        this.heldItemGfx.addChild(b.entity);
        b.entity.setLocalPosition(0,0.2,0);
        this.ammoGfx.push(b);

        // Ammo (1-9) in a circle at base
        const ammoScale = new pc.Vec3(0.2,0.2,0.2);
        const circle = Utils.GetCircleOfPoints3d({degreesToComplete:360,radius:.3,scale:.18,autoCount:false,count:9});
        circle.forEach(pos => { 
            if (--count > 0){
                let b = new NumberSphereGfxOnly(options);
                b.entity.setLocalScale(ammoScale),
                this.heldItemGfx.addChild(b.entity);
                b.entity.setLocalPosition(pos); 
                this.ammoGfx.push(b);
            }
        });
     
    }

}
