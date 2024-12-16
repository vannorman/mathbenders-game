console.log('hi');
export default class RealmEditorUI {
    constructor(params={}){
        this.realmEditor = params.realmEditor;
        this.leftMargin = 240;
        this.createMap() // static? Once only
        this.createBuilderPanels();
        this.createMapButtons();
    }

    isMouseOverMap(){
        return Mouse.isMouseOverEntity(RealmBuilder.mapPanel)   // legacy ref. Should be this.mapPanel
        && !Mouse.isMouseOverEntity(RealmBuilder.mapControlPanel) // shouldn't need  to check "mouse isn't over" each. awkward.
        && !Mouse.isMouseOverEntity(RealmBuilder.changeMapBtn)
        && !Mouse.isMouseOverEntity(RealmBuilder.saveBtn)
        && !Mouse.isMouseOverEntity(RealmBuilder.loadBtn)

        && Mouse.cursorInPage; // got to be a better way ...!
    }


}


