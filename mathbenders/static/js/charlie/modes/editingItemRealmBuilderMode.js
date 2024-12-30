import RealmBuilderMode from "./realmBuilderMode.js";

export default class EditingItemRealmBuilderMode extends RealmBuilderMode {

    #modes;
    #mode;

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

    setEntity(entity){
        this.entity = entity;
        realmEditor.camera.translate({targetPivotPosition:entity.getPosition()});
        this.toggle('poppingIn');
    }

    toggle(editMode) {
        if (!editMode) return;
        if (!this.#modes.has(editMode)) return;

        this.#mode.onExit();
        this.#mode = this.#modes.get(editMode);
        this.#mode.onEnter();

        // iterate through placed entity editable features
        // foreach feature create a button
        // TODO: for placed Entity UI / data / behavior, document what is needed / and one specific example : Eytan
    }

    /*

    placedEntity schema
    {
        name
        pos
        rot
        editableFeatures{
            fraction
            wallDimension
            connectedPortal
        }
    }

    */

    onMouseMove(e) {
        super.onMouseMove(e);
    }

    onMouseDown(e) {
        super.onMouseDown(e);
    }


    update(dt){
        this.#mode.update(dt);
    }

    onExit(){
        

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
        realmEditor.gui.popUpEditItemTray.enabled=true;
        
    }
    update(dt){
        if (realmEditor.gui.popUpEditItemTray.localScale.x < 1.0-fudge) {
            const popInSpeed = 1000;
            const d = Math.lerp(realmEditor.gui.popUpEditItemTray.localScale.x,1.0,dt * popInSpeed);
            realmEditor.gui.popUpEditItemTray.setLocalScale(d,d,d);
        } else {
            this.superMode.toggle('editing');
        }
    }
}
class PoppingOutMode extends EditMode {

    update(dt){
        const minScale = 0.5;
        if (realmEditor.gui.popUpEditItemTray.localScale.x > minScale + fudge) {
            const popInSpeed = 1000;
            const d = Math.lerp(realmEditor.gui.popUpEditItemTray.localScale.x,minScale,dt * popInSpeed);
            realmEditor.gui.popUpEditItemTray.setLocalScale(d,d,d);
        } else {
            this.superMode.toggle('normal');
            this.superMode.realmEditor.toggle('normal');
        }

    }

    onExit(){
        realmEditor.gui.popUpEditItemTray.enabled=false;

    }
}
