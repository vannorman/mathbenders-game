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
        let pos = Utils.getCenterOfEntities(this.entities);
        this.entity.moveTo(pos);
        this.entities.forEach(x=>{
            let p = x.getPosition();
            this.entity.addChild(x);
            x.moveTo(p);
        })
    }

    duplicate(){
        let copies = []; 
        let templatesToCopy = [];
        this.entity.children.forEach(x=>{
            if (x._templateInstance) templatesToCopy.push(x._templateInstance)
        });
        templatesToCopy.forEach(x=>{
            let copy = {
                data : x.getInstanceData(),
                position : x.entity.getPosition(),
                Template : x.constructor,
            }
            copies.push(copy);
        });

        const $this = this;
        return { 
            copies:copies, 
            postCopyFn:(entities)=>{
                console.log(`Copying group`);
                let group = new Group({entities:entities});
                realmEditor.editItem(group.entity);
            }
        };
    }

    // need to detect unselect.
}


