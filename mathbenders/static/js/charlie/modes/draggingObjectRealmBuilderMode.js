import RealmBuilderMode from "./realmBuilderMode.js";

// Dislike / awkward how sometimes i call realmEditor.gui from the global object instead of something passed here
// Also dislike passing realmEditor instance from class to class down this hierarchy. Perhaps it's best

export default class DraggingObjectRealmBuilderMode extends RealmBuilderMode {

    // Todo: Eytan help? Pass relevant data from gui button press -> realmEditor -> set drag mode -> get data for obj and begin drag behavior
    modes;
    mode;

    templateName;
    iconTextureAsset;

    constructor(params) {
        super(params);
        this.modes = new Map([
            ['pre', new PreInstantiationDragMode(this)],
            ['post', new PostInstantiationDragMode(this)]
        ]);
        this.mode = null;
    }

    
    setData(data){
        const {
            // draggingEntity, 
            templateName, 
            iconTextureAsset
        } = data;
        this.templateName = templateName;
        this.iconTextureAsset = iconTextureAsset;
    }

    startDraggingExistingItem(item){
        item.disableColliders();
        this.toggle('post');
        this.mode.setDraggingItem(item);
    }
    
    toggle(mode) {
        // Awkward because sometimes this is toggled internally (drag mouse between map and not-map)
        // Whereas other times it's called externally (as from realmEditor.mode.toggle())
        
        if (!mode) return;
        if (!this.modes.has(mode)) return;
        if (this.mode) this.mode.onExit();
        this.mode = this.modes.get(mode);
        this.mode.onEnter();

    }

        

    onMouseMove(e) {
        super.onMouseMove(e);
        this.mode?.onMouseMove(e);
    }

    onMouseUp(e) {
        super.onMouseUp(e);
        this.mode?.onMouseUp(e);
    }

    onExit(){
        this.mode?.onExit();
    }
}

// Abstract
class InstantiationDraggingMode {
    constructor(dragger) {
        this.dragger = dragger;
    } 
    onEnter() {}
    onExit() {}
    onMouseMove(e) {}
    onMouseUp(e){}

}

class PreInstantiationDragMode extends InstantiationDraggingMode {
    onEnter(){
        this.dragger.realmEditor.gui.setCustomCusror(this.dragger.iconTextureAsset);
    }
    onExit(){
        realmEditor.gui.setNormalCursor();
    }
    onMouseMove(e){
        if (realmEditor.gui.isMouseOverMap){
            this.instantiateItem();
       }
    }
    onMouseUp(e){
        realmEditor.toggle('normal')
        
    }

    instantiateItem(){
        const instantiatedItem = realmEditor.InstantiateItem({templateName:this.dragger.templateName});
            console.log('inst.');
        instantiatedItem.disableColliders();
        this.dragger.toggle('post');
        this.dragger.mode.setDraggingItem(instantiatedItem);

    }
    
    
}


class PostInstantiationDragMode extends InstantiationDraggingMode {
    #instantiatedItem;

    setDraggingItem(item){
        this.#instantiatedItem = item;
    }
   
    onEnter(){
        realmEditor.gui.setNormalCursor();
   }
    
    onExit(){
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
            this.dragger.toggle('pre');
        }
    }

    onMouseUp(e){
        this.placeItem();
   }
    
    placeItem(){
        const entity = this.#instantiatedItem.entity;
        this.#instantiatedItem.enableColliders();
        this.#instantiatedItem = null;
        this.dragger.realmEditor.editItem(entity);
    }
 
}
