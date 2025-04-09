import Template from './template.js';

window.treeAsset = assets.models.trees.trees.resource.instantiateRenderEntity();

export class Tree1 extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.trees;
    index;

    constructor(args={}){
        const { index = 0 } = args;
        super(args);
        this.index=index;
    }
    setup(){
        const index = this.index == 0 ? 2 : 3;
        const tree = window.treeAsset.children[index].clone();
        tree.setLocalScale(1,1,1);
        this.entity.addChild(tree);
        tree.setLocalPosition(new pc.Vec3(0,0,0));
        const col = new pc.Entity("tree collider");
        col.addComponent('rigidbody', {type:pc.RIGIDBODY_TYPE_STATIC});
        col.addComponent('collision',{type:'cylinder',height:20,radius:2.5});
        this.entity.addChild(col);
        col.setLocalPosition(-1.5,0,1);
        tree.render.meshInstances[0].material=Materials.brown;
        tree.render.meshInstances[1].material=Materials.green;
        this.entity.tags.add(Constants.Tags.Tree); 
    }
}


