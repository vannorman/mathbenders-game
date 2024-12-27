/*

    Q for Eytan
        - Can I avoid passing realmeditor multiple times (this => gui => builderpanel)?
        - How to access sub-states of modes, e.g. EditingItemRealmBuilderMode which has local vars that need to be bound via UI?
            - old way was within UI script to set SubMode() within BeginDrag or BeginEdit passing RealmBuilder.someObject
            - now, I need to bind these (when UI is created) and I need to reference current items; 
            - additionally I need to call setMode on the substate from the gui object
            - within Gui, can i do realmEditor.currentState.setState()? And it will fail if not in correct mode? I don't think the state behavior / instance is accessible this way?

*/

import {
    DraggingObjectRealmBuilderMode,
    EditingItemRealmBuilderMode,
    HandPanRealmBuilderMode,
    LoadScreenRealmBuilderMode,
    MapScreenRealmBuilderMode,
    NormalRealmBuilderMode,
    OrbitRealmBuilderMode
} from "./modes/index.js";

import GUI from './gui/base.js';
import EditorCamera from './camera.js';

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

        this.camera = new EditorCamera({realmEditor:this});
        this.gui = new GUI({ realmEditor:this });
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
console.log('re :');
console.log(realmEditor);



// Example usages
const onClick = () => {
    realmEditor.toggle('handpan');
}

// Perhaps when clicking on some object that listens to mouse events
// and has this callback assigned
const onSomeOtherClick = () => {
    realmEditor.toggle('draggingObject');
}

