import Template from './template.js';
// import {PropertyMap,ScaleProperty} from './properties.js';
export class Group extends Template {
    
    static _icon = assets.textures.ui.icons.trees;
    uuidsList=[];
    constructor(args={}){
        super(args);
    }
    setup(){
        let group = new pc.Entity();

    }
}


