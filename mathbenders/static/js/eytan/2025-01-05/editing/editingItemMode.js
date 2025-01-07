import Editable from "./editable";

class RealmBuilderMode {
    onEnter() {
        const mouse = pc.app.mouse;
        mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);
    }

    onExit() {
        const mouse = pc.app.mouse;
        mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);
    }
}

class EditingItemMode extends RealmBuilderMode {

    #editable;
    #modes;
    #mode;

    constructor() {
        super();
        this.#editable = null;
        this.#modes = new Map([
            ['editing', new EditingMode(this)],
            ['normal', new NormalMode(this)],
            ['poppingIn', new PoppingInMode(this)],
            ['poppingOut', new PoppingOutMode(this)],
        ]);
        this.#mode = this.#modes.get('editing');
    }

    toggle(editMode) {
        if (!editMode) return;
        if (!this.#modes.has(editMode)) return;

        this.#mode.onExit();
        this.#mode = this.#modes.get(editMode);
        this.#mode.onEnter();
    }

    onEnter() {
        this.#editable = new Editable({}); // retrieve from Mouse.
        this.#editable.modifiers.forEach((modifier, modifierName) => {
            // Render each modifier for selection
        });
        this.toggle('editing');
    }

    onExit() {
        this.#editable = null;
    }

}

class EditMode {
    onEnter(editable) {
        this.editable = editable;

        const mouse = pc.app.mouse;
        mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);
    }

    onExit() {
        this.editable = null;

        const mouse = pc.app.mouse;
        mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);
    }

    onMouseMove(e) {
    }

    onMouseUp(e) {
    }

    onMouseDown(e) {
    }

    onMouseScroll(e) {
    }
}

class EditingMode extends EditMode {
    constructor(editingItemMode) {
        super();
    }
}

class NormalMode extends EditMode {
    constructor(editingItemMode) {
        super();
    }
}

class PoppingInMode extends EditMode {
    constructor(editingItemMode) {
        super();
    }

    onEnter() {
        realmEditor.gui.popUpEditItemTray.setLocalScale(0.1, 0.1, 0.1);
        realmEditor.gui.popUpEditItemTray.enabled = true;

    }

    update(dt) {
        const fudge = 0.01;
        if (realmEditor.gui.popUpEditItemTray.localScale.x < 1.0 - fudge) {
            const popInSpeed = 1000;
            const d = Math.lerp(realmEditor.gui.popUpEditItemTray.localScale.x, 1.0, dt * popInSpeed);
            realmEditor.gui.popUpEditItemTray.setLocalScale(d, d, d);
        } else {
            this.superMode.toggle('editing');
        }
    }
}

class PoppingOutMode extends EditMode {
    constructor(editingItemMode) {
        super();
    }


    update(dt) {
        const fudge = 0.01;
        const minScale = 0.2;
        if (realmEditor.gui.popUpEditItemTray.localScale.x > minScale + fudge) {
            const popInSpeed = 1000;
            const d = Math.lerp(realmEditor.gui.popUpEditItemTray.localScale.x, 0, dt * popInSpeed);
            realmEditor.gui.popUpEditItemTray.setLocalScale(d, d, d);
        } else {
            realmEditor.gui.popUpEditItemTray.enabled = true;
            this.superMode.toggle('normal');
            this.superMode.realmEditor.toggle('normal');
        }

    }

    onExit() {
        realmEditor.gui.popUpEditItemTray.enabled = false;

    }
}
