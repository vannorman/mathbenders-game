import BuilderPanel from './builderPanel.js';
import EditItemTray from './editItemTray.js';
import TerrainGui from './terrainGui.js';

export default class GUI {

    // Note: 'backboard', 'screen', 'panel', 'window' terminology to be merged/truncated
    
    get leftMargin() { return 240; }
    #logoPanelWidth = 80;
    #screen; // base entity holding all UI

    // Various buttons and ui elements
    #saveBtn;
    #loadBtn;
    #mapControlPanel;
    mapPanel;
    #mapIcons;
    #customCursorIcon;
    get customCursorIcon(){return this.#customCursorIcon;}
    #setHandPanModeBtn;
    #setSelectPanModeBtn;

    // Navigation of all builder panel modes
    #builderPanels;
    get builderPanels(){return this.#builderPanels; }
    #builderObjectIconsPanel;
    #realmInfoScreen; // first panel
    #navList;
    get navList() {return this.#navList;}
  

    // Save Load
    #loadRealmScreen;// parent 
    #loadRealmWindow; // child

    // Edit item on map
    #editableItemGroup; 
    #editableItemBackboard; 
    get editableItemBackboard(){return this.#editableItemBackboard;}

    circleButtons; // the one ring to rule them all

    // why?
    #guiButtons=[];
    get guiButtons(){ return guiButtons; }


    constructor(params={}){
        this.realmEditor = params.realmEditor;
        this.buildUi();
        GameManager.subscribe(this, this.onGameStateChange);
    }

    #updateInitialized=false;
    onGameStateChange(state){
        // @Eytan; I can't understand why but cursor won't appear if i initialize update in constructor, so i wait for game to start
        if (!this.#updateInitialized && state == GameState.RealmBuilder) { 
            pc.app.on('update',function(dt){realmEditor.gui.update(dt);});
            this.#updateInitialized=true;
        }
    }

    // Move to RealmEditorMouse?
    get isMouseOverMap() {
        const is = Mouse.isMouseOverEntity(this.mapPanel) 

        && !Mouse.isMouseOverEntity(this.#mapControlPanel) // shouldn't need  to check "mouse isn't over" each. awkward.
        && (!this.editItemTray.entity.enabled || !Mouse.isMouseOverEntity(this.editItemTray.entity))
//        && !Mouse.isMouseOverEntity(this.#setHandPanModeBtn)
//        && !Mouse.isMouseOverEntity(this.#setSelectPanModeBtn)
//        && !Mouse.isMouseOverEntity(this.#saveBtn)
//        && !Mouse.isMouseOverEntity(this.#loadBtn)
//
//        && Mouse.cursorInPage; // got to be a better way ...!
        return is;
    }
    // move to RealmEditorMouse??

    #lastCameraDistance=10; // feels like this should be in Camera ..?
    get worldPointUnderCursor() {
        var worldPointUnderCursor = null;
        // Bit of annoying math again
        let raycastResult = this.realmEditor.camera.cameraComponent.screenPointToRay(Mouse.xMap,Mouse.y);
        // Whew ok bs math is over
        if (raycastResult) {
            // console.log("hit "+raycastResult.entity.name+", wp:"+raycastResult.point.y.toFixed(2));
            worldPointUnderCursor = raycastResult.point;
            this.#lastCameraDistance = pc.Vec3.distance(worldPointUnderCursor,this.realmEditor.camera.entity.getPosition());
        } else {
            let wc = new pc.Vec3()
            this.realmEditor.camera.cameraComponent.screenToWorld(Mouse.x,pc.app.graphicsDevice.height-Mouse.y,0,wc);
            const dir = this.realmEditor.camera.cameraComponent.screenPointToWorldDir(Mouse.xMap,Mouse.y);
            worldPointUnderCursor = wc.add(dir.mulScalar(this.#lastCameraDistance));
        }

        return worldPointUnderCursor;
    }


    get editableItemUnderCursor () {
        // was:  UpdateWorldPointUnderCursor(){
        var editableItemUnderCursor = null;

        // Bit of annoying math to adjust for the fact that the MapPanel is only 560 x 500, while the Camera's viewport size is 800 x 500
        // I couldn't figure out how to make the camera's viewport etc be correct so I just adjust based on the app width and left margin
        // Without this math, there is an offset between the cursor position and the "world Point Under Cursor" position
        const w = pc.app.graphicsDevice.width;
        const leftMargin = this.realmEditor.gui.leftMargin * pc.app.graphicsDevice.width / Constants.Resolution.width;
        let invXmap = (-leftMargin + Mouse.x) * (pc.app.graphicsDevice.width-leftMargin)/pc.app.graphicsDevice.width;
        let mx = (Mouse.x - leftMargin);
        let ww = w - leftMargin;
        let adjust = leftMargin*(ww - mx)/ww;
        let raycastResult = realmEditor.camera.cameraComponent.screenPointToRay(Mouse.x-adjust,Mouse.y);
        // Whew ok bs math is over
        if (raycastResult) {
            if (raycastResult.entity) {
                // editable item under cursor? while in normal mode?
                // editable item may be a "parent" with no colliders, so go upstream until we find it
                const parentDepthSearch = 5;
                let par = raycastResult.entity;

                // This is returning null even tho we're hitting a placedItem?
                // console.log('par:'+par.name);
                // console.log('tags:'+par.tags._list.toString());

                for(let i=0;i<parentDepthSearch;i++){
                    if (par.tags._list.includes(Constants.Tags.BuilderItem)){
                        editableItemUnderCursor = par;
                        // return getEditableItemByEntity(editableItemUnderCursor);
                        return editableItemUnderCursor; // Actually an entity ..
                    } else {
                    //    if (par.name == "NumberHoop") console.log('not found:'+par.name+","+par.getGuid()+" vs "+item.obj.getGuid());
                        par = par.parent ? par.parent : par;
                    }
                }
            }
        }

        return null;
    }
    
    enable(){
        this.#screen.enabled = true;
    }

    disable(){
        this.#screen.enabled = false;
    }

    buildUi(){
        // chonker function, split?
        const $this = this; // to avoid referencing realmEditor.gui in this on('click') which loses "this" context
        const gui = new pc.Entity("gui");
        this.#screen = gui;
        gui.addComponent("screen", {
            layers:[pc.LAYERID_UI],
            referenceResolution: new pc.Vec2(Constants.Resolution.width,Constants.Resolution.height),
            scaleBlend: 1.0,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true,
        });
        pc.app.root.addChild(this.#screen);



        // Set up the cursor.
        this.#customCursorIcon = new pc.Entity("customcursoce");
        this.#customCursorIcon.addComponent(
            'element',{
            type:'image',
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            }
        )
        this.#customCursorIcon.enabled = false;


        // Add an empty element to the "map" part of the screen. This will let the app know if the mouse cursor is over this part of screen
        this.mapPanel = new pc.Entity("mappanel");
        this.mapPanel.addComponent("element", {
            type: "image",
            anchor: [0.3, 0, 1, 1],   
            pivot: [0, 0],
            width: 1,
            height: 1,
            margin: [0, 0, 0, 0],
            opacity:1,
            useInput : true,
        });
        this.mapPanel.element.on('mousedown',function(){
            if (realmEditor.gui.isMouseOverMap){
                realmEditor.mapClicked();
            }
        }) // i don't love binding this here, awkward.

        this.dragBox = new pc.Entity();
        this.dragBox.addComponent('element',{
            type:'image',
            anchor: [0.2, 0.2, 0.7, 0.7],
            pivot: [0.5, 0.5],
            margin:[0,0,0,0],
            color:pc.Color.WHITE,
            opacity:0.3,

        })
        this.mapPanel.addChild(this.dragBox);
        this.dragBox.enabled=false;




        // and worse,
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, function(){
            // console.log("Mouse x:"+Mouse.x/pc.app.graphicsDevice.canvas.clientWidth);
            // If we click to the left of the map, e.g. anywhere on the builder panels etc, set mode to normal.
            // Will conflic twith toggle('draggingitem') if we clicked an icon tho.
            if (Mouse.x/pc.app.graphicsDevice.canvas.clientWidth < 0.29){
                this.realmEditor.clickOffMap(); 
            }

        }, this);


        gui.addChild(this.mapPanel);

        // Link render texture from camera to map
        this.mapPanel.element.texture = this.realmEditor.camera.renderTexture; // shows a tiled skybox (broken)
        this.mapPanel.on('mouseleave',function(){console.log('breakmap');});


        // Define panels where the builder icons go.
        var navAndBuilderPanel = new pc.Entity("builderpanel");
        navAndBuilderPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 0.3, 1],    
            margin:[0,0,0,0],
            textureAsset: assets.textures.ui.builder.orangeFade,
            useInput: true           
        });

        gui.addChild(navAndBuilderPanel);
        this.navAndBuilderPanel=navAndBuilderPanel;//builderPanel=builderPanel;

        // Create the second image (positioned 160px from the left, 80px wide, 100% height)
        this.#builderObjectIconsPanel = new pc.Entity("builerobjectsiconpanl");
        this.#builderObjectIconsPanel.addComponent("element", {
            type: "image",
            anchor: [0.34, 0, 1, 1],    // Stretch vertically, anchor to left side
            pivot: [0, 0.5],         
            margin: [0, 0, 0, 0],  // Offset from the left by 160px (80px + 80px gap)
            color: pc.Color.WHITE,
            opacity:1,
            useInput: true           
        });

        // Create the first image (left, 80px wide, 100% height)
        var logoPanel = new pc.Entity("logopanel");
        logoPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 0.12, 1],    
            //width: this.#logoPanelWidth,               
            // height: 1,               
            textureAsset: assets.textures.ui.builder.orangeFade,
            useInput: true           
        });

        var border1 = new pc.Entity("border1");
        border1.addComponent("element", {
            type: "image",
            anchor: [0, 0, 0, 1],    
            pivot: [0, 0.5],         
            width: 2,
            height: 1,               
            color: new pc.Color(0.1,0.1,0.1),
        });

        var border2 = new pc.Entity("border1");
        border2.addComponent("element", {
            type: "image",
            anchor: [0.995, 0, 1, 1],    
            pivot: [0.5, 0.5],         
            margin: [0,0,0,0],//this.#logoPanelWidth + 2, 0, 0, 0],  // 
            color: pc.Color.BLACK,
        });
        this.border2=border2;

        // Add logo panel, tray, and border images
        navAndBuilderPanel.addChild(logoPanel);
        navAndBuilderPanel.addChild(border1);
        navAndBuilderPanel.addChild(this.#builderObjectIconsPanel);
        navAndBuilderPanel.addChild(border2);
        //        gui.addChild(builderItemsPanel);


        this.#navList = new pc.Entity("navlsit");
        this.#navList.addComponent('element',{
            type:'image',
            anchor:[0,0.5,0,0.5],
            pivot:[0,0.5],
            height:200,
            opacity:0,
            width:this.#logoPanelWidth+2,
        }); // not sure why x-max-anchor needs to be 0.7 here and not 1.0, but 1.0 pushes it beyond the parent width somehow
        this.#navList.addComponent('layoutgroup',{ 
            orientation: pc.ORIENTATION_VERTICAL, 
            spacing: new pc.Vec2(0, 2), 
            wrap: false,
            widthFitting: pc.FITTING_STRETCH,
            alignment:[0.5,0.6],
        });
        Game.navList=this.#navList.element;
         
        logoPanel.addChild(this.#navList);
        Game.logoPanel = logoPanel.element;

        // Add buttons to hover over map
        // Map control left/right
        this.#mapControlPanel = new pc.Entity("mapControlPanel");
        this.#mapControlPanel.addComponent('element',{
            type:'image',
            anchor:[0.5,0,0.5,0],
            pivot:[0.5,0],
            height:30,
            width:70,
            opacity:1,
            useInput:true
            }); // not sure why x-max-anchor needs to be 0.7 here and not 1.0, but 1.0 pushes it beyond the parent width somehow
        this.mapPanel.addChild(this.#mapControlPanel);

        // Set up Rotate Map Left button
        UI.SetUpItemButton({
            parentEl:this.#mapControlPanel,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemLeft,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){realmEditor.camera.rotate(90)},
            cursor:'pointer',
        });

        // Set up Rotate Right button
        UI.SetUpItemButton({
            parentEl:this.#mapControlPanel,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemRight,
            anchor:[.8,.5,.8,.5],
            mouseDown:function(){realmEditor.camera.rotate(-90)},
            cursor:'pointer',
        });



        this.modeSelect = new OptionButtonGroupUI({
            parent: this.mapPanel,
            options: [
                {
                    name: "A",
                    textureAsset:assets.textures.ui.icons.hand,
                    defaultColor: new pc.Color(1, 1, 1),
                    hoverColor: new pc.Color(1, 1, 0),
                    anchor:[.05,.95,.05,.95],
                    selectedColor: new pc.Color(0, 1, 0),
                    onClick: () => {
                        // console.log("button A was clicked")
                        realmEditor.toggle('normal');
                    }
                },
                {
                    name: "B",
                    textureAsset:assets.textures.ui.builder.select,
                    anchor:[.1,.95,.1,.95],
                    defaultColor: new pc.Color(1, 1, 1),
                    hoverColor: new pc.Color(1, 1, 0),
                    selectedColor: new pc.Color(0, 1, 0),
                    onClick: () => {
                        realmEditor.toggle('select');
                        // console.log("button B was clicked")
                    }
                }
            ]
        });

/*
        // Set up set of buttons to select "Pan, Select".    
        this.#setHandPanModeBtn = UI.SetUpItemButton({
            parentEl:this.mapPanel,
            width:30,height:30,textureAsset:assets.textures.ui.icons.hand,
            useSelectedState:true,
            anchor:[.05,.95,.05,.95],
            colorOn:pc.Color.YELLOW,
            mouseDown:function(){ realmEditor.toggle('normal'); console.log("HAND PAN"); },
            cursor:'pointer',
        });

        // Set up set of buttons to select "Pan, Select".    
        this.#setSelectPanModeBtn = UI.SetUpItemButton({
            parentEl:this.mapPanel,
            colorOn:pc.Color.YELLOW,
            useSelectedState:true,
            width:30,height:30,
            textureAsset:assets.textures.ui.builder.select,
            anchor:[.1,.95,.1,.95],
            mouseDown:function(){ realmEditor.toggle('select'); console.log("SELECT "); },
            cursor:'pointer',
        });

  */      
        this.#builderPanels = []
        const realmInfoPanel = new BuilderPanel({ gui:this,  name:"Realm Info"});
        this.realmInfoScreen = this.CreateRealmInfoScreen();
        realmInfoPanel.panel.addChild(this.realmInfoScreen);
        this.#builderPanels.push(realmInfoPanel);
        this.#builderPanels.push(new BuilderPanel({ gui:this,  name:"Player", items : [
                    //{ templateName:Constants.Templates.PlayerStart,textureAsset:assets.textures.ui.builder.start },
                    { ItemTemplate : PlayerStart },
                    { ItemTemplate : PlayerPortal },
                    //{ templateName:Constants.Templates.Portal,textureAsset:assets.textures.ui.builder.portal },
            ],}))
        this.#builderPanels.push(
            new BuilderPanel({ gui:this,  name:"Machines", items : [
//                    { templateName:Constants.Templates.Multiblaster, textureAsset:assets.textures.ui.icons.multiblaster },
//                    { templateName:Constants.Templates.Zooka, textureAsset:assets.textures.ui.icons.zooka },
                    { ItemTemplate:NumberHoop } ,
                    { ItemTemplate:MultiblasterPickup } ,
                    { ItemTemplate:SwordPickup },
                    // templateName:Constants.Templates.NumberHoop, textureAsset:assets.textures.ui.icons.hoop },
            ],}));
        this.#builderPanels.push(
            new BuilderPanel({ gui:this,  name:"Numbers", items : [
                    { ItemTemplate:NumberFaucet },
                    { ItemTemplate:NumberWall },
                    { ItemTemplate:SpikeyGroup },
                   // { templateName:Constants.Templates.NumberFaucet, textureAsset:assets.textures.ui.icons.faucet },
                   //  { templateName : Constants.Templates.NumberWall, textureAsset:assets.textures.ui.icons.numberWall },
            ],}));
        this.#builderPanels.push(new BuilderPanel({ gui:this,  name:"Castle", items : [
                    { ItemTemplate:CastleTurret } ,
                    { ItemTemplate:CastleWall } ,
                    { ItemTemplate:ConcretePad} ,
                    { ItemTemplate:BigConcretePad} ,
                    { ItemTemplate:Tree1} ,
            ],}));
        
        // Save icon
         this.#saveBtn = UI.SetUpItemButton({
            parentEl:this.mapPanel,
            width:60,height:60,
            anchor:[0.885, 0.86, 0.925, 0.9],
            pivot:[0.5,0],
            mouseDown:function(){
                realmEditor.Save();
            }, //console.log("Save");},//this.#SetMode(RealmBuilderMode.MapScreen);},
            cursor:'pointer',
            textureAsset:assets.textures.ui.builder.save,
        });

        // Load icon
        this.#loadBtn = UI.SetUpItemButton({
            parentEl:this.mapPanel,
            width:60,height:60,
            anchor:[0.885, 0.76, 0.925, 0.8],
            pivot:[0.5,0],
            mouseDown:function(){$this.OpenLoadRealmUI();}, //console.log("Save");},//this.#SetMode(RealmBuilderMode.MapScreen);},
            cursor:'pointer',
            textureAsset:assets.textures.ui.builder.load,
        });

        // Set up terrain panel
        this.editTerrainPanel = new BuilderPanel({ gui:this,  name:"Terrain",skipLayout:true});
        this.terrain = new TerrainGui({guiBase:this});
        this.editTerrainPanel.panel.addChild(this.terrain.screen);
        this.#builderPanels.push(this.editTerrainPanel);

        // Now that each builder panel was created, add it to the hierarcy.
        this.#builderPanels.forEach(panel=>{
            this.#navList.addChild(panel.navButton); 
            this.#builderObjectIconsPanel.addChild(panel.panel);
        });
        this.#builderPanels[0].select();



        // Load screen
        this.#loadRealmScreen = new pc.Entity("load level scrn");
        const loadLevelBackboard = new pc.Entity('load level backbaord');
        loadLevelBackboard.addComponent('element',{
            type:'image',
            anchor:[0,0,1,1],
            pivot:[0.5,0.5],
            width:pc.app.graphicsDevice.width,
            height:pc.app.graphicsDevice.height,
            color:pc.Color.BLACK,
            opacity:0.5,
            useInput:true,
        });
        this.#screen.addChild(this.#loadRealmScreen);
        this.#loadRealmScreen.addChild(loadLevelBackboard);
        this.#loadRealmScreen.enabled=false;
        loadLevelBackboard.element.on('mousedown',function(){ $this.CloseLoadRealmUI(); }); // Close screen if click background
        
        this.#loadRealmWindow = new pc.Entity();
        this.#loadRealmWindow.addComponent('element',{
            type:'image',
            anchor:[0.15,0.15,0.85,0.85],
            pivot:[0.5,0.5],
            color:pc.Color.WHITE,
            opacity:1,
            useInput:true,
 
        });
        this.#loadRealmScreen.addChild(this.#loadRealmWindow);

        UI.AddCloseWindowButton({
            parentEl:this.#loadRealmWindow,
            onClickFn:function(){$this.CloseLoadRealmUI();}});


        const newText = new pc.Entity();
        newText.addComponent('element',{
            type: 'text',
            text: "CREATE NEW REALM:",
            anchor:[0.16,0.86,0.16,0.86],
            pivot:[0,0.5],
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : 18,
            width:80,
           color:pc.Color.BLACK,
        });
        this.#loadRealmWindow.addChild(newText);

        // Set up NEW REALM
        UI.SetUpItemButton({
            parentEl:this.#loadRealmWindow,
            width:40,height:40,
            textureAsset:assets.textures.ui.builder.newRealm,
            anchor:[0.56, 0.9, 0.56, 0.9],
            cursor:'pointer',
            mouseDown:function(){$this.CloseLoadRealmUI();realmEditor.NewRealm();}
        }).element;


        const loadText = new pc.Entity();
        loadText.addComponent('element',{
            type: 'text',
            text: "LOAD REALM:",
            anchor:[0.27, 0.75, 0.27, 0.75],
            pivot:[0.5,0.5],
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : 18,
            width:80,
           color:pc.Color.BLACK,
        });
        this.#loadRealmWindow.addChild(loadText);
 

                // Edit item
        this.editItemTray = new EditItemTray();



        // Entire editor
        this.mapPanel.addChild(this.editItemTray.entity);
        // this.CreatePopUpEditItemTray({realmEditor:this.realmEditor});
        this.#screen.enabled = false;



        // Custom icon
        this.#screen.addChild(this.#customCursorIcon); // if I add this too early, it doesn't show up due to hierarchy, overwritten by map

 

    }

    OpenLoadRealmUI(){
        this.realmEditor.toggle('loadScreen');
        const callback = (realms)=>{realmEditor.gui.PopulateRealmList(realms)};
        loginWeb.GetLevels(callback);

    }
    
    PopulateRealmList(realms){
        const $this = this;
        if ( this.loadRealmsList) this.loadRealmsList.destroy();
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
                    $this.realmEditor.RealmData.Clear();
                    $this.realmEditor.LoadJson(realmData.json_data)
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
    
        const realmList  = [];
        realms.forEach(realm=>{
            const realmItem = realmListItem({name:realm.name,realmId:realm.realm_id}); 
            realmList.push(realmItem);
        });
       
        this.loadRealmsList = UI.CreateScrollableLayoutGroup({screen:this.#loadRealmWindow,itemList:realmList});
        this.#loadRealmScreen.enabled=true;
    }
    CloseLoadRealmUI(){
        // this.blockSavetimer=0.5;
        this.realmEditor.toggle('normal');
        this.#loadRealmScreen.enabled=false;
    }
 


    CreateRealmInfoScreen(){
        // Add (custom) Terrain builder panel screen
        const realmInfoScreen = new pc.Entity();
        realmInfoScreen.addComponent('element',{
            type:'image',
            anchor:[0,0,1,1],
            pivot:[0.5,.5],
            margin:[0,0,0,0],
            opacity:0.5,
            color:pc.Color.BLUE,
        }); 
        realmInfoScreen.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_VERTICAL,
            spacing: new pc.Vec2(-20, 0),
            alignment: [0.5,1],
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
        });

        
        const inputGroup = UI.createInputWithLabel({text:"Name:",onChangeFn:(val)=>{
            this.realmEditor.UpdateData({'name':val});
        }});

        realmInfoScreen.addChild(inputGroup.root);
        this.realmNameText = inputGroup.inputText; // why?


        return realmInfoScreen;

    }

    // Move to Mouse?
    setHandPanCursor(){
        this.setCustomCusror(assets.textures.ui.icons.hand);
       pc.app.graphicsDevice.canvas.style.cursor = 'none';
    }

    setNormalCursor(){
       this.#customCursorIcon.enabled = false;
       pc.app.graphicsDevice.canvas.style.cursor = 'auto';
    }

    setCustomCusror(customTextureAsset){
        this.#customCursorIcon.enabled = true;
        this.#customCursorIcon.element.textureAsset = customTextureAsset,
        this.#customCursorIcon.element.width = 50;
        this.#customCursorIcon.element.height= 50;
        pc.app.graphicsDevice.canvas.style.cursor = 'none';
    }

    setTrashCursor(){
        this.setCustomCusror(assets.textures.ui.icons.trash);
    }

    update(dt){
        const canvas = pc.app.graphicsDevice.canvas;
        let x = Mouse.x/canvas.width;
        let y = Mouse.y/canvas.height;
        this.#customCursorIcon.element.anchor = new pc.Vec4(x, y, x, y);


    }
    
    onModeChanged(mode){
        switch(mode){
            case 'normal': 
                this.modeSelect.buttons[0].element.fire('select'); // Auto select first one
                break;
            case 'select': 
                this.modeSelect.buttons[1].element.fire('select'); // Auto select first one
                break;
        } 
    }

}


