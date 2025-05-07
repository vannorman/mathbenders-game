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

    startDraggingExistingItem(itemTemplate){
        this.ItemTemplate = itemTemplate.constructor;
        itemTemplate.onBeginDragByEditor();//disableColliders();
        this.toggle('post');
        this.mode.setDraggingItem(itemTemplate);
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

        
    #localMousePos;

    onMouseMove(e) {
        super.onMouseMove(e);
        this.mode?.onMouseMove(e);
        const mp = Mouse.getMousePositionInElement(realmEditor.gui.mapPanel);
        if (mp){
            this.#localMousePos=mp;
        }
    }

    update(dt){   
        const mp = this.#localMousePos;

        if (!mp ) return;
        let right = realmEditor.camera.entity.right.flat();
        let up = realmEditor.camera.entity.up.flat();
        let mov = new pc.Vec3();
        let speed=2.4;
        if (false && mp[0] < 0.05) mov.add(right.clone().mulScalar(-speed));
        else if (mp[0] > 0.95) mov.add(right.clone().mulScalar(speed));
        if (mp[1] < 0.05) mov.add(up.clone().mulScalar(-speed));
        else if (mp[1] > 0.95) mov.add(up.clone().mulScalar(speed));
        if (mov.length() >= 0.05) {
            this.realmEditor.camera.pivot.translate(mov);
        }


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
        realmEditor.gui.setCustomCusror(this.dragger.ItemTemplate.icon());
    }
    onExit(){
        realmEditor.gui.setNormalCursor();
    }
    onMouseMove(e){
        if (realmEditor.gui.isMouseOverMap && realmEditor.gui.worldPointUnderCursor){
            this.instantiateItem();
       }
    }
    onMouseUp(e){
        realmEditor.toggle('normal')
        
    }

    instantiateItem(){
        const instantiatedItem = realmEditor.InstantiateTemplate({ItemTemplate:this.dragger.ItemTemplate});
        //console.log(this.dragger.ItemTemplate);
        instantiatedItem.onBeginDragByEditor();//disableColliders();
        this.dragger.toggle('post');
        this.dragger.mode.setDraggingItem(instantiatedItem);

    }
    
    
}


class PostInstantiationDragMode extends InstantiationDraggingMode {
    #instantiatedItem;

    setDraggingItem(templateInstance){
        this.#instantiatedItem = templateInstance;
        this.dragger.ItemTemplate = templateInstance.constructor; 
    }
   
    onEnter(){
        realmEditor.gui.setNormalCursor();
   }
    
    onExit(){
        if (this.#instantiatedItem) this.#instantiatedItem.entity.destroy();     // does this not destroy the ItemTemplate? @Eytan
    }

    #lastP;
    onMouseMove(e){
        if (realmEditor.gui.isMouseOverMap){
            if (this.#instantiatedItem){
                const p = realmEditor.gui.worldPointUnderCursor;
                if (p){
                    this.#lastP=p;
                    // console.log(p);
                    this.#instantiatedItem.entity.moveTo(p);
                    this.#instantiatedItem.onDragByEditor();
                } else {
                    // console.log("no point under cursor");
                    this.#instantiatedItem.entity.moveTo(this.#lastP);

                }
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
        this.#instantiatedItem.onEndDragByEditor();//enableColliders();
        this.#instantiatedItem = null;
        this.dragger.realmEditor.undoRedo.CaptureAndRegisterState();
        this.dragger.realmEditor.editItem({entity:entity});
    }
 
}
