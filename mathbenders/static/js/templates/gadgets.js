import Template from './template.js';
import { HeldItem } from './gadgets/heldItem.js';
import { Sword } from './gadgets/sword.js';
import { Multiblaster } from './gadgets/multiblaster.js';
import { Gadget } from './gadgets/gadget.js';

export  {Sword}   from './gadgets/sword.js';
export  {Multiblaster } from './gadgets/multiblaster.js';
export {HeldItem } from './gadgets/heldItem.js';

class GadgetPickup extends Template {}
export class MultiblasterPickup extends GadgetPickup {
    static _icon = assets.textures.ui.icons.multiblaster;
    static isStaticCollider = true;

    static onCollect(){
        return Multiblaster;
    }

    setup(args={}){

        // graphics
        this.entity.tags.add(Constants.Tags.PlayerCanPickUp);
        const blaster = assets.models.gadgets.multiblaster.resource.instantiateRenderEntity();
        ApplyTextureAssetToEntity({entity:blaster,textureAsset:assets.textures.gadget});
        this.entity.addChild(blaster);
        blaster.setLocalEulerAngles(0,-90,-90);
        blaster.setLocalPosition(pc.Vec3.UP);

        // pickup item 
        this.entity.addComponent('collision');
        this.entity.addComponent('rigidbody',{type:'kinematic'});

    }
}


export class SwordPickup extends GadgetPickup {
    static _icon = assets.textures.ui.icons.sword;
    static isStaticCollider = true;

    static onCollect(){
        return Sword;
    }

    setup(args={}){

        // graphics

        this.entity.tags.add(Constants.Tags.PlayerCanPickUp);
        const sword = assets.models.gadgets.sword.resource.instantiateRenderEntity();
        ApplyTextureAssetToEntity({entity:sword,textureAsset:assets.textures.gadget});
        this.entity.addChild(sword);
        sword.setLocalEulerAngles(90,0,90);
        sword.setLocalPosition(pc.Vec3.UP);

        // pickup item 
        this.entity.addComponent('collision');
        this.entity.addComponent('rigidbody',{type:'kinematic'});

    }
}


