import Template from './template.js';
import {PropertyMap,ScaleProperty} from './properties.js';
window.treeAsset = assets.models.trees.tree1.resource.instantiateRenderEntity();

export class Tree1 extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.trees;
    index;

    static propertiesMap = [
         new PropertyMap({  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : ScaleProperty.constructor.name,
            property : ScaleProperty,
            // valueType : pc.Vec3,
            onChangeFn : (template,value) => {  template.scale = value; },
            getCurValFn : (template) => { return template.scale },
            min:0.5,
            max:100,
         }),
    ];

    get scale(){ return this.tree.getLocalScale(); }
    set scale(value) { 
        this.tree.setLocalScale(value); 
    }



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
        this.tree=tree;
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


