import {
    DraggingObjectRealmBuilderMode,
    EditingItemRealmBuilderMode,
    HandPanRealmBuilderMode,
    LoadScreenRealmBuilderMode,
    MapScreenRealmBuilderMode,
    NormalRealmBuilderMode,
    OrbitRealmBuilderMode,
    SelectRealmBuilderMode,
} from "./modes/index.js";

import {
    GUI,
    EditorCamera,
    Level,
    RealmData,
    Terrain,
    UndoRedo
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
        this.wasEnabled = false;
        this.#isEnabled = false;
        this.#realm = null;
        this.camera = new EditorCamera({realmEditor:this});
        this.outlineCam = new OutlineCamera(this);

        this.gui = new GUI({ realmEditor:this });
        this.undoRedo = new UndoRedo({ realmEditor:this });

        this.#modes = new Map([
            ['draggingObject', new DraggingObjectRealmBuilderMode({realmEditor: this})],
            ['editingItem', new EditingItemRealmBuilderMode({realmEditor: this})],
            ['handpan', new HandPanRealmBuilderMode({realmEditor: this})],
            ['loadScreen', new LoadScreenRealmBuilderMode({realmEditor: this})],
            ['mapScreen', new MapScreenRealmBuilderMode({realmEditor: this})],
            ['normal', new NormalRealmBuilderMode({realmEditor: this})],
            ['select', new SelectRealmBuilderMode({realmEditor: this})],
            ['orbit', new OrbitRealmBuilderMode({realmEditor: this})]
        ]);

        this.toggle('normal');

        pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        pc.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        pc.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);

        GameManager.subscribe(this,this.onGameStateChange);



        this.#RealmData = new RealmData({levels:[new Level({realmEditor:this})]});
        this.currentLevel = this.#RealmData.Levels[0];
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
        

        const {level=this.currentLevel,numTrees=5} = args;
        // Remove other trees on this level.

        this.clearTrees();

        for(let j=0;j<numTrees;j++){
            let aabb = level.terrain.entity.render.meshInstances[0].aabb;
            let scale = aabb.halfExtents.length();
            let randLocalPos =  Utils3.flattenVec3(Utils.getRandomUnitVector()).mulScalar(scale*0.85);
            let from = level.terrain.centroid.clone().add(new pc.Vec3(0,100,0)).add(randLocalPos);
            let to = from.clone().add(new pc.Vec3(0,-200,0));
            let result = pc.app.systems.rigidbody.raycastFirst(from, to);

            if (result) {
                const pos = result.point;
                const terrain = level.terrain;

                const waterLevel = terrain.centroid.y+terrain._data.textureOffset+terrain._data.waterLevel;
                if (result.point.y > waterLevel && result.entity.tags._list.includes(Constants.Tags.Terrain)){
                    let obj = this.InstantiateTemplate({
                        level:level,
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

            let randomTemplateKey = Object.keys(templateNameMap)[Math.floor(Math.random()*Object.keys(templateNameMap).length)];
            if (result) {
                const pos = result.point;
                console.log("rtk:"+randomTemplateKey);
                let obj = this.InstantiateTemplate({
                    level:level,
                    ItemTemplate:templateNameMap[randomTemplateKey],
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
        this.wasEnabled = true; // first time enabled flag for messaging during prototype
        this.#isEnabled = true;
        this.toggle('normal');
        this.gui.enable();
        AudioManager.play({source:assets.sounds.ui.open});
        this.camera.translate({source:"enable",targetPivotPosition:this.levelClosestToPlayer.terrain.centroid});
        // To re-load the existing level ..
        // console.log("%c ENABLE","color:#77f;font-weight:bold;");
//        if (this.#RealmData.Levels?.length > 0 && this.#RealmData.Levels[0].templateInstances.length > 0){
//            console.log(this.#RealmData.Levels[0].templateInstances[0].uuid);
//         }
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
        // console.log("update new");
        if (this.mode ) this.mode.update(dt);
        this.camera.update(dt);
        if (pc.app.keyboard.wasPressed(pc.KEY_H) || pc.app.keyboard.wasPressed(pc.KEY_Q)){
            this.toggle('normal');
        } else if (pc.app.keyboard.wasPressed(pc.KEY_S) || pc.app.keyboard.wasPressed(pc.KEY_W)){
            this.toggle('select');
        }
    }


    
    LoadJson(realmJson){
        realmJson = JsonUtil.cleanJson(realmJson); // If we used Eytan's idea of a json file service ......
        // try { console.log("Lodaing:"+realmJson.Levels[0].templateInstances[0].uuid); } catch {console.log('nonyet');}
        const levels = [];
        realmJson.Levels.forEach(levelJson => {
            let thisLevel = new Level({skipTerrainGen:true,realmEditor:this});
            levels.push(thisLevel);
            
            let terrainData = levelJson.terrain;
            terrainData.centroid = Terrain.getCentroid();
            thisLevel.terrain = new Terrain({data:terrainData,realmEditor:this});
            const $this = this;
            thisLevel.terrain.generate("foreach json for "+realmJson.name);
 
//            levelJson._placedItems.forEach(x=>{
            let index=0;
            console.log("%c Load Json ","color:yellow;font-weight:bold;");
            levelJson.templateInstances.forEach(x=>{
                try {
                    // console.log("x uuid:"+x.uuid);
                    let obj = this.InstantiateTemplate({
                        level:thisLevel,
                        ItemTemplate:templateNameMap[x.templateName],
                        uuid:x.uuid,
                        properties:x.properties,
                        position:x.position.add(thisLevel.terrain.centroid),
                        rotation:x.rotation,
                    });
                    if (obj == null){
                        console.log("prob2 w X:"+index);
                        console.log(x);

                    }
                } catch {
                    console.log("prob w X:"+index);
                    console.log(x);
                } 
                index++;

            });
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
        const level = new Level({skipTerrainGen:true,realmEditor:this});
        this.#RealmData.Levels.push(level);
        const newTerrainPos = Terrain.getCentroid();
        
        level.terrain = new Terrain({data:{centroid:newTerrainPos,seed:Math.random()},realmEditor:this});
        level.terrain.generate(); // race condiiton with regenerate() callbacks on TerrainTools change
        
        const zoomFactor = 100;
        this.camera.translate({targetPivotPosition:newTerrainPos,targetZoomFactor:zoomFactor});
        return level;    
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

    CopyEditedObject(){
        if (this.#mode != this.#modes.get('editingItem')){
            console.log('cant begin dragging edited item if no item being edited.');
            console.log("mode:"+typeof(this.#mode));
        }
        const entity = this.#mode.entity;
        const itemTemplate = entity._templateInstance; 
        let duplicate = entity._templateInstance.duplicate(); //itemTemplate.duplicate();
        const copyDelta = realmEditor.camera.entity.forward.flat().normalize().mulScalar(20);
        let copiedEntities = [];
        duplicate.copies.forEach(copy => {
            let c = this.InstantiateTemplate({
                ItemTemplate:copy.Template,
                position:copy.data.position.clone().add(copyDelta),
                rotation:copy.data.rotation,
                properties:copy.data,
            });
            console.log("Crea:");
            console.log(c);
            copiedEntities.push(c.entity);
       });
        if (duplicate.postCopyFn) {
            console.log("post copy:"+duplicate.postCopyFn);
            console.log(duplicate);
            duplicate.postCopyFn(copiedEntities);
        } else {
            this.editItem(copiedEntities[0]);
        }
        
    }

    mapClicked(){
        console.log("mapclicked");
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
            uuid=crypto.randomUUID(),
            properties={},
            } = args;
        const instance = new ItemTemplate({uuid:uuid,position:position,rotation:rotation,properties:properties});
        const entity = instance.entity;
        entity.tags.add(Constants.Tags.BuilderItem);

        level.registerPlacedTemplateInstance(instance);
        instance.entity.on('destroy',function(){
            level.deRegisterPlacedTemplateInstance(instance); // does it work ..? perhaps better by entity?
        });
        return instance;
    }
    
    editItem(entity){
        if (entity){
            this.toggle('editingItem');
            this.#mode.setEntity(entity);
//            this.#mode.setItemTemplate(ItemTemplate)
        } else {
            console.log("Toggle normal");
            this.toggle('normal');
        }
    }


}



window.realmEditor = new RealmEditor();
