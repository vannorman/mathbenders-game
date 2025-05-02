import Template from './template.js';
import { Scale} from './properties.js';
window.treeAsset = assets.models.trees.tree1.resource.instantiateRenderEntity();

export class Tree1 extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.trees;

    static properties = [
        new Scale({
             name : "TreeScale Property",
            property : Scale,
            // valueType : pc.Vec3,
            onInitFn : (template,value) => { template.scale = value; },
            onChangeFn : (template,value) => {  console.log("onch:"+value); template.setScale(value); },
            getCurValFn : (template) => { return template.scale },
            min:0.5,
            max:5,
            deltaScale:0.1,
        }),
    ];


    scale=null;
    setScale(value) { 
        this.scale=value;
        this.tree.setLocalScale(value); 
    }



    constructor(args){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        const treeChild = window.treeAsset.clone(); // it is very big; needs to be reduced from 1,1,1 to .01,.01,.01
        const tree = new pc.Entity();
        this.entity.addChild(tree);
        tree.addChild(treeChild);
        treeChild.setLocalScale(0.01,0.01,0.01); 
        this.tree=tree;

        if (this.scale == null) {
            let r = function(){ return 0.8 + Math.random() * 0.6; }
            this.scale = new pc.Vec3(r(),r(),r());
        } 

        this.setScale(this.scale);

        tree.setLocalPosition(new pc.Vec3(0,-1,0));
        const col = new pc.Entity("tree collider");
        col.addComponent('rigidbody', {type:pc.RIGIDBODY_TYPE_STATIC});
        col.addComponent('collision',{type:'capsule',height:20,radius:1.5});
        col.addComponent('render',{type:'cylinder',height:20,radius:1});
        //  col.addComponent('render',{type:'cylinder',material:Materials.red}); // debug collider position.
        this.entity.addChild(col);
        // col.setLocalPosition(-.3,0,.3);
        col.setLocalPosition(0,0,0);
        // ApplyTextureAssetToMeshInstance({meshInstance:window.treeAsset.children[2].render.meshInstances[0],textureAsset:assets.textures.terrain.tree_brown});
        // ApplyTextureAssetToMeshInstance({meshInstance:tree.render.meshInstances[1],textureAsset:assets.textures.terrain.tree_green});

        this.entity.tags.add(Constants.Tags.Tree); 
        this.updateColliderMap();
    }
}


