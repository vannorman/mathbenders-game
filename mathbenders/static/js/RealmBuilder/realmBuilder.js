
/*


    # Description
        RealmBuilder is a UI with a separate camera in the sky which allows user to place and edit objects for gameplay.

    # Terminology
        Realm - a group of Levels including at least one Level.
        Level - a group of objects including exactly one Terrain and any number of placedObjects.
        Terrain - the ground you walk on. Exactly one per level. 
        PlacedObject - 
            entities like NumberHoop, CastleWall, NumberWall and Portal.
            PlacedObjects currently only have globally similar properties like Position and Rotation.
            PlacedObjects in the future will have a custom data per each, such as monsterBehaviorProperties or customMachineProperties.
            PlacedObjects' customProperties will be editable using a dynamic custom menu in the pop-up item editor.
        Pop Up Edit Item Tray -
            pops up when editing an item (after finish drag or after click item) to edit its properties.
            see "RealmBuilder.CreatePopUpEditItemTray()"
        DraggingItem
            the item being dragged, either after clicking on the physcial item over the map, or over the UI panel.
            draggingItem is an interstitial item state, between it existing and not existing.
        EditingItem
            the item being edited, the Pop Up Edit Item Tray is visible.

    # Key methods
        currentLevel - guesses which level user intends to edit based on proximity to the users' camera. (fragile)
        InstantiateObjectForBuilder - Does 3 things. 
            Instantiates entity, 
            Creates PlacedObject() instance in memory, 
            adds PlacedObject to currentLevel
        
        
    # Current issues & Bugs
        TerrainCentroidManager CENTROID per "level" (a physical terrain located in a different world position)
            seems to work ok. No global state position for items or terrains. they are dished out on a per-terrain basis at load time.
        BUG - State confusion
            sometimes (after load level?) the State(?) gets confused and "click terrain for hand pan" fails to work. 
            It worked again randomly after switching tabs.
        "draggingItem" - logic is all over the place.
            Possibly create a class for DraggingItem and manipulate the instance until it's done?
            Consolidate code for all draggingItem / draggingState references?
        UI
            Many UI elements are here or in realmbuilder/ui.js
            merge / refactor
        Camera
            Many camera manipulation methods and state, should move to SkyCam / RealmBuilderCam (see cameras.js)
        
        BUG - 
            - place item X, place item Y, move item X off screen and back on, item Y appears instead.
            - drag item off world, still exists "udner" the terrain?
            - inventory , player pick up item, its not destroyed, just empty.
            - player start doesnt seem to get destroyed when new level load.

*/


