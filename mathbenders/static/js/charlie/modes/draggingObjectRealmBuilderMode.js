import RealmBuilderMode from "./realmBuilderMode.js";

// Dislike / awkward how sometimes i call realmEditor.gui from the global object instead of something passed here
// Also dislike passing realmEditor instance from class to class down this hierarchy. Perhaps it's best

export default class DraggingObjectRealmBuilderMode extends RealmBuilderMode {

    // Todo: Eytan help? Pass relevant data from gui button press -> realmEditor -> set drag mode -> get data for obj and begin drag behavior
    #instantiationModes;
    #instantiationMode;
    templateName;
    #iconTextureAsset;

    constructor(params) {
        super(params);
        this.#instantiationModes = new Map([
            ['pre', new PreInstantiationDragMode(this)],
            ['post', new PostInstantiationDragMode(this)]
        ]);
        this.#instantiationMode = null;
    }

    toggle(args) {
        var {dragMode, templateName, iconTextureAsset} = args; // not happy with storing this.templateName for swapping modes
        console.log('toggle:'+dragMode);
        if (!dragMode) return;
        if (!this.#instantiationModes.has(dragMode)) return;

        // Sometimes template name WAS saved, sometimes it NEEDS to be saved .. awkward
        if (templateName) this.templateName = templateName;
        else if (this.templateName) templateName = this.templateName;
        if (iconTextureAsset) this.#iconTextureAsset = iconTextureAsset;
        else if (this.#iconTextureAsset) iconTextureAsset = this.#iconTextureAsset;


        if (this.#instantiationMode) this.#instantiationMode.onExit();
        this.#instantiationMode = this.#instantiationModes.get(dragMode);
        const data = { gui : this.realmEditor.gui, templateName : templateName, iconTextureAsset:iconTextureAsset}
        this.#instantiationMode.onEnter(data);
    }

    onStartDrag(data){
        const { iconTextureAsset, width=80, height=80, templateName } = data;
        console.log('this mode drag:'+this.#instantiationMode);
/*
        switch(this.#instantiationMode){
            case 
        }        case DraggingMode.PreInstantiation:
            this.customCursorIcon.enabled = true;
            this.customCursorIcon.element.textureAsset = iconTextureAsset;
            this.customCursorIcon.element.width = width;
            this.customCursorIcon.element.height = height;
        break;
        case DraggingMode.PostInstantiation:
            pc.app.graphicsDevice.canvas.style.cursor = 'auto';
            this.customCursorIcon.enabled = false;
            break;
*/
 
        
    }

    onMouseMove(e) {
        super.onMouseMove(e);
        this.#instantiationMode.onMouseMove(e);
    }

    onMouseUp(e) {
        super.onMouseUp(e);
        this.#instantiationMode.onMouseUp(e);
    }

    onExit(){
        this.#instantiationMode.onExit();
    }
}

// Abstract
class InstantiationDraggingMode {
    constructor(draggingObjectRealmBuilderMode) {
        this.draggingObjectRealmBuilderMode = draggingObjectRealmBuilderMode;
    } 
    onEnter(args) {}
    onExit() {}
    onMouseMove(e) {}
    onMouseUp(e){}

}

class PreInstantiationDragMode extends InstantiationDraggingMode {
    onEnter(args){
        console.log('enter pre');
        const { gui,templateName,iconTextureAsset} = args;
        this.draggingObjectRealmBuilderMode.templateName = templateName;
        realmEditor.gui.setCustomCusror(iconTextureAsset);
    }
    onExit(){
        console.log('pre exit');
        realmEditor.gui.setNormalCursor();
    }
    onMouseMove(e){
        if (realmEditor.gui.isMouseOverMap){
            const dragMode = 'post';
            const args = { dragMode:dragMode }
            this.draggingObjectRealmBuilderMode.toggle(args);
        }
    }
    onMouseUp(e){
        this.realmEditor.toggle('normal')
        
    }
}

class PostInstantiationDragMode extends InstantiationDraggingMode {
    #instantiatedItem;
   
    onEnter(args){
        console.log('enter post');
        realmEditor.gui.setNormalCursor();
        const data = {
            templateName : this.draggingObjectRealmBuilderMode.templateName,
        }
        this.#instantiatedItem = realmEditor.InstantiateItem(data);
        this.#instantiatedItem.disableColliders();
    }
    
    onExit(){
        console.log('post exit');
        if (this.#instantiatedItem) this.#instantiatedItem.entity.destroy();    
    }

    onMouseMove(e){
        if (realmEditor.gui.isMouseOverMap){
            if (this.#instantiatedItem){
                const p = realmEditor.gui.worldPointUnderCursor;
                this.#instantiatedItem.entity.moveTo(p);
            } else {
                console.log("but this shouldn't BE!!");
            }
        }
        if (!realmEditor.gui.isMouseOverMap){
            const dragMode = 'pre';
            const args = { dragMode:dragMode }
            this.draggingObjectRealmBuilderMode.toggle(args);
        }
    }
    onMouseUp(e){
        this.#instantiatedItem.enableColliders();
        this.#instantiatedItem = null;
        realmEditor.toggle('normal')
        realmEditor.beginEditingItemUnderCursor();
    }
 
 }
