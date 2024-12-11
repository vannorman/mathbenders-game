import modes from "./modes/index.js"; // seeks "index.js" at root to import these
class RealmEditor {

    #isEnabled;
    #realm;
    #modes;
    #mode;

    constructor() {
        this.#isEnabled = false;
        this.#realm = null;
        this.#modes = modes;
        // Keep a reference to the currently active mode. Perhaps the reference should be named
        // 'activeMode' or 'currentMode' if 'mode' is not clear
        this.toggle('normal');
//        this.#mode = this.#modes['normal'];

        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);

        pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        pc.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        pc.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);
        GameManager.subscribe(this,this.onGameStateChange);
    }

    onGameStateChange(state) {
        switch(state){
        case GameState.RealmBuilder:
            // ("enable save/load so we can start worldbuilding.")
            //console.log("Levelbuilder on");
            this.enable();
            break;
        case GameState.Playing:
            //console.log("Levelbuilder off");
            this.disable();
            break;
        }
    }

    enable() {
        this.#isEnabled = true;
    }

    disable() {
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

