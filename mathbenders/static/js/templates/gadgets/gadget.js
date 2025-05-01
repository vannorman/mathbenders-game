import Template from '../template.js';
import { HeldItem } from './heldItem.js';

export default class Gadget extends Template {
    static _icon; //= assets.textures.ui.trash;
    static pickupSound = assets.sounds.getGadget;
    static texture = assets.textures.gadget;
    static model;
    static get isGadget(){ return true; } // lol but ..
   
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
    popFxAmmo(){ }

    set properties(value){
        // console.log(value);
        const properties = value;
        if (properties.ammo) {
            this.ammo = properties.ammo;
        }
    }

}
// Only export the Gadget class
export { Gadget, HeldItem }

