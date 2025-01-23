import RealmBuilderMode from "./realmBuilderMode.js";

// @Eytan - This will be a key file in next architecture decision, since all editable items will inherit from a superclass
// properties (unique per object) need to be saved and loaded in a predictable, serializable way
// properties need to dynamically populate the "editing" buttons and functionality

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
        this.ItemTemplate = templateNameMap[entity.script.itemTemplateReference.itemTemplate];
        realmEditor.camera.translate({targetPivotPosition:entity.getPosition()});
        
        // Note that positions "0" and "3" around the cirlce are already taken.
        let i=1;
        this.ItemTemplate.editablePropertiesMap.forEach(x => {
            const ui = x.property.buildUi(); 
            ui.enabled=false;
            const openPropertyBtn = UI.SetUpItemButton({
                parentEl:realmEditor.gui.circleButtons[i],
                width:30,height:30,
                textureAsset:x.property.icon,
                mouseDown:function(){ui.enabled=true;},
            });
            realmEditor.gui.circleButtons[i].addChild(ui);
        });
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

    onMouseUp(e){
        if (this.realmEditor.gui.isMouseOverMap && !Mouse.isMouseOverEntity(this.realmEditor.gui.editableItemBackboard)) {
            this.toggle('poppingOut');
        }
    }

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
        realmEditor.gui.popUpEditItemTray.enabled=false; // Eytan; I'd like this to "shrink away" as I swtich to dragging mode.
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
        realmEditor.gui.popUpEditItemTray.setLocalScale(0.1,0.1,0.1);
        realmEditor.gui.popUpEditItemTray.enabled=true;
        
    }
    update(dt){
        const fudge = 0.01;
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
        const fudge = 0.01;
        const minScale = 0.2;
        if (realmEditor.gui.popUpEditItemTray.localScale.x > minScale + fudge) {
            const popInSpeed = 1000;
            const d = Math.lerp(realmEditor.gui.popUpEditItemTray.localScale.x,0,dt * popInSpeed);
            realmEditor.gui.popUpEditItemTray.setLocalScale(d,d,d);
        } else {
            realmEditor.gui.popUpEditItemTray.enabled=true;
            this.superMode.toggle('normal');
            this.superMode.realmEditor.toggle('normal');
        }

    }

    onExit(){
        realmEditor.gui.popUpEditItemTray.enabled=false;

    }
}
