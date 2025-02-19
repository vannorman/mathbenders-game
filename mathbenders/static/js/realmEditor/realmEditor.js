import {
    DraggingObjectRealmBuilderMode,
    EditingItemRealmBuilderMode,
    HandPanRealmBuilderMode,
    LoadScreenRealmBuilderMode,
    MapScreenRealmBuilderMode,
    NormalRealmBuilderMode,
    OrbitRealmBuilderMode
} from "./modes/index.js";

import {
    GUI,
    EditorCamera,
    //PlacedItem,
    Level,
    RealmData,
    Terrain
} from  "./index.js";

class RealmEditor {

    // 'object', 'entity', 'item' terminology ?

    #isEnabled;
    #realm;
    #modes;
    #mode;
    #RealmData;
    get RealmData() {return this.#RealmData;}
    #UpdateInitialized=false;
    currentLevel;

    get mode(){return this.#mode}

    get RealmData(){
        return this.#RealmData;
    }

    constructor() {
        this.#isEnabled = false;
        this.#realm = null;
        this.camera = new EditorCamera({realmEditor:this});
        this.gui = new GUI({ realmEditor:this });
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



        this.#RealmData = new RealmData();
        this.currentLevel = this.#RealmData.Levels[0];
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
        // Arbitrary portal logic that should be pushed to the Portal / 
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
   } 
 
    get levelClosestToPlayer() {
        let min = Infinity;
        let closest = null;
        this.#RealmData.Levels.forEach(level=>{
            let d = pc.Vec3.distance(
                Camera.main.entity.getPosition(),
                level.terrain.entity.getPosition()); // equivalent to terrainData.terrainEntity.getPosition()?
            if(d < min){
                min = d;
                closest = level;
            }
        });
        return closest;
     
    }
    
    enable() {
        this.#isEnabled = true;
        this.toggle('normal');
        this.gui.enable();
        AudioManager.play({source:assets.sounds.ui.open});
        this.camera.translate({source:"enable",targetPivotPosition:this.levelClosestToPlayer.terrain.centroid});
        // To re-load the existing level ..
        const realmData = JsonUtil.stringify(this.#RealmData); // copy existing realm data
        this.#RealmData.Clear(); // delete everything
        pc.app.root.getComponentsInChildren('numberInfo').forEach(x=>{
            // if(!x.entity.getComponentInParent('thirdPersonController')){
                // awkward fix to avoid destroying inventory numbers like heldItem AmmoGfx; since they are "disabled" it skips them here
                // nevermind just redraw it on inventory enable.
                x.entity.destroy();
            //} 
        }); // clean up extraneous numbers
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

        if (this.#modes.get(mode) == this.#mode) return;

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
//            levelJson._placedItems.forEach(x=>{
            levelJson.templateInstances.forEach(x=>{

                let obj = this.InstantiateTemplate({level:level,ItemTemplate:templateNameMap[x.templateName]});
                console.log(x.position);
                obj.moveTo(x.position.add(thisLevel.terrain.centroid),JsonUtil.ArrayToVec3(x.rotation));
            })
 
        });
    }
    
