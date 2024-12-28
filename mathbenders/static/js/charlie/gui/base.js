import BuilderPanel from './builderPanel.js';

export default class GUI {

    // Note: 'backboard', 'screen', 'panel', 'window' terminology to be merged/truncated
    
    get leftMargin() { return 240; }
    #logoPanelWidth = 80;
    #screen; // base entity holding all UI

    // Various buttons and ui elements
    #changeMapBtn;
    #saveBtn;
    #loadBtn;
    #mapControlPanel;
    #mapPanel;
    #mapIcons;
    #changeMapScreen; // parent
    #changeMapScreenLayout; // child
    #customCursorIcon;

    // Navigation of all builder panel modes
    #builderPanels;
    get builderPanels(){return this.#builderPanels; }
    #builderObjectIconsPanel;
    #realmInfoScreen; // first panel
    #navList;
    get navList() {return this.#navList;}
  
    // Terrain
    #editTerrainScreen;
    #TerrainTools = {};

    // Save Load
    #loadRealmScreen;// parent 
    #loadRealmWindow; // child

    // Edit item on map
    #editableItemGroup; 
    #editableItemBackboard; 
    #circleButtons;

    // why?
    #guiButtons=[];
    get guiButtons(){ return guiButtons; }


    constructor(params={}){
        this.realmEditor = params.realmEditor;
        this.buildUi();
//        this.createMap() // static? Once only
//        this.createbuilderPanels();
//        this.createMapButtons();
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


    get isMouseOverMap() {
        const is = Mouse.isMouseOverEntity(this.#mapPanel)   // legacy ref. Should be this.mapPanel
//        && !Mouse.isMouseOverEntity(this.#mapControlPanel) // shouldn't need  to check "mouse isn't over" each. awkward.
//        && !Mouse.isMouseOverEntity(this.#changeMapBtn)
//        && !Mouse.isMouseOverEntity(this.#saveBtn)
//        && !Mouse.isMouseOverEntity(this.#loadBtn)
//
//        && Mouse.cursorInPage; // got to be a better way ...!
        return is;
    }

    enable(){
        this.#screen.enabled = true;
    }

    disable(){
        this.#screen.enabled = false;
    }

    buildUi(){
        // chonker function, split?
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
        this.#mapPanel = new pc.Entity("mappanel");
        this.#mapPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 1, 1],   
            pivot: [0, 0],
            width: 1,
            height: 1,
            margin: [this.leftMargin, 0, 0, 0],
            opacity:1,
        });

        gui.addChild(this.#mapPanel);

        // Link render texture from camera to map
        this.#mapPanel.element.texture = this.realmEditor.camera.renderTexture; // shows a tiled skybox (broken)
        this.#mapPanel.on('mouseleave',function(){console.log('breakmap');});


        // Define panels where the builder icons go.
        var builderPanel = new pc.Entity("builderpanel");
        builderPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 0, 1],    
            pivot: [0, 0.5],         
            width: this.leftMargin,               // 
            height: 1,               
            // color: pc.Color.RED,//new pc.Color(.6,.6,.6),
            textureAsset: assets.textures.ui.builder.orangeFade,
            useInput: true           
        });

        gui.addChild(builderPanel);
        this.builderPanel=builderPanel;

        // Create the second image (positioned 160px from the left, 80px wide, 100% height)
        this.#builderObjectIconsPanel = new pc.Entity("builerobjectsiconpanl");
        this.#builderObjectIconsPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 1, 1],    // Stretch vertically, anchor to left side
            pivot: [0, 0.5],         
            width: 80,               // Fixed width of 80 pixels
            height: 1,               
            margin: [82, 0, 0, 0],  // Offset from the left by 160px (80px + 80px gap)
            color: pc.Color.WHITE,
            opacity:1,
            useInput: true           
        });

        // Create the first image (left, 80px wide, 100% height)
        var logoPanel = new pc.Entity("logopanel");
        logoPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 0, 1],    
            pivot: [0, 0.5],         
            width: this.#logoPanelWidth,               
            height: 1,               
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
            margin: [80, 0, 0, 0],  // doesn't seem to matter lol
            color: new pc.Color(0.1,0.1,0.1),
        });

        var border2 = new pc.Entity("border1");
        border2.addComponent("element", {
            type: "image",
            anchor: [1, 0, 1, 1],    
            pivot: [0, 0.5],         
            width: 2,               // 
            height: 1,               
            margin: [this.#logoPanelWidth + 2, 0, 0, 0],  // 
            color: new pc.Color(0.1,0.1,0.1),
        });


        // Add logo panel, tray, and border images
        builderPanel.addChild(logoPanel);
        builderPanel.addChild(border1);
        builderPanel.addChild(this.#builderObjectIconsPanel);
        builderPanel.addChild(border2);
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
        this.#mapPanel.addChild(this.#mapControlPanel);

        // Set up Rotate Map Left button
        UI.SetUpItemButton({
            parentEl:this.#mapControlPanel,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemLeft,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){Camera.sky.RotateCameraRight()},
            cursor:'pointer',
        });

        // Set up Rotate Right button
        UI.SetUpItemButton({
            parentEl:this.#mapControlPanel,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemRight,
            anchor:[.8,.5,.8,.5],
            mouseDown:function(){Camera.sky.RotateCameraLeft()}, // TODO: Move to RealmBuilderCamera class.
            cursor:'pointer',
        });

        this.#editTerrainScreen = new pc.Entity();
        this.#editTerrainScreen.addComponent('element',{
            type:'image',
            anchor:[0.5,0.5,0.5,0.5],
            pivot:[0.5,0.5],
            height:330,
            width:150,
            opacity:0.5,
            color:pc.Color.GREEN,
        }); 
        
        this.#builderPanels = []
        const realmInfoPanel = new BuilderPanel({ gui:this,  name:"Realm Info"});
        this.realmInfoScreen = this.CreateRealmInfoScreen();
        realmInfoPanel.panel.addChild(this.realmInfoScreen);
        this.#builderPanels.push(realmInfoPanel);
        this.#builderPanels.push(new BuilderPanel({ gui:this,  name:"Player", items : [
                    { templateName:Constants.Templates.PlayerStart,textureAsset:assets.textures.ui.builder.start },
                    { templateName:Constants.Templates.Portal,textureAsset:assets.textures.ui.builder.portal },
            ],}))
        this.#builderPanels.push(
            new BuilderPanel({ gui:this,  name:"Machines", items : [
                    { templateName:Constants.Templates.Multiblaster, textureAsset:assets.textures.ui.icons.multiblaster },
                    { templateName:Constants.Templates.Zooka, textureAsset:assets.textures.ui.icons.zooka },
                    { templateName:Constants.Templates.NumberHoop, textureAsset:assets.textures.ui.icons.hoop },
            ],}));
        this.#builderPanels.push(
            new BuilderPanel({ gui:this,  name:"Numbers", items : [
                    { templateName:Constants.Templates.NumberFaucet, textureAsset:assets.textures.ui.icons.faucet },
                    { templateName : Constants.Templates.NumberWall, textureAsset:assets.textures.ui.icons.numberWall },
            ],}));
        this.#builderPanels.push(new BuilderPanel({ gui:this,  name:"Castle", items : [
                    { templateName:Constants.Templates.CastleTurret,textureAsset:assets.textures.ui.icons.turret1 },
                    { templateName:Constants.Templates.CastleWall,textureAsset:assets.textures.ui.icons.wall, },
            ],}));
        const editTerrainPanel = new BuilderPanel({ gui:this,  name:"Terrain"});
        editTerrainPanel.panel.addChild(this.#editTerrainScreen);
        this.#builderPanels.push(editTerrainPanel);

        // Now that each builder panel was created, add it to the hierarcy.
        this.#builderPanels.forEach(panel=>{
            this.#navList.addChild(panel.navButton); 
            this.#builderObjectIconsPanel.addChild(panel.panel);
        });
        this.#builderPanels[0].select();

        editTerrainPanel.navButton.element.on('click',function(){
            // TODO: Move outside of UI?
            /*
            console.log("select terrain 1");
            const terrainPos = this.#RealmData.currentLevel.terrain.entity.getPosition();
            const terrainScale = this.#RealmData.currentLevel.terrain.scale;
            this.#MoveCamera({source:"click ter",targetPivotPos:terrainPos, targetZoomFactor:terrainScale * 2.2});
            editTerrainPanel.select();
            this.UpdateTerrainToolValues();
           */ 

        });

        this.#editTerrainScreen.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_VERTICAL,
            spacing: new pc.Vec2(-20, 0),
            alignment: new pc.Vec2(0.5,0.5),
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
        });

        function CreateTerrainEditingslider(args){
            const slider = UI.createSlider({
                labelText:args.key,
                width:150,
                height:40,
                sliderWidth:100,
                sliderIndicatorWidth:7,
                sliderHeight:6,
                maxVal:args.maxVal,
                minStep:args.minStep,
                precision:args.precision || 2,
                onChangeFn:(val)=>{
                    // TODO: Post transition to new architecture, reconnect terrain links 
                    // const curTer = this.#RealmData.currentLevel.terrain;
//                    curTer.data[args.key] = val;
//                    curTer.RegenerateWithDelay();
               },
            });
            return slider;
        }


        // Create the TerrainTools; they are added to UI and no longer referenced in code
        // We keep a reference to this.#TerarinTools because later, we will udpate the tool state when a terrain is loaded.
            // relies on terrain tools keys having same name as terrain data keys

        // TODO: make this grouped e.g. this.terrainTools ={}
        this.#TerrainTools.dimension = CreateTerrainEditingslider({key:'dimension',maxVal:128,minStep:1});
        this.#TerrainTools.resolution = CreateTerrainEditingslider({key:'resolution',maxVal:1.0,minStep:.001,precision:3});
        this.#TerrainTools.seed = CreateTerrainEditingslider({key:'seed',maxVal:1.0,minStep:.001,precision:3});
        this.#TerrainTools.size= CreateTerrainEditingslider({key:'size',maxVal:256,minStep:10});
        this.#TerrainTools.heightScale = CreateTerrainEditingslider({key:'heightScale',maxVal:4,minStep:0.02});
        this.#TerrainTools.heightTruncateInterval = CreateTerrainEditingslider({key:'heightTruncateInterval',maxVal:2,minStep:0.01});

        Object.keys(this.#TerrainTools).forEach(key=>{
            // addChild them to gui so they show up
            this.#editTerrainScreen.addChild(this.#TerrainTools[key].group);
        });

        // Map icon in bottom left allows for terrain selection / addition menu
        this.#changeMapBtn = UI.SetUpItemButton({
            parentEl:this.#mapPanel,
            width:60,height:60,
            textureAsset:assets.textures.ui.builder.changeMapBtn,
            anchor:[0.92,0,0.92,0],
            pivot:[0.5,0],
            mouseDown:function(){realmEditor.toggle('mapScreen')},
            cursor:'pointer',
        });

        // Save icon
         this.#saveBtn = UI.SetUpItemButton({
            parentEl:this.#mapPanel,
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
            parentEl:this.#mapPanel,
            width:60,height:60,
            anchor:[0.885, 0.76, 0.925, 0.8],
            pivot:[0.5,0],
            mouseDown:function(){this.OpenLoadRealmUI();}, //console.log("Save");},//this.#SetMode(RealmBuilderMode.MapScreen);},
            cursor:'pointer',
            textureAsset:assets.textures.ui.builder.load,
        });

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
        loadLevelBackboard.element.on('mousedown',function(){ this.CloseLoadRealmUI(); }); // Close screen if click background
        
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
            onClickFn:function(){this.CloseLoadRealmUI();}});


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
            mouseDown:function(){this.CloseLoadRealmUI();realmEditor.NewRealm();}
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
 
        this.#changeMapScreen = new pc.Entity("changemap");
        this.#changeMapScreen.addComponent('element',{
            type:'image',
            textureAsset: assets.textures.ui.builder.changeMapBg,
            anchor:[0.52,0.52,0.52,0.52],
            pivot:[0.5,0.5],
            height:420,
            width:500,
            opacity:1,
            useInput:true
            }); // not sure why x-max-anchor needs to be 0.7 here and not 1.0, but 1.0 pushes it beyond the parent width somehow
        this.#mapPanel.addChild(this.#changeMapScreen);
      
        UI.AddCloseWindowButton({
            parentEl:this.#changeMapScreen,
            onClickFn:function(){realmEditor.SetMode('normal'); }});

        this.#changeMapScreenLayout = new pc.Entity();
        this.#changeMapScreenLayout.addComponent("element", {
            type: "image",
            anchor: [0.5,0.5,0.5,0.5],
            pivot: [0.5, 0.5],       
            width:380,
            height:340,
            color:pc.Color.WHITE,
        });
        this.#mapIcons = []; // need to clear these each time we open terrain.

        this.#changeMapScreenLayout.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_HORIZONTAL,
            spacing: new pc.Vec2(10, 10),
            // fit_both for width and height, making all child elements take the entire space
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
            // wrap children
            wrap: true,
        });

        this.#changeMapScreen.addChild(this.#changeMapScreenLayout);
        this.#changeMapScreen.enabled=false;


        this.popUpEditItemTray = this.CreatePopUpEditItemTray({realmEditor:this.realmEditor});
        this.#screen.enabled = false;

        this.#screen.addChild(this.#customCursorIcon); // if I add this too early, it doesn't show up due to hierarchy, overwritten by map

 

    }
    
    CreatePopUpEditItemTray(args={}){
        const { realmEditor } = args;
        // Define pop-up gui for editing itmes.
        const popUpEditItemTray = new pc.Entity('Parent');
        popUpEditItemTray.addComponent('element', {
            layers: [pc.LAYERID_UI],
            type: 'group',  // This makes it a UI element
            anchor: [0.5,0.5,0.5,0.5],
            pivot: [0.5, 0.5],
            margin: [this.leftMargin, 0, 0, 0],
            width: 320, 
            height: 360, 
        });
        this.#screen.addChild(popUpEditItemTray);
        popUpEditItemTray.element.margin = new pc.Vec4(this.leftMargin,0,0,0);

        const editableItemMenu = new pc.Entity("eidtablemenu");
        editableItemMenu.addComponent("element", {
            type: pc.ELEMENTTYPE_GROUP,
            layers:[pc.LAYERID_UI],
            anchor: [0.0, 0.95, 0.5, 0.05], // [ left, top, ?, ? 
            pivot: [0.5, 0.5],
            // the element's width and height dictate the group's bounds
            width: 320,
            height: 360,
        });


        this.#editableItemBackboard = new pc.Entity("inv");
        this.#editableItemBackboard.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            width: 320,
            height: 360,

            textureAsset: assets.textures.ui.builder.editItemBackboard,
        });

        popUpEditItemTray.addChild(this.#editableItemBackboard);
        popUpEditItemTray.addChild(editableItemMenu);
//        realmEditor.SetEditableItemMode(EditableItemMode.Editing); // TODO: Eytan, how pass thru realmeditor to set this mode?

        // Define a circle of buttons for various actions like copy, delete
        let points = Utils.GetCircleOfPoints({degreesToComplete:360,radius:100,scale:100});
        this.#circleButtons = []; // we'll access RealmBuilder by index later.
        points.forEach(point=>{
            const el = new pc.Entity("el");
            el.addComponent('element',{
                type: pc.ELEMENTTYPE_IMAGE,
                anchor:[.5,.5,.5,.5],
                pivot:[.5,.5],
                width:50,
                height:50,
                textureAsset: assets.textures.ui.numberSpherePos,
            })
            popUpEditItemTray.addChild(el);
            this.#circleButtons.push(el);
            const offCenter = 20;
            el.setLocalPosition(new pc.Vec3(point.x,point.y+offCenter,0));
        });

        
        // Set up MOVE
        // Pop up tray should be its own class?
        /// Eytan - this is the example mentioned in realmEditor constructor for new GUI();
        // need to bind this button to realmEditor.editItemMode.action
        // this.moveButton.element.on('mousedown',function(){ })
        this.moveButton = UI.SetUpItemButton({
            parentEl:this.#circleButtons[0],
            width:30,height:30,textureAsset:assets.textures.ui.builder.moveItem,
            mouseDown:function(){realmEditor.BeginDraggingObject(realmEditor.editingItem);}
        });


        // Set up Rotate Left button
        UI.SetUpItemButton({
            parentEl:this.#circleButtons[3],
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemLeft,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){realmEditor.RotateEditingItem(-45);}
        });

        // Set up Rotate Right button
        UI.SetUpItemButton({
            parentEl:this.#circleButtons[3],
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemRight,
            anchor:[.8,.5,.8,.5],
            mouseDown:function(){realmEditor.RotateEditingItem(45);}
        });

        popUpEditItemTray.enabled = false;
        return popUpEditItemTray;

    }

    OpenLoadRealmUI(){
//        this.SetMode(RealmBuilderMode.LoadRealmScreen);
//        callback = (realms)=>{RealmBuilder.PopulateRealmList(realms)};
//        loginWeb.GetLevels(callback);

    }
 
    CloseLoadRealmUI(){

    }


    CreateRealmInfoScreen(){
        // Add (custom) Terrain builder panel screen
        const realmInfoScreen = new pc.Entity();
        realmInfoScreen.addComponent('element',{
            type:'image',
            anchor:[0.5,0.5,0.5,0.5],
            pivot:[0.5,1],
            height:330,
            width:150,
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
        //        RealmBuilder.realmNameText = inputGroup.inputText; // why?

        return realmInfoScreen;

    }

    setHandPanCursor(){
        this.#customCursorIcon.enabled = true;
        this.#customCursorIcon.element.textureAsset = assets.textures.ui.icons.hand,
        this.#customCursorIcon.element.width = 50;
        this.#customCursorIcon.element.height= 50;
        pc.app.graphicsDevice.canvas.style.cursor = 'none';
    }

    setNormalCursor(){
       this.#customCursorIcon.enabled = false;
       pc.app.graphicsDevice.canvas.style.cursor = 'auto';

    }

    update(dt){
        const canvas = pc.app.graphicsDevice.canvas;
        let x = Mouse.x/canvas.width;
        let y = Mouse.y/canvas.height;
        this.#customCursorIcon.element.anchor = new pc.Vec4(x, y, x, y);


    }

}


