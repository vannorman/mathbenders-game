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

        let pos = Utils.getCenterOfEntities(this.entities);
        this.entity.moveTo(pos);
        this.entities.forEach(x=>{
            let p = x.getPosition();
            this.entity.addChild(x);
            x.moveTo(p);
        })
    }

    duplicate(){
        const copyDelta = realmEditor.camera.entity.forward.flat().normalize().mulScalar(20); // copy "north" from Camera view

        let templatesToCopy = [];
        this.entity.children.forEach(x=>{
            if (x._templateInstance) templatesToCopy.push(x._templateInstance)
        });
        let copies = []; 
        templatesToCopy.forEach(x=>{
            
            let copy = {
                data : x.getInstanceData(),
                position : x.entity.getPosition(),
                Template : x.constructor,
            }
            copies.push(copy);
        });

        let copiedEntities = [];
        copies.forEach(copy => {
            let p = copy.data.position.clone().add(copyDelta);
            p = Utils.getGroundPosFromPos(p);
            let c = realmEditor.InstantiateTemplate({
                ItemTemplate:copy.Template,
                position:p,
                rotation:copy.data.rotation,
                properties:copy.data.properties,
            });
            copiedEntities.push(c.entity);
       });

        let group = new Group({entities:copiedEntities});
        realmEditor.editItem({entity:group.entity,pop:true});
    }

    // need to detect unselect.
}


