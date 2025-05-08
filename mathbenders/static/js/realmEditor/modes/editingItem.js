import Base from "./base.js";

// @Eytan - This will be a key file in next architecture decision, since all editable items will inherit from a superclass
// properties (unique per object) need to be saved and loaded in a predictable, serializable way
// properties need to dynamically populate the "editing" buttons and functionality

export default class EditingItem extends Base {

    #modes;
    #mode;

    // these gui things are populated in gui.circleButtons appear when object is placed
    // Destroy them on close.

    constructor(params) {
        super(params);
        this.#modes = new Map([
            ['editing', new EditingMode(this)],
            ['normal', new NormalMode(this)],
            ['poppingIn', new PoppingInMode(this)],
            ['poppingOut', new PoppingOutMode(this)],
        ]);
        this.#mode = this.#modes.get('editing');
    }


    setEntity(entity,pop=true){
        if (this.entity && this.entity.getGuid()==entity.getGuid()) {
            // ?? so
        }
        this.entity = entity;
        this.ItemTemplate = entity._templateInstance.constructor;
        realmEditor.camera.translate({targetPivotPosition:entity.getPosition()});
        // Note that positions "0" and "3" around the cirlce are already taken.
        let i=1;
        const $this=this;
        if (pop) realmEditor.gui.editItemTray.buildUiForItem({ItemTemplate:this.ItemTemplate,entity:entity});
        this.toggle('poppingIn',pop);
    }

    toggle(editMode,pop=true) {
        if (!editMode) return;
        if (!this.#modes.has(editMode)) return;

        if (pop){
            this.#mode.onExit();
            this.#mode = this.#modes.get(editMode);
            this.#mode.onEnter();
        }

        // iterate through placed entity editable features
        // foreach feature create a button
        // TODO: for placed Entity UI / data / behavior, document what is needed / and one specific example : Eytan
    }

    clickOffMap(){
        // User clicked away from map and no longer wants to edit this item; close the tray
        this.toggle('poppingOut');

    }

    mapClicked(){
        // User clicked on the map, but did not hit the tray, so the map was clicked; close the tray
        this.toggle('poppingOut');
    }

    onMouseMove(e) {
        super.onMouseMove(e);
    }

    onMouseDown(e) {
       // super.onMouseDown(e);
    }


    update(dt){
        this.#mode.update(dt);
    }

    onExit(){
        realmEditor.gui.editItemTray.entity.enabled=false; // Eytan; I'd like this to "shrink away" as I swtich to dragging mode.
        // But, that requires a "lingering" update here while drag mode is already enabled (meaning this mode, and thus its update, is disabled, so it can't shrink.)
    }
}

class EditMode {
    constructor(superMode){
        this.superMode = superMode;
    }
    onEnter() {}
    onExit() {}
    update(dt){}
}

class EditingMode extends EditMode {}
class NormalMode extends EditMode {}
class PoppingInMode extends EditMode {
    onEnter(){
        realmEditor.gui.editItemTray.entity.setLocalScale(0.1,0.1,0.1);
        realmEditor.gui.editItemTray.entity.enabled=true;
        
    }
    update(dt){
        const fudge = 0.01;
        if (realmEditor.gui.editItemTray.entity.localScale.x < 1.0-fudge) {
            const popInSpeed = 1000;
            const d = Math.lerp(realmEditor.gui.editItemTray.entity.localScale.x,1.0,dt * popInSpeed);
            realmEditor.gui.editItemTray.entity.setLocalScale(d,d,d);
        } else {
            this.superMode.toggle('editing');
        }
    }
}
class PoppingOutMode extends EditMode {

    update(dt){
        const fudge = 0.01;
        const minScale = 0.2;
        if (realmEditor.gui.editItemTray.entity.localScale.x > minScale + fudge) {
            const popInSpeed = 1000;
            const d = Math.lerp(realmEditor.gui.editItemTray.entity.localScale.x,0,dt * popInSpeed);
            realmEditor.gui.editItemTray.entity.setLocalScale(d,d,d);
        } else {
            realmEditor.gui.editItemTray.entity.enabled=true;
            this.superMode.toggle('normal');
            this.superMode.realmEditor.toggle('normal');
        }

    }

    onExit(){
        realmEditor.gui.editItemTray.entity.enabled=false;

    }
}
