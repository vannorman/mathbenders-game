import Template from './template.js';
// import {PropertyMap,ScaleProperty} from './properties.js';
export class Group extends Template {
   

    // A temporary container which allows the editing, copying, moving etc of a group of items.

    static _icon = assets.textures.ui.icons.trees;
    uuidsList=[];
    entities=[];
    constructor(args={}){
        super(args);
        const $e = this.entity;
        this.entity.on('destroy',function(){
            $e.children.forEach(x=>{
                pc.app.root.addChild(x);
            });
        });

    }

    setup(args){
        const {entities}=args;
        this.entities = entities;

        console.log("set w ents:"+this.entities);
        let group = new pc.Entity();
        this.entities.forEach(x=>{
            let p = x.getPosition();
            this.entity.addChild(x);
            x.moveTo(p);
        })
    }

    // need to detect unselect.
}


