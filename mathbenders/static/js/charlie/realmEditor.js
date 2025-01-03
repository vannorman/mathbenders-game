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
import PlacedItem from './placedItem.js';
import Level from './level.js';
import RealmData from './realmData.js';
import TerrainCentroidManager from './terrainCentroidManager.js';
import Terrain from './terrain.js';

class RealmEditor {

    // 'object', 'entity', 'item' terminology ?

    #isEnabled;
    #realm;
    #modes;
    #mode;
    #RealmData;
    #UpdateInitialized=false;

    get mode(){return this.#mode}

    get RealmData(){
        return this.#RealmData;
    }

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

        pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        pc.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        pc.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);

        GameManager.subscribe(this,this.onGameStateChange);

        this.camera = new EditorCamera({realmEditor:this});
        this.gui = new GUI({ realmEditor:this });

        window.terrainCentroidManager = new TerrainCentroidManager(); // awkward as fuck to create this global thing here .. :) 
        // BUT, if I don't, I run into dependency loops which to resolve I have to pass references everywhere

        this.#RealmData = new RealmData();

        // but this creates infintie?
        // pc.app.on('update',this.update);

    }


    onGameStateChange(state) {
        switch(state){
        case GameState.RealmBuilder:
            this.enable();
            if (!this.#UpdateInitialized){
                this.#UpdateInitialized=true;
                pc.app.on('update',function(dt){realmEditor.update(dt);}); // weird; if I use "this" it loops infinite
                
            }
            break;
        case GameState.Playing:
            this.ConnectPortals();
            this.disable();
            break;
        }
    }

    ConnectPortals(){
        // Arbitrary portal logic that should be pushed to the Portal / placedItem data
        let portals = [];
        pc.app.root.getComponentsInChildren('portal').forEach(portal=>{
            if (portal)  {
                portals.push(portal);
            }
        });

        // now we have a list of portals; connect every 2 of them
        for (let i=0;i<portals.length-1;i+=2){
            portals[i].ConnectTo(portals[i+1]);
            portals[i+1].ConnectTo(portals[i]);
        }
    
 
    enable() {
        this.#isEnabled = true;
        this.toggle('normal');
        this.gui.enable();
        AudioManager.play({source:assets.sounds.ui.open});
        this.camera.translate({source:"enable",targetPivotPosition:this.RealmData.currentLevel.terrain.centroid});
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
        this.#mode.onMouseMove(e);
    }

    onMouseScroll(e) {
        if (!this.#isEnabled) return;
        this.#mode.onMouseScroll(e);
    }

    update(dt) {
        // console.log("update new");
        if (this.mode ) this.mode.update(dt);
        this.camera.update(dt);
    }


    LoadData(realmData){
        realmData.Levels.forEach(level => {
            levelJson._placedItems.forEach(x=>{
                let obj = this.InstantiateItem({level:level,templateName:x.templateName});
                obj.moveTo(JsonUtil.ArrayToVec3(x.position).add(thisLevel.terrain.centroid),JsonUtil.ArrayToVec3(x.rotation));
            })
 
        });
    }
    
    LoadJson(realmJson){
        realmJson = Utils.cleanJson(realmJson); // If we used Eytan's idea of a json file service ......

        const levels = [];
        realmJson.Levels.forEach(levelJson => {
            let thisLevel = new Level({skipTerrainGen:true});
            levels.push(thisLevel);

            let terrainData = levelJson._terrain;
            terrainData.centroid = terrainCentroidManager.getCentroid();
            thisLevel.terrain = new Terrain(terrainData);
            const $this = this;
            thisLevel.terrain.generate("foreach json for "+realmJson.name);
 
            levelJson._placedItems.forEach(x=>{
                let obj = this.InstantiateItem({level:thisLevel,templateName:x.templateName});
                obj.entity.moveTo(JsonUtil.ArrayToVec3(x.position).add(thisLevel.terrain.centroid),JsonUtil.ArrayToVec3(x.rotation));
            })
       });
        const loadedRealmGuid = realmJson.guid; 
        this.#RealmData = new RealmData({levels:levels,guid:loadedRealmGuid,name:realmJson.name});
        this.gui.CloseLoadRealmUI();

        const zoomFactor = 100;
        const newTerrainPos = this.RealmData.currentLevel.terrain.entity.getPosition();
        this.camera.translate({source:"terrain",targetPivotPosition:newTerrainPos,targetZoomFactor:zoomFactor});
        this.gui.realmNameText.text=this.RealmData.name;
    }
    Save(){
        if (this.blockSavetimer > 0){
            return;
        }
        
        const name = this.RealmData.name;
        
        const callbackSuccess = function(){alert('Saved!');}
        const callbackFail = function(){alert('Fail to  Saved!');}
        const realmData = JSON.stringify(this.RealmData);
        const id = this.RealmData.guid; 
        loginWeb.SaveRealmData({
            realmData:realmData,
            name:name,
            id:id,
            callbackSuccess:callbackSuccess,
            callbackFail:callbackFail});
    }

    SetEditableItemMode() {
        // Eytan - how pass this to the mode? Should only be possible within that mode?
    }

    BeginDraggingNewObject(options={}){

        const { templateName, iconTextureAsset, width=80, height=80 } = options;

        this.toggle('draggingObject');
        // Todo: Eytan help? "drag object" functionality
        const data = { level:this.currentLevel, templateName:templateName,iconTextureAsset:iconTextureAsset }
        this.#mode.setData(data);
        this.#mode.toggle('pre');
    }

    BeginDraggingEditedObject(){
        if (this.#mode != this.#modes.get('editingItem')){
            console.log('cant begin dragging edited item if no item being edited.');
            console.log("mode:"+typeof(this.#mode));
        }
        const entity = this.#mode.entity;
        const item = this.RealmData.currentLevel.getPlacedItemByEntity(entity);
        this.toggle('draggingObject');
        const data = { templateName:item.templateName,iconTextureAsset:assets.textures.ui.trash }
        this.#mode.setData(data);
        this.#mode.startDraggingExistingItem(item);

    }
 
    get editingItem(){ 
        // Eytan - todo - how to extract editing item from that mode? Or call it directly skipping realmEditor
        return null;
//        return this.#editingItem;

    }

    RotateEditingItem(deg){
        // e.g. this.editingItemMode.#editingItem.rotate(-45);}
        if (this.#mode === this.#modes.get('editingItem')){
            this.#mode.entity.rotate(deg);
        }
    }

    UpdateData(data){
        this.RealmData.name = data['name'];
        // console.log("todo: update data:"+JSON.stringify(data));
    }

    InstantiateItem(args){
        // is "level" needed here?
        // console.log("Inst:"+args.toString());
        // @Eytan; I dislike how iconTextureAsset is passed from builder panel bound image, to dragging object mode, to here ..
        // Ideally, iconTextureAsset is stored in the data model *at definition time* e.g. in prefabs.js and is thus referenced
        const {level=this.RealmData.currentLevel, templateName, position=pc.Vec3.ZERO, rotation=pc.Vec3.ZERO, iconTextureAsset} = args;
        const entity = Game.Instantiate[templateName]({position:position,rotation:rotation});

        const placedItem = new PlacedItem({
            entity : entity,
            templateName : templateName,
            level : level,
            iconTextureAsset
        })
        level.registerPlacedItem(placedItem);
        placedItem.entity.on('destroy',function(){
            level.deRegisterPlacedItem(placedItem);
        })
        return placedItem;
    }
    
    editItem(entity){
        if (entity){
            this.toggle('editingItem');
            this.#mode.setEntity(entity);
        } else {
            this.toggle('normal');
        }
    }


}

// Created somewhere in the code where it makes sense
window.realmEditor = new RealmEditor();



