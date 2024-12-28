import RealmBuilderMode from "./realmBuilderMode.js";

export default class DraggingObjectRealmBuilderMode extends RealmBuilderMode {

    // Todo: Eytan help? Pass relevant data from gui button press -> realmEditor -> set drag mode -> get data for obj and begin drag behavior
    #instantiationModes;
    #instantiationMode;

    constructor(params) {
        super(params);
        this.#instantiationModes = new Map([
            ['pre', new PreInstantiationDragMode()],
            ['post', new PostInstantiationDragMode()]
        ]);
        this.#instantiationMode = null;
    }

    toggle(dragMode) {
        if (!dragMode) return;
        if (!this.#instantiationModes.has(dragMode)) return;

        this.#instantiationMode.onExit();
        this.#instantiationMode = this.#instantiationModes.get(dragMode);
        this.#instantiationMode.onEnter();
    }

    onMouseMove() {
        console.log('move drag'); 
        super.onMouseMove();
        this.#instantiationMode.onMouseMove();
    }

    onMouseUp() {
        super.onMouseUp();
        let someCondition = true;
        if (someCondition) {

        }
        else {
            this.realmBuilder.toggle('normal')
        }
    }
}

// Abstract
class InstantiationDraggingMode {
    onEnter() {}
    onExit() {}
    onMouseMove() {}
}

class PreInstantiationDragMode extends InstantiationDraggingMode {
}

class PostInstantiationDragMode extends InstantiationDraggingMode {
}