    LoadJson(realmJson){
        realmJson = JsonUtil.cleanJson(realmJson); // If we used Eytan's idea of a json file service ......
        const levels = [];
        realmJson.Levels.forEach(levelJson => {
            let thisLevel = new Level({skipTerrainGen:true});
            levels.push(thisLevel);
            
            let terrainData = levelJson.terrain;
            terrainData.centroid = Terrain.getCentroid();
            thisLevel.terrain = new Terrain(terrainData);
            const $this = this;
            thisLevel.terrain.generate("foreach json for "+realmJson.name);
 
//            levelJson._placedItems.forEach(x=>{
            levelJson.templateInstances.forEach(x=>{
                let obj = this.InstantiateTemplate({level:thisLevel,ItemTemplate:templateNameMap[x.templateName],properties:x.properties});
                obj.entity.moveTo(x.position.add(thisLevel.terrain.centroid),JsonUtil.ArrayToVec3(x.rotation));
            })
       });
        const loadedRealmGuid = realmJson.guid; 
        this.#RealmData = new RealmData({levels:levels,guid:loadedRealmGuid,name:realmJson.name});
        this.currentLevel = this.RealmData.Levels[0];
        this.gui.CloseLoadRealmUI();

        const zoomFactor = 100;
        const newTerrainPos = this.currentLevel.terrain.entity.getPosition();
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

    NewRealm(){
        this.#RealmData.Clear();
        this.#RealmData = new RealmData();
        this.currentLevel = this.RealmData.Levels[0];

    }

    createNewLevel(){
        const level = new Level({skipTerrainGen:true});
        this.#RealmData.Levels.push(level);
        const newTerrainPos = Terrain.getCentroid();
        
        level.terrain = new Terrain({centroid:newTerrainPos,seed:Math.random()});
        level.terrain.generate(); // race condiiton with regenerate() callbacks on TerrainTools change
        
        const zoomFactor = 100;
        realmEditor.camera.translate({targetPivotPosition:newTerrainPos,targetZoomFactor:zoomFactor});
        return level;    
    }

    SetEditableItemMode() {
        // Eytan - how pass this to the mode? Should only be possible within that mode?
    }

    BeginDraggingNewObject(options={}){

        const { ItemTemplate, width=80, height=80 } = options;

        this.toggle('draggingObject');
        // Todo: Eytan help? "drag object" functionality
        const data = { level:this.currentLevel, ItemTemplate:ItemTemplate };
        this.#mode.setData(data);
        this.#mode.toggle('pre');
    }

    BeginDraggingEditedObject(){
        if (this.#mode != this.#modes.get('editingItem')){
            console.log('cant begin dragging edited item if no item being edited.');
            console.log("mode:"+typeof(this.#mode));
        }
        const entity = this.#mode.entity;
        const itemTemplate = entity._templateInstance; 
        this.toggle('draggingObject');
        const data = { templateName:itemTemplate.constructor.name};
        this.#mode.setData(data);
        this.#mode.startDraggingExistingItem(itemTemplate);

    }

    mapClicked(){
        this.#mode.mapClicked();
    }

    clickOffMap(){
        this.#mode.clickOffMap();
    }

    UpdateData(data){
        this.RealmData.name = data['name'];
        // console.log("todo: update data:"+JSON.stringify(data));
    }

    InstantiateTemplate(args){
        // is "level" needed here?
        // console.log("Inst:"+args.toString());
        // @Eytan; I dislike how iconTextureAsset is passed from builder panel bound image, to dragging object mode, to here ..
        // Ideally, iconTextureAsset is stored in the data model *at definition time* e.g. in prefabs.js and is thus referenced
        const {
            level=this.currentLevel, 
            ItemTemplate, 
            position=pc.Vec3.ZERO, 
            rotation=pc.Vec3.ZERO, 
            properties={},
            } = args;

        const instance = new ItemTemplate({properties:properties});
        const entity = instance.entity;
        entity.tags.add(Constants.Tags.BuilderItem);
        //const entity = Game.Instantiate[templateName]({position:position,rotation:rotation});

//        const placedItem = new PlacedItem({
//            entity : entity,
//            ItemTemplate : ItemTemplate,
//            level : level,
//        })
//        level.registerPlacedItem(placedItem);
//        placedItem.entity.on('destroy',function(){
        level.registerPlacedTemplateInstance(instance);
        instance.entity.on('destroy',function(){
            // culprit: Adjusts array size while destroying entities in this array. oops.
            level.deRegisterPlacedTemplateInstance(instance); // does it work ..? perhaps better by entity?
            //level.deRegisterPlacedItem(placedItem);
        })
        return instance;
//        return placedItem;
    }
    
    editItem(entity){
        if (entity){
            this.toggle('editingItem');
            this.#mode.setEntity(entity);
//            this.#mode.setItemTemplate(ItemTemplate)
        } else {
            this.toggle('normal');
        }
    }


}



window.realmEditor = new RealmEditor();
