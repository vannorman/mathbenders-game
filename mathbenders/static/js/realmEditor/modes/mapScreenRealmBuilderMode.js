import RealmBuilderMode from "./realmBuilderMode.js";

export default class MapScreenRealmBuilderMode extends RealmBuilderMode {

    #modes;
    #mode;

    // these gui things are populated in gui.circleButtons appear when object is placed
    // Destroy them on close.
    #guiButtonEntities=[];
    #guiElementEntities=[];
    #propertyInstances=[];

    constructor(params) {
        // this "mode" is really just a pass-thru to show and hide a ChangeMapScreen instance 
        // where all the populate level and click logic lives.
        super(params);
    }

    onEnter(){
        realmEditor.gui.terrain.changeMapScreen.group.enabled=true;
        realmEditor.gui.terrain.changeMapScreen.UpdateMapIcons({levels:realmEditor.RealmData.Levels});
    }


    onExit(){
        realmEditor.gui.terrain.changeMapScreen.group.enabled=false;
    }
}


