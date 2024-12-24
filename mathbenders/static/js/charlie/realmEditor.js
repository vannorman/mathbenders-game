import {
    DraggingObjectRealmBuilderMode,
    EditingItemRealmBuilderMode,
    HandPanRealmBuilderMode,
    LoadScreenRealmBuilderMode,
    MapScreenRealmBuilderMode,
    NormalRealmBuilderMode,
    OrbitRealmBuilderMode
} from "./modes/index.js";

import GUI from './ui/base.js';
import Camera from './camera.js';

class RealmEditor {

    // 'object', 'entity', 'item' terminology ?

    #isEnabled;
    #realm;
    #modes;
    #mode;
    #RealmData;


    constructor() {
        this.#isEnabled = false;
        this.#realm = null;
        this.#modes = new Map([
            ['draggingObject', new DraggingObjectRealmBuilderMode({realmEditor: this})],
            ['editingItem', new EditingItemRealmBuilderMode({realmEditor: this})],
            ['handpan', new HandPanRealmBuilderMode({realmEditor: this})],
            ['loadScreen', new LoadScreenRealmBuilderMode({realmEditor: this})],
            ['mapScreen', new MapScreenRealmBuilderMode({realmEditor: this})],
            ['normal', new NormalRealmBuilderMode({realmEditor: this})],
            ['orbit', new OrbitRealmBuilderMode({realmEditor: this})]
        ]);

        this.toggle('normal');
//        this.enable = this.enable.bind(this);
//        this.disable = this.disable.bind(this);

        pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        pc.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        pc.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);

        GameManager.subscribe(this,this.onGameStateChange);

        // ui constants
        this.gui = new GUI({realmEditor:this});
        // First, create the UI including builder panel
        
        let camera = new Camera();
        // Second, create the camera, render texture and assign it to the UI.mapPanel
    }

    onGameStateChange(state) {
        switch(state){
        case GameState.RealmBuilder:
            this.enable();
            break;
        case GameState.Playing:
            this.disable();
            break;
        }
    }

    enable() {
        this.#isEnabled = true;
        this.toggle('normal');
        this.gui.enable();
        AudioManager.play({source:assets.sounds.ui.open});
        
        return;

        
        this.MoveCamera({source:"enable",targetPivotPos:RealmBuilder.RealmData.Levels[0].terrain.centroid,targetZoomFactor:RealmBuilder.defaultZoomFactor})
        
        // To re-load the existing level ..
        const realmData = JSON.stringify(this.#RealmData); // copy existing realm data
        this.#RealmData.Clear(); // delete everything
        this.LoadJson(realmData);
 
    }

    disable() {
        AudioManager.play({source:assets.sounds.ui.play}),
        this.gui.disable();
        this.#isEnabled = false;
    }

    // Invoked by a caller, likely current mode or some button onClick,
    // to toggle the current mode
    toggle(mode) {
        console.log('set:'+mode);
        console.log(this.#modes);
        // If the 'mode' does not exist, return
        if (!this.#modes.has(mode)) return;

        // Exit the current mode (if there is one)
        // Point to the mode to use
        // Enter the new current mode
        if (this.#mode) this.#mode.onExit();
        this.#mode = this.#modes.get(mode);
        this.#mode.onEnter();
    }

    onMouseUp(e) {
        if (!this.#isEnabled) return;

        this.#mode.onMouseUp();
    }

    onMouseDown(e) {
        if (!this.#isEnabled) return;

        this.#mode.onMouseDown();
    }

    onMouseMove(e) {
        if (!this.#isEnabled) return;

        if (e.dx > 100) e.dx = 0;
        if (e.dy > 100) e.dy = 0;
        this.#mode.onMouseMove();
    }

    onMouseScroll(e) {
        if (!this.#isEnabled) return;

        this.#mode.onMouseScroll();
    }

    update(dt) {
    //    console.log("update new");
        if (!this.#isEnabled) return;
    }


    get editableItemUnderCursor(){
        const w = pc.app.graphicsDevice.width;
        const leftMargin = this.ui.leftMargin * pc.app.graphicsDevice.width / Constants.Resolution.width;
        let invXmap = (-leftMargin + Mouse.x) * (pc.app.graphicsDevice.width-leftMargin)/pc.app.graphicsDevice.width;
        let mx = (Mouse.x - leftMargin);
        let ww = w - leftMargin;
        let adjust = leftMargin*(ww - mx)/ww;
        let raycastResult = Camera.sky.screenPointToRay(Mouse.x-adjust,Mouse.y);
        // Whew ok bs math is over
        // Todo: Move this point translation to a Camera constant getter?
        let editableItemUnderCursor = null; // is it performant to reset this every frame? I think so enough
        if (raycastResult) {
            if (raycastResult.entity) {
                this.worldPointUnderCursor = raycastResult.point;
                this.lastCameraDistance = pc.Vec3.distance(this.worldPointUnderCursor,Camera.sky.entity.getPosition());
                // editable item under cursor? while in normal mode?
                // editable item may be a "parent" with no colliders, so go upstream until we find it
                const parentDepthSearch = 5;
                let par = raycastResult.entity;

                for(i=0;i<parentDepthSearch;i++){
                    if (par.tags._list.includes(Constants.Tags.BuilderItem)){
                        editableItemUnderCursor = par;
                        return;
                    } else {
                    //    if (par.name == "NumberHoop") console.log('not found:'+par.name+","+par.getGuid()+" vs "+item.obj.getGuid());
                        par = par.parent ? par.parent : par;
                    }
                }
            }
        } else {
            let wc = new pc.Vec3()
            Camera.sky.screenToWorld(Mouse.x,pc.app.graphicsDevice.height-Mouse.y,0,wc);
            this.worldPointUnderCursor = wc.add(Camera.sky.entity.forward.mulScalar(this.lastCameraDistance));
        }

        return editableItemUnderCursor;

    }

    Save(){

    }

    Load(){

    }

    NewRealm(){

    }

    SetEditableItemMode() {
        // Eytan - how pass this to the mode? Should only be possible within that mode?
    }

    BeginDraggingObject(obj) {

    }

    get editingItem(){ 
        // Eytan - todo - how to extract editing item from that mode? Or call it directly skipping realmEditor
        return null;
//        return this.#editingItem;

    }

    RotateEditingItem(deg){
        // e.g. this.editingItemMode.#editingItem.rotate(-45);}

    }




}

// Created somewhere in the code where it makes sense
window.realmEditor = new RealmEditor();



// Example usages
const onClick = () => {
    realmEditor.toggle('handpan');
}

// Perhaps when clicking on some object that listens to mouse events
// and has this callback assigned
const onSomeOtherClick = () => {
    realmEditor.toggle('draggingObject');
}