const RealmBuilder = {

    // ==========================================================================================
    //    Various constants / vars
    // ==========================================================================================
   
    // RealmBuilder state
    isEnabled : false,
    mode : RealmBuilderMode.Normal, 
    RealmData : null,
    initialized : false, 


    leftMargin : 240, // Define the Builder Panel UI width.
    logoPanelWidth : 80, // Red background navigation panel width
    tryRecaptureHandPan : false, // awkward to handle specific state changes when we want to revert back to HandPan (instead of Normal).
    
    // Camera
    defaultCameraHeight : 25,
    defaultZoomFactor : 35,
    get skyCamAspectRatio() { 
        // Since the screen is more narrow in the "Map" area, we adjust the aspect ratio accordingly 
        return (pc.app.graphicsDevice.width-RealmBuilder.leftMargin-RealmBuilder.logoPanelWidth)/pc.app.graphicsDevice.height;
    } ,
    cameraIsLerping : false, // Should be CameraMovementState
    cameraDefaultRot : new pc.Vec3(-45,45,0),
    totalDegreesRotated : 0, // Camera turns left and right, keep track of rotated degrees as part of lerp (bad place for this)
    lastCameraDistance:20,
    targetZoomFactor : 35,
    targetPivotPos : pc.Vec3.ZERO,
    cameraRotating : false,
    targetCameraPivotRot : 0,
    cameraMoveDirection : Constants.Direction.None,

    // UI
    screen : null, // Will hold all UI components
    guiButtons : [], 
    blockSavetimer : 0, // awkward - sometimes we want to prevent user from accidentally saving after closing a window
   

    // Drag, Drop, and Edit item
    editingItem : null, // We are editing this item with Pop Up 
    editableItemMode : EditableItemMode.Editing,
    dragWorldSpeed : 0.05,
    draggingMode : DraggingMode.PreInstantiation,
    draggingItem:null,
    editableItemUnderCursor : null,
    customCursorIcon : null, // entity 
    lastIconTextureAsset : null,
    worldPointUnderCursor:new pc.Vec3(),


    // ==========================================================================================
    //  RealmBuilder State Management 
    // ==========================================================================================
    SetEditableItemMode(mode){
        this.editableItemMode = mode;
        switch(mode){
        case EditableItemMode.Editing: 
            this.editableItemGroup.enabled=false;
            break;
        }
        //console.log("%c SET EDIT ITEM:"+editableItemMode,"color:#f77")
    },
    SetMode(mode){
        if (!this.isEnabled) return;
        if (mode == this.mode) return;
        if (this.mode != RealmBuilderMode.HandPan) {
            // edge case for allowing player to re-enable hand pan if they had been hand-panning before and switched modes by "breakpan" (going outside map area)
            this.tryRecaptureHandPan = false;
        }
        this.mode = mode;

        // Close existing screens
        if (mode != RealmBuilderMode.EditingItem) {
            this.SetEditableItemMode(EditableItemMode.PoppingOut); // disable after fin in update
        }
        if (mode != RealmBuilderMode.MapScreen) {
            this.changeMapScreen.enabled = false;
        }
        switch(mode){
        case RealmBuilderMode.Normal:
            this.customCursorIcon.enabled = false;
            pc.app.graphicsDevice.canvas.style.cursor = 'auto';
            break;
        case RealmBuilderMode.DraggingObject:
            if (this.draggingMode == DraggingMode.PreInstantiation){
                // don't update drag cursor icon, it was set when drag started from ui

            } else {
                this.customCursorIcon.enabled = false;
                pc.app.graphicsDevice.canvas.style.cursor = 'auto';

            }
            break;
        case RealmBuilderMode.HandPan:
            this.customCursorIcon.enabled = true;
            this.customCursorIcon.element.textureAsset = assets.textures.ui.icons.hand,
            this.customCursorIcon.element.width = 50;
            this.customCursorIcon.element.height= 50;

            pc.app.graphicsDevice.canvas.style.cursor = 'none';
            this.cameraIsLerping = false;
            break;
        case RealmBuilderMode.EditingItem:
            this.customCursorIcon.enabled = false;
            pc.app.graphicsDevice.canvas.style.cursor = 'auto';
            break;
        case RealmBuilderMode.MapScreen:
            this.customCursorIcon.enabled = false;
            pc.app.graphicsDevice.canvas.style.cursor = 'auto';
            this.changeMapScreen.enabled=true;

            RealmBuilderUI.UpdateMapIcons();
            break;
        default:break;
        }
    //  console.log("%c SET:"+mode,"color:#7f7")
    },
     onGameStateChange(state) {
        switch(state){
        case GameState.RealmBuilder:
            this.enable();
            break;
        case GameState.Playing:
            this.disable();
            break;
        }
    },
    Init () {
        // move to constructor?

        pc.app.on('update',function(dt){ RealmBuilder.Update(dt);  });
        GameManager.subscribe(RealmBuilder,RealmBuilder.onGameStateChange);
        console.log("sub gamesttate old");
        RealmBuilderUI.BuildUIElements();
   },


    initialize(){
        //    Lazy Initialization (after game loads & triggered when user opens builder
        // Happens first time builder is opened.
        // lazy init so after game loaded/async finished
        // Debug text
        this.customCursorIcon = new pc.Entity("customcursoce");
        this.customCursorIcon.addComponent(
            'element',{
            type:'image',
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            }
        )
        this.customCursorIcon.enabled = false;
        this.screen.addChild(this.customCursorIcon);

        pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        pc.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        pc.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseScroll, this);

//        const debugTextPos = new pc.Vec3(1.0,1.0,-3);
//        const debugText = Utils.AddText({
//            color:new pc.Color(1.0,0,0),
//            text:"debug",
//            parent:Camera.sky.entity,
//            localPos:debugTextPos,
//            scale:0.01});
//        RealmBuilder.debugText = debugText.element;

        this.cameraPivot = new pc.Entity();
        pc.app.root.addChild(this.cameraPivot);
        if (Game && Game.player) this.cameraPivot.setPosition(Game.player.getPosition());
        
        this.cameraPivot.addChild(Camera.sky.entity);
        Camera.sky.entity.setLocalEulerAngles(RealmBuilder.cameraDefaultRot);
        Camera.sky.entity.setLocalPosition(Camera.sky.entity.forward.mulScalar(-40));

        this.cameraPivotTarget = new pc.Entity(); // for smooth rotation; set target to desired rot then lerp to it
//        this.cameraPivotTarget.setEulerAngles(0,45,0);
        pc.app.root.addChild(this.cameraPivotTarget); // why using entity? Because i'm lazy and entity.rotate(90) already translates euler to quats

        // debug sphere
//        const ds = Utils3.debugSphere({size:10,color:pc.Color.BLUE,autoDestruct:false});
//        this.ds = ds;
//        this.cameraPivot.addChild(ds);
//        ds.setLocalPosition(pc.Vec3.ZERO);
//        ds.addComponent('script');
//        ds.script.create('sinePulsate',{attributes:{pulsateAmount:0.05,startScale:new pc.Vec3(5,5,5)}});
//        const dsf = Utils3.debugSphere({size:5,color:pc.Color.RED,autoDestruct:false});
//        this.dsf = dsf;
//        this.cameraPivot.addChild(dsf);
//        dsf.setLocalPosition(pc.Vec3.FORWARD.clone().mulScalar(15));
//        dsf.addComponent('script');
//        dsf.script.create('sinePulsate',{attributes:{pulsateAmount:0.05,startScale:new pc.Vec3(2,2,2)}});


        // Create a render target texture
        var texture = new pc.Texture(pc.app.graphicsDevice, {
            width: 512,
            height: 512,
            format: pc.PIXELFORMAT_R8_G8_B8_A8,
            autoMipmap: true
        });

        // Create a render target
        var renderTarget = new pc.RenderTarget({
            colorBuffer: texture,
            flipY: true,
            depth: true
        });

        // Assign the render target to the camera
        Camera.sky.renderTarget = renderTarget;

        Camera.sky.aspectRatio = this.skyCamAspectRatio;

        // Set the UI element's texture to the render target texture
        //this.mapPanel.element.texture = texture;
        // After rendering, set the UI element's texture
        this.mapPanel.element.texture = texture;

        this.mapPanel.on('mouseleave',function(){console.log('breakmap');});
        this.initialized = true;

        RealmBuilder.TerrainCentroidManager = new TerrainCentroidManager();

        // First time we opened it and there wasn't already a Realm loaded.
        if (!RealmBuilder.levelWasLoaded){
            RealmBuilder.NewRealm();
        }


    },
    enable(){
        return;
        if (!this.initialized){
            this.initialize();
        }
        RealmBuilder.isEnabled = true;
        RealmBuilder.screen.enabled = true;
        AudioManager.play({source:assets.sounds.ui.open}),
        RealmBuilder.SetMode(RealmBuilderMode.Normal);
        Camera.SwitchCurrentCamera(Camera.sky);
        RealmBuilder.BuilderPanels[0].select();

//        RealmBuilder.SelectNav(RealmBuilder.BuilderPanels[0]);

        RealmBuilder.MoveCamera({source:"enable",targetPivotPos:RealmBuilder.RealmData.Levels[0].terrain.centroid,targetZoomFactor:RealmBuilder.defaultZoomFactor})
        
        // To re-load the existing level ..
        const realmData = JSON.stringify(RealmBuilder.RealmData); // copy existing realm data
        RealmBuilder.RealmData.Clear(); // delete everything
        RealmBuilder.LoadJson(realmData);
    },
    disable(){
        return;

        RealmBuilder.isEnabled = false;
        RealmBuilder.screen.enabled = false;
        AudioManager.play({source:assets.sounds.ui.play}),

        Camera.SwitchCurrentCamera(Camera.main);
        RealmBuilder.ConnectPortals();
        Game.player.moveTo(RealmBuilder.RealmData.currentLevel.terrain.centroid.clone().add(new pc.Vec3(0,10,0)));
        
    },
  

    // ==========================================================================================
    //    Load and Save
    // ==========================================================================================

    NewRealm(){
        if (RealmBuilder.RealmData){
            RealmBuilder.RealmData.Clear({deleteLevelObjects:true});
        }
        RealmBuilder.RealmData = new RealmData();
        RealmBuilder.realmNameText.text=RealmBuilder.RealmData.name;
        RealmBuilder.BuilderPanels[0].select();
    },
    
    
    OpenLoadRealmUI(){
        this.SetMode(RealmBuilderMode.LoadRealmScreen);
        callback = (realms)=>{RealmBuilder.PopulateRealmList(realms)};
        loginWeb.GetLevels(callback);
    },
    PopulateRealmList(realms){
        if ( RealmBuilder.loadRealmsList) RealmBuilder.loadRealmsList.destroy();
        function realmListItem(args){
            // TODO move this to RealmBuilderUI
            // Each loaded level has the same background and list item format.
            const {name,realmId}=args;
             var listItem = new pc.Entity();
            listItem.addComponent('element',{
                type:'image',
                anchor:[0.5,0.5,0.5,0.5],
                pivot:[0.5,0.5],
                color:pc.Color.BLUE,
                width:300,
                height:30,
                opacity:1,
                useInput:true,
            });
            var txt = new pc.Entity('textlevel');
            listItem.addChild(txt);
             txt.addComponent('element', {
                type: 'text',
                text: name,
                anchor:[0.02,0,0.02,0],
                pivot:[0,0.5],
                fontAsset: assets.fonts.montserrat,
                fontSize : 12,
                color:pc.Color.BLACK,
            });
            listItem.element.on('mousedown',function(){
                // Bind Click on this level to Load this level.
                const callback = (realmData)=>{
                    RealmBuilder.RealmData.Clear();
                    RealmBuilder.LoadJson(realmData.json_data)
                };
                loginWeb.LoadRealmData({realmId:realmId,callback:callback});
            });
            UI.HoverColor({
                element:listItem.element,
                colorOn:new pc.Color(1,0.5,0),
                colorOff:new pc.Color(1,0.4,0),
                opacityOn:1,
                opacityOff:0.9,
                cursor:'pointer',});
            return listItem; 
 
        }
    
        realmList  = [];
        realms.forEach(realm=>{
            const realmItem = realmListItem({name:realm.name,realmId:realm.realm_id}); 
            realmList.push(realmItem);
        });
       
        RealmBuilder.loadRealmsList = UI.CreateScrollableLayoutGroup({screen:this.loadRealmWindow,itemList:realmList});
        this.loadRealmScreen.enabled=true;
    },
    CloseLoadRealmUI(){
        this.blockSavetimer=0.5;
        this.SetMode(RealmBuilderMode.Normal);
        this.loadRealmScreen.enabled=false;
    },
    LoadData(realmData){
        

        realmData.Levels.forEach(level => {
            levelJson._placedObjects.forEach(x=>{
                let obj = RealmBuilder.InstantiateObjectForBuilder({level:thisLevel,template:x.template});
                obj.moveTo(JsonUtil.ArrayToVec3(x.position).add(thisLevel.terrain.centroid),JsonUtil.ArrayToVec3(x.rotation));
            })
 
        });
    },
    LoadJson(realmJson){
        realmJson = Utils.cleanJson(realmJson); // If we used Eytan's idea of a json file service ......
        const levels = [];
        realmJson.Levels.forEach(levelJson => {
            let thisLevel = new Level({skipTerrainGen:true});
            levels.push(thisLevel);

            let terrainData = levelJson._terrain;
            terrainData.centroid = RealmBuilder.TerrainCentroidManager.getCentroid();
            thisLevel.terrain = new Terrain(terrainData);
            thisLevel.terrain.generate("foreach json for "+realmJson.name);
 
            levelJson._placedObjects.forEach(x=>{
                let obj = RealmBuilder.InstantiateObjectForBuilder({level:thisLevel,template:x.template});
                obj.moveTo(JsonUtil.ArrayToVec3(x.position).add(thisLevel.terrain.centroid),JsonUtil.ArrayToVec3(x.rotation));
            })
       });
        const loadedRealmGuid = realmJson.guid; 
        RealmBuilder.RealmData = new RealmData({levels:levels,guid:loadedRealmGuid,name:realmJson.name});
        RealmBuilder.CloseLoadRealmUI();

        const zoomFactor = 100;
        const newTerrainPos = RealmBuilder.RealmData.currentLevel.terrain.entity.getPosition();
        RealmBuilder.MoveCamera({source:"terrain",targetPivotPos:newTerrainPos,targetZoomFactor:zoomFactor});
        RealmBuilder.realmNameText.text=RealmBuilder.RealmData.name;

    },
    Save(){
        if (this.blockSavetimer > 0){
            return;
        }
        
        const name = RealmBuilder.RealmData.name;
        
        callbackSuccess = function(){alert('Saved!');}
        callbackFail = function(){alert('Fail to  Saved!');}
        const realmData = JSON.stringify(RealmBuilder.RealmData);
        const id = RealmBuilder.RealmData.guid; 
        loginWeb.SaveRealmData({
            realmData:realmData,
            name:name,
            id:id,
            callbackSuccess:callbackSuccess,
            callbackFail:callbackFail});
    },



    // ==========================================================================================
    //      Handle Mouse Events
    // ==========================================================================================
    onMouseMove(e){
        if (!RealmBuilder.isEnabled) return;

       // Get world point under mouse cursor.
        // e.dx and dy may be huge if game just started; game doesn't know mouse is actually already in center of screen at 300,300 (e.g) instead of 0,0
        // So cap dx dy at 0 if they are over 100
        // Note this causes jerky mouse movement to be ignored (jerk the mouse hard left and dx will be well over 100)
        if (e.dx > 100) e.dx = 0;
        if (e.dy > 100) e.dy = 0;

        switch(this.mode ){
        case RealmBuilderMode.Normal:
           if (Mouse.isPressed){
                if (this.isMouseOverMap() && this.tryRecaptureHandPan){
                    // recapture hand pan if already panning but mouse left
                    this.SetMode(RealmBuilderMode.HandPan);
                }
           } 
           break;
        case RealmBuilderMode.DraggingObject:
            this.UpdateWorldPointUnderCursor();
            // RealmBuilder.debugText.text = "x:"+Mouse.x+","+Mouse.y+"; y:"+this.draggingItem.name; //console.log('move');
            
            switch(this.draggingMode){
            case DraggingMode.PreInstantiation:
                if (this.isMouseOverMap()){
                    this.SetDraggingMode({mode:DraggingMode.PostInstantiation});
                    this.InstantiateDraggingItem();
                    this.BeginDraggingObject(this.draggingItem);
                }
            break;
            case DraggingMode.PostInstantiation:
                if (this.isMouseOverMap()){
                    this.draggingItem.moveTo(this.worldPointUnderCursor); 
                } else {
                    // Dragged an item back over the Items panel (not the map)
                    // Destroy it.
                    this.SetDraggingMode({mode:DraggingMode.PreInstantiation,iconTextureAsset:this.lastIconTextureAsset});
                    RealmBuilder.draggingItem.destroy();
                    // RealmBuilder.RealmData.currentLevel.DestroyEntity(RealmBuilder.draggingItem);
                }
            break;
           }
           break;
       case RealmBuilderMode.HandPan:
            let right = Camera.sky.entity.right.flat();
            let up = Camera.sky.entity.up.flat();
            let dt = .004;
            let xSpeed = new pc.Vec3().distance(Camera.sky.entity.getPosition().sub(this.cameraPivot.getPosition())) / 1000;
            let ySpeed = new pc.Vec3().distance(Camera.sky.entity.getPosition().sub(this.cameraPivot.getPosition())) / 1000;
            const mov = new pc.Vec3().add2(
                        right.mulScalar(-e.dx * xSpeed),
                        up.mulScalar(e.dy * ySpeed)
                    )
            if (Camera.sky.projection == 1){
                // Orthographic projection, we currently don't do this way
//                Camera.sky.entity.translate(mov);
            } else if (Camera.sky.projection == 0){
                this.cameraPivot.translate(mov);
            }
            if (!this.isMouseOverMap() || !Mouse.isPressed){
                console.log('breakpan');
                RealmBuilder.SetMode(RealmBuilderMode.Normal);
            }
       }

    },
    isMouseOverMap(){
        return Mouse.isMouseOverEntity(this.mapPanel) 
        && !Mouse.isMouseOverEntity(this.mapControlPanel)
        && !Mouse.isMouseOverEntity(this.changeMapBtn)
        && !Mouse.isMouseOverEntity(this.saveBtn)
        && !Mouse.isMouseOverEntity(this.loadBtn)

        && Mouse.cursorInPage; // got to be a better way ...!
    },

    onMouseDown(t){
        if (!RealmBuilder.isEnabled) return;
        this.UpdateWorldPointUnderCursor();     
        switch(this.mode){
            case RealmBuilderMode.Normal:
                // Did we click on a  (world game entity) item to edit?
                if (this.editableItemUnderCursor){
                    this.lastIconTextureAsset = assets.textures.ui.trash;
                    this.BeginDraggingObject(this.editableItemUnderCursor);
                } else if (this.isMouseOverMap()){
                    // ... No, enter hand pan mode.
                    if (this.worldPointUnderCursor){
                        let dist = pc.Vec3.distance(this.worldPointUnderCursor,Camera.sky.entity.getPosition());
                    }
                    this.handPanWorldOrigin = this.worldPointUnderCursor;
                    this.SetMode(RealmBuilderMode.HandPan);
                    this.tryRecaptureHandPan = true;
                }
            break;
            case RealmBuilderMode.HandPan:
                
                break;
            case RealmBuilderMode.EditingItem:
                if (this.editableItemUnderCursor){
                    this.BeginDraggingObject(this.editableItemUnderCursor);
                    return;
                }

                if (!Mouse.isMouseOverEntity(this.editableItemBackboard)){
//                    console.log('n');
                    this.SetMode(RealmBuilderMode.Normal);
                    this.onMouseDown(t); // re-do this method with Normal mode to allow switch to hand pan or drag item if needed
                }
                break;

            case RealmBuilderMode.MapScreen:
                // we clicked off the map screen, set mode back to normal
                if (!Mouse.isMouseOverEntity(this.changeMapScreen)){
                    this.SetMode(RealmBuilderMode.Normal);
                }
                break;
            }
        // this.CaptureAndRegisterState(); // Undo / Redo
 
    },

    onMouseUp(t){
        if (!RealmBuilder.isEnabled) return;
        switch(this.mode){
        case RealmBuilderMode.DraggingObject:
            if (this.worldPointUnderCursor && this.isMouseOverMap()){
                // Place the item.
                this.PlaceAndEditItemAtCursor(this.draggingItem);
               this.draggingItem = null; 
            } else {
                this.SetMode(RealmBuilderMode.Normal);
            }
            break;
        case RealmBuilderMode.HandPan:
            this.SetMode(RealmBuilderMode.Normal);
            break;
        case RealmBuilderMode.Normal:
            if (this.editableItemUnderCursor) {
                console.log('up');
                this.BeginEditingItem(this.editableItemUnderCursor); 
            } else {
            }
            break;
        default:break;
        }
        // this.CaptureAndRegisterState(); // Undo / Redo
    },
    onMouseScroll(e){
        switch(RealmBuilder.mode){
            case RealmBuilderMode.Normal:

            // Handle zoom in and out by mouse scroll
            const zoomFactor = this.lastCameraDistance / 35.0;
            let r = Camera.sky.entity.right.mulScalar(0.22);
            this.cameraIsLerping = false;
            if (Camera.sky.projection == 1){
                if (e.wheelDelta > 0){
                    if (Camera.sky.orthoHeight < 100) {
                        Camera.sky.orthoHeight++;
                        Camera.sky.entity.translate(-r.x,-r.y,-r.z);
                    }
                } else {
                    if (Camera.sky.orthoHeight > 10) {
                        Camera.sky.orthoHeight--;
                        Camera.sky.entity.translate(r.x,r.y,r.z);
                    }
                }
            } else if (Camera.sky.projection == 0) {
                const fwd = e.wheelDelta < 0 ? 1 : -1; // scroll up or down?
                const heightFactor = Camera.sky.entity.getLocalPosition().length(); // closer to ground? scroll slower
                const factor = 0.05;
                const dir = Camera.sky.entity.forward;//this.cameraPivot.getPosition().sub(Camera.sky.entity.getPosition()).normalize();
                const m = dir.mulScalar(fwd * heightFactor * factor)
                Camera.sky.entity.translate(m); 
            }
            break;
        }
    },
    UpdateWorldPointUnderCursor(){
        // Bit of annoying math to adjust for the fact that the MapPanel is only 560 x 500, while the Camera's viewport size is 800 x 500
        // I couldn't figure out how to make the camera's viewport etc be correct so I just adjust based on the app width and left margin
        // Without this math, there is an offset between the cursor position and the "world Point Under Cursor" position
        const w = pc.app.graphicsDevice.width;
        const leftMargin = this.leftMargin * pc.app.graphicsDevice.width / Constants.Resolution.width;
        let invXmap = (-leftMargin + Mouse.x) * (pc.app.graphicsDevice.width-leftMargin)/pc.app.graphicsDevice.width;
        let mx = (Mouse.x - leftMargin);
        let ww = w - leftMargin;
        let adjust = leftMargin*(ww - mx)/ww;
        let raycastResult = Camera.sky.screenPointToRay(Mouse.x-adjust,Mouse.y);
        // Whew ok bs math is over
        // Todo: Move this point translation to a Camera constant getter?
        this.editableItemUnderCursor = null; // is it performant to reset this every frame? I think so enough
        if (raycastResult) {
            if (raycastResult.entity) {
                this.worldPointUnderCursor = raycastResult.point;
                this.lastCameraDistance = pc.Vec3.distance(this.worldPointUnderCursor,Camera.sky.entity.getPosition());
                // editable item under cursor? while in normal mode?
                // editable item may be a "parent" with no colliders, so go upstream until we find it
                const parentDepthSearch = 5;
                let par = raycastResult.entity;

                for(i=0;i<parentDepthSearch;i++){
                    if (par.tags._list.includes(Constants.Tags.BuilderItem)){
                        this.editableItemUnderCursor = par;
                        return;
                    } else {
                    //    if (par.name == "NumberHoop") console.log('not found:'+par.name+","+par.getGuid()+" vs "+item.obj.getGuid());
                        par = par.parent ? par.parent : par;
                    }
                }
            }
        } else {
            let wc = new pc.Vec3()
            Camera.sky.screenToWorld(Mouse.x,pc.app.graphicsDevice.height-Mouse.y,0,wc);
            this.worldPointUnderCursor = wc.add(Camera.sky.entity.forward.mulScalar(this.lastCameraDistance));
        }
//        console.log("WP:"+this.worldPointUnderCursor);
    },

 



    // ==========================================================================================
    //     Drag, Place and Edit Items
    // ==========================================================================================
    PlaceAndEditItemAtCursor(item){ // PlaceAndEdit
        AudioManager.play({source:assets.sounds.ui.place_item}),
        item.enabled = true;
        item.getComponentsInChildren('collision').forEach(x=>{x.enabled=true;});
        this.lastPlacedItem = item;
        this.BeginEditingItem(item);
    },
    
    InstantiateObjectForBuilder(options){
        console.log("Inst:"+options.toString());
        const {level,template, position=pc.Vec3.ZERO, rotation=pc.Vec3.ZERO} = options;
        const entity = Game.Instantiate[template]({position:position,rotation:rotation});
        entity.tags.add(Constants.Tags.BuilderItem);
        entity.on('destroy',function(){
            console.log("D:"+entity.name);
            level.RemoveEntityFromPlacedObjects(entity);
        })
        // Eyton ; should have a class for these too?
        const placedObject = new PlacedEntity({
            entity : entity,
            template : template,
            level : level
        })
        level.placedObjects.push(placedObject);
        return entity;
    },
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
    },
    BeginDraggingObject(item){
       this.SetMode(RealmBuilderMode.DraggingObject);
        this.draggingItem = item;
        this.draggingItem.getComponentsInChildren('collision').forEach(x=>{x.enabled=false;});
        this.SetDraggingMode({mode:DraggingMode.PostInstantiation});
    },
    BeginDraggingNewObject(options={}){
        const { templateName, iconTextureAsset, width=80, height=80 } = options;
        this.lastIconTextureAsset = iconTextureAsset;
        // Note, currently if you drag an item onto empty space (not on top of a terrain), it will still exist! 
        this.SetMode(RealmBuilderMode.DraggingObject);
        this.SetDraggingMode({mode:DraggingMode.PreInstantiation,iconTextureAsset:iconTextureAsset,width:width,height:height});
        this.draggingTemplateNameToInstantiate = templateName;
    },
    SetDraggingMode(options={}){
        const { width=80, height=80, mode, iconTextureAsset = assets.textures.ui.icons.trash } = options
        this.draggingMode = mode;
        switch(mode){
        case DraggingMode.PreInstantiation:
            this.customCursorIcon.enabled = true;
            this.customCursorIcon.element.textureAsset = iconTextureAsset;
            this.customCursorIcon.element.width = width;
            this.customCursorIcon.element.height = height;
        break;
        case DraggingMode.PostInstantiation:
            pc.app.graphicsDevice.canvas.style.cursor = 'auto';
            this.customCursorIcon.enabled = false;
            break;

        }
    },

    InstantiateDraggingItem(){
        const item = RealmBuilder.InstantiateObjectForBuilder({level:RealmBuilder.RealmData.currentLevel,template:this.draggingTemplateNameToInstantiate});
        this.draggingItem = item;

    },
   BeginEditingItem(item){
        this.editingItem = item;
        this.SetMode(RealmBuilderMode.EditingItem);
        this.editableItemGroup.enabled=true;
        this.SetEditableItemMode(EditableItemMode.PoppingIn);
        this.editableItemGroup.setLocalScale(new pc.Vec3(0.5,0.5,0.5));
        this.MoveCamera({source:"begin eidt",targetPivotPos:item.getPosition()});
//        this.SetZoom(55);
    },


    // ==========================================================================================
    //      Camera
    // ==========================================================================================

    SetZoom(zoom){
        const dir = Camera.sky.entity.back;
        // Camera.sky.entity.moveTo(RealmBuilder.cameraPivot.getPosition().add(dir.mulScalar(zoom)));
    },
       
    RotateCameraLeft(){
        if (!this.cameraRotating){
            this.cameraRotating = true;
            this.totalDegreesRotated = 0;
            this.cameraMoveDirection = Constants.Direction.Left;
            this.cameraPivotTarget.rotate(90);
        }
    },
    RotateCameraRight(){
        if (!this.cameraRotating){
            this.cameraRotating = true;
            this.totalDegreesRotated = 0;
            this.cameraMoveDirection = Constants.Direction.Right;
            this.cameraPivotTarget.rotate(-90);
        }
    },
    MoveCamera(options={}){
        const { 
            targetPivotPos,
            targetZoomFactor = 35,
            lerp = true,
            source = "none",
        } = options;
        if (lerp) {
            this.cameraIsLerping= true;
            this.targetPivotPos = targetPivotPos;
            this.targetZoomFactor = targetZoomFactor;
        } else {
//            this.cameraPivot.setPosition(targetPivotPos);
//            Camera.sky.entity.setLocalPosition(new pc.Vec3(1,1.414,1).mulScalar(targetZoomFactor))
//            console.log("set local pos:"+Camera.sky.entity.getLocalPosition().trunc());
        }
     },
          
    // ==========================================================================================
    //      Update
    // ==========================================================================================

    Update(dt){
        this.blockSavetimer-=dt;
        if (!RealmBuilder.isEnabled) return;

        if (this.cameraRotating){
            const ang = new pc.Vec3().angle(this.cameraPivot.forward,this.cameraPivotTarget.forward);
            const degToRotate = 200 * dt;
            this.totalDegreesRotated += degToRotate;
            if (ang < 1 || this.totalDegreesRotated > 90) {
                this.cameraPivot.setRotation(this.cameraPivotTarget.getRotation());
                this.cameraRotating = false;
            } else {
                switch(this.cameraMoveDirection){
                case Constants.Direction.Left:
                    this.cameraPivot.rotate(degToRotate);
                    break;

                case Constants.Direction.Right:
                    this.cameraPivot.rotate(-degToRotate);
                    break;
                }
            }
        }

        // Add switch case for overall state, since editable state is a substate
        const fudge = 0.1; // takes too long for lerp to reach destination.
        switch(this.editableItemMode){
            case EditableItemMode.Normal:
            break;
            case EditableItemMode.PoppingIn:
                if (this.editableItemGroup.localScale.x < 1.0-fudge) {
                    const popInSpeed = 1000;
                    const d = Math.lerp(this.editableItemGroup.localScale.x,1.0,dt * popInSpeed);
                    this.editableItemGroup.setLocalScale(d,d,d);
                } else {
                    this.SetEditableItemMode(EditableItemMode.Normal);
                }
                break;
            case EditableItemMode.PoppingOut:
                const minScale = 0.5;
                if (this.editableItemGroup.localScale.x > minScale + fudge) {
                    const popInSpeed = 1000;
                    const d = Math.lerp(this.editableItemGroup.localScale.x,minScale,dt * popInSpeed);
                    this.editableItemGroup.setLocalScale(d,d,d);
                } else {
                    this.SetEditableItemMode(EditableItemMode.Editing);
                    this.editableItemGroup.enabled=false;
                }
                break;
            case EditableItemMode.Editing: break;
            default:break;

        }

        // Lerp Camera?
        if (this.cameraIsLerping){
            
            // Math lerp goes from A to B as C goes from 0 to 60: Math.lerp(A,B,C)
            // Vec3 lerp does what?

            // Lerp pivot pos
            const lerpSpeed = 10.0;
            const lerpPos = new pc.Vec3().lerp(this.cameraPivot.getPosition(),this.targetPivotPos,lerpSpeed*dt);
           
            // Lerp  zoom.
            const lerpZoomSpeed = 10;
            const targetLocalCamPos = new pc.Vec3(1,1.414,1).mulScalar(this.targetZoomFactor);
            const lerpZoomPos = new pc.Vec3().lerp(Camera.sky.entity.getLocalPosition(),targetLocalCamPos,lerpZoomSpeed*dt);

            // Finished both?
            const distToTargetPos = pc.Vec3.distance(lerpPos,this.targetPivotPos);
            const distToTargetZoom = pc.Vec3.distance(targetLocalCamPos,Camera.sky.entity.getLocalPosition());
           
            const finishedLerpPos = distToTargetPos < 0.2;
            const finishedLerpZoomPos = distToTargetZoom < 0.2;
            
            if (finishedLerpPos && finishedLerpZoomPos) {
                // Lerp finished
                this.cameraIsLerping = false;
                this.cameraPivot.moveTo(this.targetPivotPos)
                Camera.sky.entity.setLocalPosition(targetLocalCamPos);
            } else {
                // Lerping
                this.cameraPivot.moveTo(lerpPos);
                Camera.sky.entity.setLocalPosition(lerpZoomPos);
            }

        }

        // Position custom cursor. Always position even when not shown, else it lags on enable.
        const canvas = pc.app.graphicsDevice.canvas;
        x = Mouse.x/canvas.width;
        y = Mouse.y/canvas.height;
        this.customCursorIcon.element.anchor = new pc.Vec4(x, y, x, y);


        // pan cursor
        switch(RealmBuilder.mode){ 
            case RealmBuilderMode.HandPan:
                break;
            case RealmBuilderMode.EditingItem:
               break;
            case RealmBuilderMode.DraggingObject:
                break;            //RealmBuilder.guiButtons[0].entity.element.anchor =  new pc.Vec4(x, y, x, y);
        }
    },

   
  
}

RealmBuilder.Init();

// TODO: Move to class.
