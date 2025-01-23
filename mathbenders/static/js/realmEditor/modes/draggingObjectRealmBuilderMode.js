import RealmBuilderMode from "./realmBuilderMode.js";

// Dislike / awkward how sometimes i call realmEditor.gui from the global object instead of something passed here
// Also dislike passing realmEditor instance from class to class down this hierarchy. Perhaps it's best

// Bug - on second initiate drag of existing item via Move button on popUpItem interface, the ItemTemplate is lost.

export default class DraggingObjectRealmBuilderMode extends RealmBuilderMode {

    // Todo: Eytan help? Pass relevant data from gui button press -> realmEditor -> set drag mode -> get data for obj and begin drag behavior
    modes;
    mode;

    ItemTemplate;

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
            ItemTemplate, 
        } = data;
        this.ItemTemplate = ItemTemplate;
    }

    startDraggingExistingItem(item){
        console.log("Start dragging."); 
        console.log(item);
        this.ItemTemplate = item.template; 
        console.log("This item template:");
        console.log(this.ItemTemplate);
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
        //let icon = assets.textures.ui.trash;
        //if (this.dragger?.ItemTemplate) icon = this.dragger.ItemTemplate.icon;
        // this.dragger.realmEditor.gui.setCustomCusror(icon);
        this.dragger.realmEditor.gui.setCustomCusror(this.dragger.ItemTemplate.icon);
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
        console.log("instancing w dragger:"+this.dragger+" and itemtemplate:"+this.dragger.ItemTemplate?.name);
        const instantiatedItem = realmEditor.InstantiateItem({ItemTemplate:this.dragger.ItemTemplate});
        instantiatedItem.disableColliders();
        this.dragger.toggle('post');
        this.dragger.mode.setDraggingItem(instantiatedItem);

    }
    
    
}


class PostInstantiationDragMode extends InstantiationDraggingMode {
    #instantiatedItem;

    setDraggingItem(item){
        console.log("Set drag item");
        console.log(item);
        this.#instantiatedItem = item;
        this.dragger.ItemTemplate = item.template; 
    }
   
    onEnter(){
        realmEditor.gui.setNormalCursor();
   }
    
    onExit(){
        if (this.#instantiatedItem) this.#instantiatedItem.entity.destroy();     // does this not destroy the ItemTemplate? @Eytan
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
