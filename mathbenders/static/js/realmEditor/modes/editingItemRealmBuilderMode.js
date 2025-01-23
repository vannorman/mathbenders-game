import RealmBuilderMode from "./realmBuilderMode.js";

// @Eytan - This will be a key file in next architecture decision, since all editable items will inherit from a superclass
// properties (unique per object) need to be saved and loaded in a predictable, serializable way
// properties need to dynamically populate the "editing" buttons and functionality

export default class EditingItemRealmBuilderMode extends RealmBuilderMode {

    #modes;
    #mode;

    // these gui things are populated in gui.circleButtons appear when object is placed
    // Destroy them on close.
    #guiButtonEntities=[];
    #guiElementEntities=[];
    #propertyInstances=[];

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
        this.ItemTemplate = entity.script.itemTemplateReference.itemTemplate.constructor;
        realmEditor.camera.translate({targetPivotPosition:entity.getPosition()});
        
        // Note that positions "0" and "3" around the cirlce are already taken.
        let i=1;
        const $this=this;
        this.ItemTemplate.editablePropertiesMap.forEach(x => {

            const editableProperty = new x.property({entity:entity});
            const ui = editableProperty.buildUi(x.onChangeFn,x.getCurValFn); 
            ui.enabled=false;
            const openPropertyBtn = UI.SetUpItemButton({
                parentEl:realmEditor.gui.circleButtons[i],
                width:30,height:30,
                textureAsset:x.property.icon,
                mouseDown:function(){
                    $this.#guiElementEntities.forEach(x=>{x.enabled=false;})
                    ui.enabled=true;
                },
            });
            // realmEditor.gui.circleButtons[i].addChild(ui); // this puts it underneath siblings

            // put it above siblings by reparenting it up one parent in hierarchy while maintaining local position
            let pare = realmEditor.gui.circleButtons[i];
            let p1 = pare.getLocalPosition();
            pare.parent.addChild(ui);
            ui.setLocalPosition(p1);

            i++;
            if (i==3) i++; // 3 is taken lol .. by default in editor gui circlebuttons setup. Need to fix this
           
            this.#guiButtonEntities.push(openPropertyBtn);
            this.#guiElementEntities.push(ui);
            this.#propertyInstances.push(editableProperty)
            Game.ui = ui;

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

    mapClicked(){
        this.toggle('poppingOut');
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
        this.#guiButtonEntities.forEach(x=>{x.destroy();});
        this.#guiElementEntities.forEach(x=>{x.destroy();});
        this.#propertyInstances.forEach(x=>{x=null;});
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
