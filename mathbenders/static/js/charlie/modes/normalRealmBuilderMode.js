import RealmBuilderMode from "./realmBuilderMode.js";

export default class NormalRealmBuilderMode extends RealmBuilderMode {

    onMouseMove(e) {
        super.onMouseMove(e);
    }

    onMouseDown(e) {
        console.log("Normal down. ");
        console.log("this realm. "+this.realmEditor);
        if (this.realmEditor.ui.editablItemUnderCursor){
            this.realmEditor.toggle('editingItem');
        } else if (this.realmEditor.ui.mouseIsOverMap){

        }



        super.onMouseDown(e);
    }

    onMouseUp(e) {
        super.onMouseUp(e);
    }

}
