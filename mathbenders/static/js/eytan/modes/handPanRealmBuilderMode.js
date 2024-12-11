import RealmBuilderMode from "./realmBuilderMode.js";

export default class HandPanRealmBuilderMode extends RealmBuilderMode {
    onMouseMove(e) {
        super.onMouseMove(e);
    }

    onMouseDown(e) { /* No operation per the existing code */ }

    onMouseUp(e) {
        super.onMouseUp(e);
        this.realmBuilder.toggle('normal');
    }

}