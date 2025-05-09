import * as Mode from "./modes/index.js";

import {
    GUI,
    EditorCamera,
    Level,
    RealmData,
    Terrain,
    UndoRedo
} from  "./index.js";

// Some templates care about each other and so need to subscribe to a "all templates successfully loaded" event.
const RealmEditorState = Object.freeze({
    Initializing : 'Initializing',
    GameLoading : 'GameLoading',
    GameLoaded : 'GameLoaded',
});

// import { Template, etc. }

class RealmEditor extends Listener {

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
        super();
        this.state = RealmEditor.Initializing;
        this.wasEnabled = false;
        this.#isEnabled = false;
        this.#realm = null;
        this.camera = new EditorCamera({realmEditor:this});
        this.outlineCam = new OutlineCamera(this);

        this.gui = new GUI({ realmEditor:this });
        this.undoRedo = new UndoRedo({ realmEditor:this });

        this.#modes = new Map([
            ['draggingObject', new Mode.DraggingObject({realmEditor: this})],
            ['editingItem', new Mode.EditingItem({realmEditor: this})],
            ['handpan', new Mode.HandPan({realmEditor: this})],
            ['loadScreen', new Mode.LoadScreen({realmEditor: this})],
            ['mapScreen', new Mode.MapScreen({realmEditor: this})],
            ['normal', new Mode.Normal({realmEditor: this})],
            ['select', new Mode.Select({realmEditor: this})],
            ['buildWalls', new Mode.BuildWalls({realmEditor: this})]
        ]);

        this.toggle('normal');

        pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        pc.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        pc.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);

        GameManager.subscribe(this,this.onGameStateChange);


        this.NewRealm();
    }

    buildRandomLevels(){
        return;
        for (let i=0;i<5;i++){
            let level = this.createNewLevel();
            this.currentLevel = level;
            const numItems = Math.round(Math.random()*20);
           this.buildRandomItemsOnLevel({level:level,numItems:numItems}); 
       }

    }

    
    clearTrees(){
        this.currentLevel?.templateInstances?.filter(x=>x.constructor.name==Tree1.name).forEach(x=>{
            x.entity.destroy();
        })


    }

    placeTrees(args={}){
        

        const {terrain=this.currentLevel?.terrain,numTrees=5} = args;
        // Remove other trees on this level.
        this.clearTrees();

        for(let j=0;j<numTrees;j++){
            let aabb = terrain.entity.render.meshInstances[0].aabb;
            let scale = aabb.halfExtents.length();
            let randLocalPos =  Utils3.flattenVec3(Utils.getRandomUnitVector()).mulScalar(scale*0.85);
            let from = terrain.centroid.clone().add(new pc.Vec3(0,100,0)).add(randLocalPos);
            let to = from.clone().add(new pc.Vec3(0,-200,0));
            let result = pc.app.systems.rigidbody.raycastFirst(from, to);

            if (result) {
                const pos = result.point;
                // const terrain = terrain;
                const waterLevel = terrain.waterLineY; //terrain.centroid.y-terrain._data.textureOffset+terrain._data.waterLevel;
                if (result.point.y > waterLevel && result.entity.tags._list.includes(Constants.Tags.Terrain)){
                    let obj = this.InstantiateTemplate({
                        level:this.currentLevel,
                        ItemTemplate:Tree1,
                        position:pos,
                        rotation:new pc.Vec3(0,Math.random()*180,0),
                    });
                }
            } else {
                Utils3.debugSphere({position:from,timeout:100});
            }
       }

    }

    buildRandomItemsOnLevel(args={}){
        const {level=this.currentLevel,numItems=5} = args;
        for(let j=0;j<numItems;j++){
            let aabb = level.terrain.entity.render.meshInstances[0].aabb;
            let scale = aabb.halfExtents.length();
            let randLocalPos =  Utils3.flattenVec3(Utils.getRandomUnitVector()).mulScalar(scale*0.5);
            let from = level.terrain.centroid.clone().add(new pc.Vec3(0,100,0)).add(randLocalPos);
            let to = from.clone().add(new pc.Vec3(0,-200,0));
            let result = pc.app.systems.rigidbody.raycastFirst(from, to);

            let randomTemplateKey = Object.keys(TemplateNameMap)[Math.floor(Math.random()*Object.keys(TemplateNameMap).length)];
            if (result) {
                const pos = result.point;
                // console.log("rtk:"+randomTemplateKey);
                let obj = this.InstantiateTemplate({
                    level:level,
                    ItemTemplate:TemplateNameMap[randomTemplateKey],
                    position:pos,
                    rotation:new pc.Vec3(0,Math.random()*180,0),
                });
            } else {
                Utils3.debugSphere({position:from,timeout:100000});
            }
        //         

       }

    }


    onGameStateChange(state) {
        switch(state){
        case GameState.RealmBuilder:
            this.enable();
            // if (!this.#UpdateInitialized){
             //   this.#UpdateInitialized=true;
                pc.app.on('update',this.update,this);
               // function(dt){realmEditor.update(dt);}); // weird; if I use "this" it loops infinite
                
            //}
            break;
        case GameState.Playing:
            pc.app.off('update',this.update,this);
            // this.ConnectPortals();
            this.RealmData.Levels.forEach(x=>{x.terrain.Regenerate(); });
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

    getClosestTerrainPosition(){
        let d = Infinity;
        let closest = null;
        pc.app.root.findByTag('Terrain').forEach(t=>{
            let d2 = Player.entity.getPosition().sub(t.getPosition()).length();
            if (d2 < d) {
                d = d2;
                closest = t;
            }
        }); 
        return closest.getPosition();
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
        this.setState(RealmEditorState.Enabling);
        this.wasEnabled = true; // first time enabled flag for messaging during prototype
        this.#isEnabled = true;
        this.toggle('normal');
        this.gui.enable();
        AudioManager.play({source:assets.sounds.ui.open});
        this.camera.translate({
            targetPivotPosition:this.levelClosestToPlayer.terrain.centroid,
            targetZoomFactor:300
        });
        const realmData = JsonUtil.stringify(this.#RealmData); // copy existing realm data

        this.#RealmData.Clear(); // delete everything
        pc.app.root.getComponentsInChildren('numberInfo').forEach(x=>{
            // if(!x.entity.getComponentInParent('thirdPersonController')){
                // awkward fix to avoid destroying inventory numbers like heldItem AmmoGfx; since they are "disabled" it skips them here
                // nevermind just redraw it on inventory enable.
                x.entity.destroy();
            //} 
        }); // clean up extraneous numbers

        // Clear statics
        // @Eytan interesting architecture awkward placement; each "LoadJson" is actually "GameStart" and should flush/refresh any memories
        // PlayerPortal.portals = new Map(); // actually this can be wrapped in the destroy fn
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

        this.gui.onModeChanged(mode);
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
        if (this.mode ) this.mode.update(dt);
        this.camera.update(dt);
        if (pc.app.keyboard.wasPressed(pc.KEY_H) || pc.app.keyboard.wasPressed(pc.KEY_Q)){
            this.toggle('normal');
        } else if (pc.app.keyboard.wasPressed(pc.KEY_S) || pc.app.keyboard.wasPressed(pc.KEY_W)){
            this.toggle('select');
        }
    }


    
    LoadJson(realmJson){
        this.setState(RealmEditorState.GameLoading);
        realmJson = JsonUtil.cleanJson(realmJson); // If we used Eytan's idea of a json file service ......
        // try { console.log("Lodaing:"+realmJson.Levels[0].templateInstances[0].uuid); } catch {console.log('nonyet');}
        const levels = [];
        realmJson.Levels.forEach(levelJson => {
            let thisLevel = new Level({skipTerrainGen:true,realmEditor:this});
            levels.push(thisLevel);
           
            // Important! Terrain is always generated BEFORE levelobjects.
            // Some levelobjects affect terrain.
            // To avoid circular dependency, we instantiate terrain first, then levelobjects, 
            // and on the constructor of the levelobject we differentiate between "being created once during inflation"
            // vs "being created by drag and drop in editor");
            let terrainData = levelJson.terrain;
            terrainData.centroid = Terrain.getCentroid();
            thisLevel.terrain = new Terrain({data:terrainData,realmEditor:this,level:thisLevel});
            const $this = this;
            thisLevel.terrain.generate("foreach json for "+realmJson.name);
 
//            levelJson._placedItems.forEach(x=>{
            let index=0;
            console.log("%c Load Json ","color:yellow;font-weight:bold;");
            levelJson.templateInstances.forEach(x=>{
                // console.log(x);
                    let obj = this.InstantiateTemplate({
                        level:thisLevel,
                        ItemTemplate:TemplateNameMap[x.templateName],
                        uuid:x.uuid,
                        properties:x.properties,
                        position:x.position.add(thisLevel.terrain.centroid),
                        rotation:x.rotation,
                    });
                    obj.onInflated(); // for example, on terrain modifiers, this causes the terrain to rebuild
                    if (obj == null){
                        console.log("No temp:");
                        console.log(x);

                    }
                index++;

            });
       });
        const loadedRealmGuid = realmJson.guid; 
        this.#RealmData = new RealmData({levels:levels,guid:loadedRealmGuid,name:realmJson.name});
        this.currentLevel = this.RealmData.Levels[0];
        this.gui.CloseLoadRealmUI();

        const zoomFactor = 200;
        const newTerrainPos = this.currentLevel.terrain.entity.getPosition();
        this.camera.translate({source:"terrain",targetPivotPosition:newTerrainPos,targetZoomFactor:zoomFactor});
        this.gui.realmNameText.text=this.RealmData.name;

        this.setState(RealmEditorState.GameLoaded);
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
        this.#RealmData?.Clear();
        this.#RealmData = new RealmData({levels:[new Level({realmEditor:this})]});
        this.currentLevel = this.#RealmData.Levels[0];
        this.CenterCameraOnCurrentLevel();
    }

    CenterCameraOnCurrentLevel(){
        this.camera.translate({targetPivotPosition:this.currentLevel.terrain.centroid,targetZoomFactor:300})
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
        const {
            level=this.currentLevel, 
            ItemTemplate, 
            position=pc.Vec3.ZERO, 
            rotation=pc.Vec3.ZERO, 
            uuid=crypto.randomUUID(),
            properties={},
            } = args;
        const instance = new ItemTemplate({level:level,uuid:uuid,position:position,rotation:rotation,properties:properties});
        const entity = instance.entity;
        entity.tags.add(Constants.Tags.BuilderItem);

        level.registerPlacedTemplateInstance(instance);
        instance.entity.on('destroy',function(){
            level.deRegisterPlacedTemplateInstance(instance); // does it work ..? perhaps better by entity?
        });
        return instance;
    }
    
    editItem(args={}){

        const {entity,pop=true} = args;
        if (entity){
            this.toggle('editingItem');
            this.#mode.setEntity(entity,pop);
//            this.#mode.setItemTemplate(ItemTemplate)
        } else {
            console.log("Toggle normal");
            this.toggle('normal');
        }
    }


}



window.realmEditor = new RealmEditor();
