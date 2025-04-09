import Template from './template.js';

window.treeAsset = assets.models.trees.tree1.resource.instantiateRenderEntity();

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
        const tree = window.treeAsset.clone();
        let r = function(){ return 0.008 + Math.random() * 0.006; }
        tree.setLocalScale(r(),r(),r());
        this.entity.addChild(tree);
        tree.setLocalPosition(new pc.Vec3(0,0,0));
        const col = new pc.Entity("tree collider");
        col.addComponent('rigidbody', {type:pc.RIGIDBODY_TYPE_STATIC});
        col.addComponent('collision',{type:'cylinder',height:20,radius:2.5});
        this.entity.addChild(col);
        col.setLocalPosition(-1.5,0,1);
        // tree.render.meshInstances[0].material=Materials.brown;
        // tree.render.meshInstances[1].material=Materials.green;
        Game.t = this;
        // ApplyTextureAssetToMeshInstance({meshInstance:window.treeAsset.children[2].render.meshInstances[0],textureAsset:assets.textures.terrain.tree_brown});
        // ApplyTextureAssetToMeshInstance({meshInstance:tree.render.meshInstances[1],textureAsset:assets.textures.terrain.tree_green});

        this.entity.tags.add(Constants.Tags.Tree); 
    }
}


