import Template from './template.js';

window.treeAsset = assets.models.trees.trees.resource.instantiateRenderEntity();
export class Tree1 extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.trees;

    setup(){ 
        console.log("setup tree?");
        const tree = window.treeAsset.children[2].clone();
        tree.setLocalScale(1,1,1);
        this.entity.addChild(tree);
        tree.setLocalPosition(new pc.Vec3(0,0,0));
        const col = new pc.Entity("tree collider");
        col.addComponent('rigidbody', {type:pc.RIGIDBODY_TYPE_KINEMATIC});
        col.addComponent('collision',{type:'cylinder',height:20,radius:2.5});
        this.entity.addChild(col);
        col.setLocalPosition(-1.5,0,1);
        tree.render.meshInstances[0].material=Materials.brown;
        tree.render.meshInstances[1].material=Materials.green;
    }
}


