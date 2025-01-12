import RealmBuilderMode from "./realmBuilderMode.js";

export default class EditingItemRealmBuilderMode extends RealmBuilderMode {

    #modes;
    #mode;

    constructor(params) {
        super(params);
        this.#modes = new Map([
            ['editing', new EditingMode()],
            ['normal', new NormalMode()],
            ['poppingIn', new PoppingInMode()],
            ['poppingOut', new PoppingOutMode()],
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

    onMouseMove(e) {
        super.onMouseMove(e);
    }

    onMouseDown(e) {
        super.onMouseDown(e);
    }

}

class EditMode {
    onEnter() {}
    onExit() {}
}

class EditingMode extends EditMode {}
class NormalMode extends EditMode {}
class PoppingInMode extends EditMode {}
class PoppingOutMode extends EditMode {}
