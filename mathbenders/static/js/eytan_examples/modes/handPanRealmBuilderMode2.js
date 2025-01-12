import RealmBuilderMode from "./realmBuilderMode.js";

export default class HandPanRealmBuilderMode extends RealmBuilderMode {

    constructor(params) {
        super(params);
    }

    onMouseMove() {
        console.log('move pan'); 
        super.onMouseMove();
    }

    onMouseUp() {
        super.onMouseUp();
        this.realmBuilder.toggle('normal')
    }
}

