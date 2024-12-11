class BuilderPanel {
    // The left-hand UI of the RealmBuilder has a panel selection for different categories.
    constructor(args = {}) {
        var { 
            name = "Unnamed", 
            items = [],
            panel = null, 
            navButton = null,
            logoPanelWidth = 80,
        } = args;

        this._name = name;
 
        panel = this.CreateBuilderPanel(name);
        items.forEach(item => {
            const itemIcon = this.CreateBuilderObjectIcon({templateName:item.templateName,textureAsset:item.textureAsset})
            panel.addChild(itemIcon);
        });
        navButton = this.AddNav({text:name,width:logoPanelWidth});
        const _this = this;
        navButton.element.on('click',function(){
            _this.select();
//            RealmBuilder.SelectNav(_this);//{button:navButton,panel:panel});
        });
        this._panel = panel;
        this._navButton = navButton;
        this._items = items;
        
   }

    disable() { this.panel.enabled=false;}
    enable(){ this.panel.enabled=true;}

    select(){
        RealmBuilder.BuilderPanels.forEach(x=>{x.disable()});
        this.enable();
        RealmBuilder.navList.children.forEach(x=>{
            if (x.element) {
                x.element.useInput=true;
                x.element.opacity=0;
                x.element.isSelected=false;
                x.children[1].element.color = pc.Color.WHITE; // awkward text element ref
            }
        })
        const button = this.navButton;  
        button.element.useInput=false;
        button.element.isSelected=true;
        button.children[1].element.color = pc.Color.BLACK; // awkward text element ref
        button.element.opacity=1;
    }

    CreateBuilderPanel(name){
        const builderObjectLayout = new pc.Entity(name);
        builderObjectLayout.addComponent("element", {
            type: "image",
            anchor: [0.025,0.9,1,0.1],
            pivot: [0.5, 0.5],       
            margin: [0, 0, 0, 0],
        });
        builderObjectLayout.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_HORIZONTAL,
            spacing: new pc.Vec2(10, 10),
            // fit_both for width and height, making all child elements take the entire space
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
            // wrap children
            wrap: true,
        });
        RealmBuilder.builderObjectIconsPanel.addChild(builderObjectLayout);
        return builderObjectLayout;
    }


    CreateBuilderObjectIcon(options){
        // UI Helper Method
        const {textureAsset, templateName, text} = options;

        // create a ui square
        const child = new pc.Entity("childe");
        child.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            opacity:0.4,
            width:70,
            height:70,
            useInput:true,
        });

        child.addComponent("layoutchild", {
            excludeFromLayout: false,
        });

        // add a child image with the texture asset for this icon
        const childImage = new pc.Entity("ui child");
        let i=0;
        const r = Math.sin(i * 0.6) * 0.5 + 0.5;
        const g = Math.sin(i * 0.6 + 2.094) * 0.5 + 0.5;
        const b =  Math.sin(i * 0.6 + 4.188) * 0.5 + 0.5;
        childImage.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width:64,
            height:64,
            type: 'image',
            textureAsset: textureAsset,
            useInput: true,
            layer: pc.LAYERID_UI,
        });
        child.addChild(childImage);
        UI.HoverColor({element:childImage.element});

        // add a text element
        const textElement = new pc.Entity('Text');
        textElement.addComponent('element', {
            type: 'text',
            text: text,
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            autoFitWidth:true, // not work
            autoFitHeight:true, // not work
            fontSize : 12,
            color: new pc.Color(0,0,0), // 
            width: 50,
            height: 100,
            pivot: new pc.Vec2(0.5, 2.0), // Center pivot
            anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5), // Center anchor
        });
        childImage.addChild(textElement);
        
        childImage.element.on('mousedown',function(){
            RealmBuilder.BeginDraggingNewObject({templateName:templateName,iconTextureAsset:textureAsset});
        }); 
        childImage.name = "child image:"+templateName;

        // save it for later
        const guiItemProperties = {entity:childImage,textElement:textElement,templateName:templateName,textureAsset:textureAsset};
        RealmBuilder.guiButtons.push(guiItemProperties);

        return child; 
    }

    AddNav(options={}){
        const { text, width } = options;
        const navA = new pc.Entity("nava"); // button
        navA.addComponent('element', {
            type:'image',
            anchor:[0,0,0,0], // dislike; this SHOULD be centered, 
            height:18,
            useInput:true,
            color:new pc.Color(1,1,1),
            opacity:0,
            alignment:[0.5,0.5],

        });
        Game.n=navA.element;
        const textA = new pc.Entity('Text'); // text
        textA.addComponent('element', {
            type: 'text',
            text: text,
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : 12,
            color:pc.Color.WHITE,
            alignment:[0.5,0.5],
            anchor:[0.5,0.5,0.5,0.5],
        });
//        setTimeout(function(){textA.element.pivot=[0.5,0.5]},3000);
        Game.t=textA.element;
        UI.HoverColor({element:navA.element,opacityOn:1,opacityOff:0,cursor:'pointer',useSelectedState:true});
        navA.element.on('mouseenter',function(){if (!navA.element.isSelected) textA.element.color=pc.Color.BLACK;})
        navA.element.on('mouseleave',function(){if (!navA.element.isSelected) textA.element.color=pc.Color.WHITE;})
        navA.addChild(textA); 
        RealmBuilder.navList.addChild(navA);
        textA.element.pivot=[0.5,0.5];
        return navA;
 
    }

    get name() { return this._name; }
    set name(value) { this._name = value; }
    get items() { return this._items; }
    set items(newItems) { this._items = newItems; }
    addItem(templateName, textureAsset) { this._items.push({ templateName, textureAsset }); }
    get panel() { return this._panel; }
    set panel(value) { this._panel = value; }
    get navButton() { return this._navButton; }
    set navButton(value) { this._navButton = value; }
}


var RealmBuilderUI = {
    BuildUIElements(){
        
        const gui = new pc.Entity("gui");
        RealmBuilder.screen = gui;
        gui.addComponent("screen", {
            layers:[pc.LAYERID_UI],
            referenceResolution: new pc.Vec2(Constants.Resolution.width,Constants.Resolution.height),
            scaleBlend: 1.0,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true,
        });
        pc.app.root.addChild(RealmBuilder.screen);

        // Add an empty element to the "map" part of the screen. This will let the app know if the mouse cursor is over this part of screen
        RealmBuilder.mapPanel = new pc.Entity("mappanel");
        RealmBuilder.mapPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 1, 1],   
            pivot: [0, 0],
            width: 1,
            height: 1,
            margin: [RealmBuilder.leftMargin, 0, 0, 0],
            opacity:1,
        });

        gui.addChild(RealmBuilder.mapPanel);


        // Define panels where the builder icons go.
        // Assuming you have a 2D screen entity already in your scene
        var builderPanel = new pc.Entity("builderpanel");
        builderPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 0, 1],    // Stretch vertically, align to left
            pivot: [0, 0.5],         // Pivot at the left center
            width: RealmBuilder.leftMargin,               // 
            height: 1,               // Set height as 1 to use screen height
            // color: pc.Color.RED,//new pc.Color(.6,.6,.6),
            textureAsset: assets.textures.ui.builder.orangeFade,
            useInput: true           // Enable input for mouse events if needed
        });

        gui.addChild(builderPanel);

        // Create the second image (positioned 160px from the left, 80px wide, 100% height)
        RealmBuilder.builderObjectIconsPanel = new pc.Entity("builerobjectsiconpanl");
        RealmBuilder.builderObjectIconsPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 1, 1],    // Stretch vertically, anchor to left side
            pivot: [0, 0.5],         // Pivot at the left center
            width: 80,               // Fixed width of 80 pixels
            height: 1,               // Set height as 1 to use screen height
            margin: [82, 0, 0, 0],  // Offset from the left by 160px (80px + 80px gap)
            color: pc.Color.WHITE,
            opacity:1,
            useInput: true           // Enable input for mouse events if needed
        });

        // Create the first image (left, 80px wide, 100% height)
        var logoPanel = new pc.Entity("logopanel");
        logoPanel.addComponent("element", {
            type: "image",
            anchor: [0, 0, 0, 1],    // Stretch vertically, align to left
            pivot: [0, 0.5],         // Pivot at the left center
            width: RealmBuilder.logoPanelWidth,               
            height: 1,               // Set height as 1 to use screen height
            textureAsset: assets.textures.ui.builder.orangeFade,
            useInput: true           // Enable input for mouse events if needed
        });

        var border1 = new pc.Entity("border1");
        border1.addComponent("element", {
            type: "image",
            anchor: [0, 0, 0, 1],    // Stretch vertically, align to left
            pivot: [0, 0.5],         // Pivot at the left center
            width: 2,
            height: 1,               // Set height as 1 to use screen height
            margin: [80, 0, 0, 0],  // doesn't seem to matter lol
            color: new pc.Color(0.1,0.1,0.1),
        });

        var border2 = new pc.Entity("border1");
        border2.addComponent("element", {
            type: "image",
            anchor: [1, 0, 1, 1],    // anchor to left side
            pivot: [0, 0.5],         // Pivot at the left center
            width: 2,               // 
            height: 1,               // Set height as 1 to use screen height
            margin: [RealmBuilder.logoPanelWidth + 2, 0, 0, 0],  // 
            color: new pc.Color(0.1,0.1,0.1),
        });


        // Add logo panel, tray, and border images to the screen
        builderPanel.addChild(logoPanel);
        builderPanel.addChild(border1);
        builderPanel.addChild(RealmBuilder.builderObjectIconsPanel);
        builderPanel.addChild(border2);
        //        gui.addChild(builderItemsPanel);


        RealmBuilder.navList = new pc.Entity("navlsit");
        RealmBuilder.navList.addComponent('element',{
            type:'image',
            anchor:[0,0.5,0,0.5],
            pivot:[0,0.5],
            height:200,
            opacity:0,
            width:RealmBuilder.logoPanelWidth+2,
        }); // not sure why x-max-anchor needs to be 0.7 here and not 1.0, but 1.0 pushes it beyond the parent width somehow
        RealmBuilder.navList.addComponent('layoutgroup',{ 
            orientation: pc.ORIENTATION_VERTICAL, 
            spacing: new pc.Vec2(0, 2), 
            wrap: false,
            widthFitting: pc.FITTING_STRETCH,
            alignment:[0.5,0.6],
        });
        Game.navList=RealmBuilder.navList.element;
         
        logoPanel.addChild(RealmBuilder.navList);
        Game.logoPanel = logoPanel.element;

        // Add buttons to hover over map
        // Map control left/right
        RealmBuilder.mapControlPanel = new pc.Entity("mapControlPanel");
        RealmBuilder.mapControlPanel.addComponent('element',{
            type:'image',
            anchor:[0.5,0,0.5,0],
            pivot:[0.5,0],
            height:30,
            width:70,
            opacity:1,
            useInput:true
            }); // not sure why x-max-anchor needs to be 0.7 here and not 1.0, but 1.0 pushes it beyond the parent width somehow
        RealmBuilder.mapPanel.addChild(RealmBuilder.mapControlPanel);

        // Set up Rotate Map Left button
        UI.SetUpItemButton({
            parentEl:RealmBuilder.mapControlPanel,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemLeft,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){RealmBuilder.RotateCameraRight()},
            cursor:'pointer',
        });

        // Set up Rotate Right button
        UI.SetUpItemButton({
            parentEl:RealmBuilder.mapControlPanel,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemRight,
            anchor:[.8,.5,.8,.5],
            mouseDown:function(){RealmBuilder.RotateCameraLeft()},
            cursor:'pointer',
        });

        RealmBuilder.editTerrainScreen = new pc.Entity();
        RealmBuilder.editTerrainScreen.addComponent('element',{
            type:'image',
            anchor:[0.5,0.5,0.5,0.5],
            pivot:[0.5,0.5],
            height:330,
            width:150,
            opacity:0.5,
            color:pc.Color.GREEN,
        }); 
        
        RealmBuilder.BuilderPanels = []
        const realmInfoPanel = new BuilderPanel({ name:"Realm Info"});
        const realmInfoScreen = RealmBuilderUI.CreateRealmInfoScreen();
        realmInfoPanel.panel.addChild(realmInfoScreen);
        RealmBuilder.BuilderPanels.push(realmInfoPanel);
        RealmBuilder.BuilderPanels.push(new BuilderPanel({ name:"Player", items : [
                    { templateName:Constants.Templates.PlayerStart,textureAsset:assets.textures.ui.builder.start },
                    { templateName:Constants.Templates.Portal,textureAsset:assets.textures.ui.builder.portal },
            ],}))
        RealmBuilder.BuilderPanels.push(
            new BuilderPanel({ name:"Machines", items : [
                    { templateName:Constants.Templates.Multiblaster, textureAsset:assets.textures.ui.icons.multiblaster },
                    { templateName:Constants.Templates.Zooka, textureAsset:assets.textures.ui.icons.zooka },
                    { templateName:Constants.Templates.NumberHoop, textureAsset:assets.textures.ui.icons.hoop },
            ],}));
        RealmBuilder.BuilderPanels.push(
            new BuilderPanel({ name:"Numbers", items : [
                    { templateName:Constants.Templates.NumberFaucet, textureAsset:assets.textures.ui.icons.faucet },
                    { templateName : Constants.Templates.NumberWall, textureAsset:assets.textures.ui.icons.numberWall },
            ],}));
        RealmBuilder.BuilderPanels.push(new BuilderPanel({ name:"Castle", items : [
                    { templateName:Constants.Templates.CastleTurret,textureAsset:assets.textures.ui.icons.turret1 },
                    { templateName:Constants.Templates.CastleWall,textureAsset:assets.textures.ui.icons.wall, },
            ],}));
        const editTerrainPanel = new BuilderPanel({ name:"Terrain"});
        editTerrainPanel.panel.addChild(RealmBuilder.editTerrainScreen);
        RealmBuilder.BuilderPanels.push(editTerrainPanel);
        editTerrainPanel.navButton.element.on('click',function(){
            console.log("select terrain 1");
            const terrainPos = RealmBuilder.RealmData.currentLevel.terrain.entity.getPosition();
            const terrainScale = RealmBuilder.RealmData.currentLevel.terrain.scale;
            RealmBuilder.MoveCamera({source:"click ter",targetPivotPos:terrainPos, targetZoomFactor:terrainScale * 2.2});
            editTerrainPanel.select();

            RealmBuilderUI.UpdateTerrainToolValues();
            

        });

        RealmBuilder.editTerrainScreen.addComponent("layoutgroup", {
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
                    const curTer = RealmBuilder.RealmData.currentLevel.terrain;
                    curTer.data[args.key] = val;
                    curTer.RegenerateWithDelay();
               },
            });
            RealmBuilder.editTerrainScreen.addChild(slider.group);
            return slider;
        }


        // Create the TerrainTools; they are added to UI and no longer referenced in code
        // We keep a reference to RealmBuilder.TerarinTools because later, we will udpate the tool state when a terrain is loaded.
            // relies on terrain tools keys having same name as terrain data keys

        RealmBuilder.TerrainTools = {};
        RealmBuilder.TerrainTools.dimension = CreateTerrainEditingslider({key:'dimension',maxVal:128,minStep:1});
        RealmBuilder.TerrainTools.resolution = CreateTerrainEditingslider({key:'resolution',maxVal:1.0,minStep:.001,precision:3});
        RealmBuilder.TerrainTools.seed = CreateTerrainEditingslider({key:'seed',maxVal:1.0,minStep:.001,precision:3});
        RealmBuilder.TerrainTools.size= CreateTerrainEditingslider({key:'size',maxVal:256,minStep:10});
        RealmBuilder.TerrainTools.heightScale = CreateTerrainEditingslider({key:'heightScale',maxVal:4,minStep:0.02});
        RealmBuilder.TerrainTools.heightTruncateInterval = CreateTerrainEditingslider({key:'heightTruncateInterval',maxVal:2,minStep:0.01});

        // Map icon in bottom left allows for terrain selection / addition menu
        RealmBuilder.changeMapBtn = UI.SetUpItemButton({
            parentEl:RealmBuilder.mapPanel,
            width:60,height:60,
            textureAsset:assets.textures.ui.builder.changeMapBtn,
            anchor:[0.92,0,0.92,0],
            pivot:[0.5,0],
            mouseDown:function(){RealmBuilder.SetMode(RealmBuilderMode.MapScreen);},
            cursor:'pointer',
        });

        // Save icon
         RealmBuilder.saveBtn = UI.SetUpItemButton({
            parentEl:RealmBuilder.mapPanel,
            width:60,height:60,
            anchor:[0.885, 0.86, 0.925, 0.9],
            pivot:[0.5,0],
            mouseDown:function(){
                if (RealmBuilder.mode==RealmBuilderMode.Normal) RealmBuilder.Save();
            }, //console.log("Save");},//RealmBuilder.SetMode(RealmBuilderMode.MapScreen);},
            cursor:'pointer',
            textureAsset:assets.textures.ui.builder.save,
        });

        // Load icon
        RealmBuilder.loadBtn = UI.SetUpItemButton({
            parentEl:RealmBuilder.mapPanel,
            width:60,height:60,
            anchor:[0.885, 0.76, 0.925, 0.8],
            pivot:[0.5,0],
            mouseDown:function(){RealmBuilder.OpenLoadRealmUI();}, //console.log("Save");},//RealmBuilder.SetMode(RealmBuilderMode.MapScreen);},
            cursor:'pointer',
            textureAsset:assets.textures.ui.builder.load,
        });

        // Load screen
        RealmBuilder.loadRealmScreen = new pc.Entity("load level scrn");
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
        RealmBuilder.screen.addChild(RealmBuilder.loadRealmScreen);
        RealmBuilder.loadRealmScreen.addChild(loadLevelBackboard);
        RealmBuilder.loadRealmScreen.enabled=false;
        loadLevelBackboard.element.on('mousedown',function(){ RealmBuilder.CloseLoadRealmUI(); }); // Close screen if click background
        
        RealmBuilder.loadRealmWindow = new pc.Entity();
        RealmBuilder.loadRealmWindow.addComponent('element',{
            type:'image',
            anchor:[0.15,0.15,0.85,0.85],
            pivot:[0.5,0.5],
            color:pc.Color.WHITE,
            opacity:1,
            useInput:true,
 
        });
        RealmBuilder.loadRealmScreen.addChild(RealmBuilder.loadRealmWindow);

        UI.AddCloseWindowButton({
            parentEl:RealmBuilder.loadRealmWindow,
            onClickFn:function(){RealmBuilder.CloseLoadRealmUI();}});


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
        RealmBuilder.loadRealmWindow.addChild(newText);

        // Set up NEW REALM
        UI.SetUpItemButton({
            parentEl:RealmBuilder.loadRealmWindow,
            width:40,height:40,
            textureAsset:assets.textures.ui.builder.newRealm,
            anchor:[0.56, 0.9, 0.56, 0.9],
            cursor:'pointer',
            mouseDown:function(){RealmBuilder.CloseLoadRealmUI();RealmBuilder.NewRealm();}
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
        RealmBuilder.loadRealmWindow.addChild(loadText);
 
        RealmBuilder.changeMapScreen = new pc.Entity("changemap");
        RealmBuilder.changeMapScreen.addComponent('element',{
            type:'image',
            textureAsset: assets.textures.ui.builder.changeMapBg,
            anchor:[0.52,0.52,0.52,0.52],
            pivot:[0.5,0.5],
            height:420,
            width:500,
            opacity:1,
            useInput:true
            }); // not sure why x-max-anchor needs to be 0.7 here and not 1.0, but 1.0 pushes it beyond the parent width somehow
        RealmBuilder.mapPanel.addChild(RealmBuilder.changeMapScreen);
      
        UI.AddCloseWindowButton({
            parentEl:RealmBuilder.changeMapScreen,
            onClickFn:function(){RealmBuilder.SetMode(RealmBuilderMode.Normal);}});

        RealmBuilder.changeMapScreenLayout = new pc.Entity();
        RealmBuilder.changeMapScreenLayout.addComponent("element", {
            type: "image",
            anchor: [0.5,0.5,0.5,0.5],
            pivot: [0.5, 0.5],       
            width:380,
            height:340,
            color:pc.Color.WHITE,
        });
        RealmBuilder.mapIcons = []; // need to clear these each time we open terrain.

        RealmBuilder.changeMapScreenLayout.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_HORIZONTAL,
            spacing: new pc.Vec2(10, 10),
            // fit_both for width and height, making all child elements take the entire space
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
            // wrap children
            wrap: true,
        });

        RealmBuilder.changeMapScreen.addChild(RealmBuilder.changeMapScreenLayout);
        RealmBuilder.changeMapScreen.enabled=false;


        RealmBuilderUI.CreatePopUpEditItemTray();
        RealmBuilder.screen.enabled = false;
    },
    UpdateTerrainToolValues(){
        const td = RealmBuilder.RealmData.currentLevel.terrain.data;
        Object.keys(RealmBuilder.TerrainTools).forEach(key=>{
            // relies on terrain tools keys having same name as terrain data keys
            if (td[key]){
                const val = td[key] / RealmBuilder.TerrainTools[key]._maxVal; 
                RealmBuilder.TerrainTools[key].SetVal({resultX:val,fireOnChangeFn:false});
            }
        });
            

    },
    CreatePopUpEditItemTray(){
        // Define pop-up gui for editing itmes.
        RealmBuilder.editableItemGroup = new pc.Entity('Parent');
        RealmBuilder.editableItemGroup.addComponent('element', {
            layers: [pc.LAYERID_UI],
            type: 'group',  // This makes it a UI element
            anchor: [0.5,0.5,0.5,0.5],
            pivot: [0.5, 0.5],
            margin: [RealmBuilder.leftMargin, 0, 0, 0],
            width: 320, 
            height: 360, 
        });
        RealmBuilder.screen.addChild(RealmBuilder.editableItemGroup);
        RealmBuilder.editableItemGroup.element.margin = new pc.Vec4(RealmBuilder.leftMargin,0,0,0);

        editableItemMenu = new pc.Entity("eidtablemenu");
        editableItemMenu.addComponent("element", {
            // a Layout Group needs a 'group' element component
            type: pc.ELEMENTTYPE_GROUP,
            layers:[pc.LAYERID_UI],
            anchor: [0.0, 0.95, 0.5, 0.05], // [ left, top, ?, ? 
            pivot: [0.5, 0.5],
            // the element's width and height dictate the group's bounds
            width: 320,
            height: 360,
        });


        RealmBuilder.editableItemBackboard = new pc.Entity("inv");
        RealmBuilder.editableItemBackboard.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            width: 320,
            height: 360,

            textureAsset: assets.textures.ui.builder.editItemBackboard,
        });

        RealmBuilder.editableItemGroup.addChild(RealmBuilder.editableItemBackboard);
        RealmBuilder.editableItemGroup.addChild(editableItemMenu);
        RealmBuilder.SetEditableItemMode(EditableItemMode.Editing);

        // Define a circle of buttons for various actions like copy, delete
        let points = Utils.GetCircleOfPoints({degreesToComplete:360,radius:100,scale:100});
        RealmBuilder.circleButtons = []; // we'll access RealmBuilder by index later.
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
            RealmBuilder.editableItemGroup.addChild(el);
            RealmBuilder.circleButtons.push(el);
            const offCenter = 20;
            el.setLocalPosition(new pc.Vec3(point.x,point.y+offCenter,0));
        });

        // Set up MOVE
        UI.SetUpItemButton({
            parentEl:RealmBuilder.circleButtons[0],
            width:30,height:30,textureAsset:assets.textures.ui.builder.moveItem,
            mouseDown:function(){RealmBuilder.BeginDraggingObject(RealmBuilder.editingItem);}
        });

        // Set up Rotate Left button
        UI.SetUpItemButton({
            parentEl:RealmBuilder.circleButtons[3],
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemLeft,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){RealmBuilder.editingItem.rotate(-45);}
        });

        // Set up Rotate Right button
        UI.SetUpItemButton({
            parentEl:RealmBuilder.circleButtons[3],
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemRight,
            anchor:[.8,.5,.8,.5],
            mouseDown:function(){RealmBuilder.editingItem.rotate(45);}
        });

    },
 
    UpdateMapIcons(){
        // When user opens "Change Map" by clicking change map button in bottom right,
        // For each terrain, 
        // create an icon with a picture of the terrain. 
        // Clicking the icon closes map select
        // and teleports you to that terrain.

        // Note that "spaceship" isn't a terrain we build it from Levels and manually add it to Terrains

       RealmBuilder.mapIcons.forEach(x=>{x.destroy();});
       RealmBuilder.mapIcons = [];
        
       RealmBuilder.RealmData.Levels.forEach(level=>{
            const tempCam = new pc.Entity();
            tempCam.addComponent('camera',{
                layers: [pc.LAYERID_SKYBOX, pc.LAYERID_DEPTH,  pc.LAYERID_WORLD ],
                priority:0,
                clearColorBuffer:true,
                clearDepthBuffer:true,
                farClip:15000,
                aspectRatio:RealmBuilder.skyCamAspectRatio,
                aspectRatioMode:1
            });
//            pc.app.root.addChild(tempCam);

            const tempCamPivot = new pc.Entity();
            const pivotOffset = pc.Vec3.ZERO;//new pc.Vec3(25,0,-25).mulScalar(level.terrain.scale / 100);
            tempCamPivot.setPosition(level.terrain.entity.getPosition().add(pivotOffset));
            pc.app.root.addChild(tempCamPivot);
            tempCamPivot.addChild(tempCam);
            tempCam.setLocalEulerAngles(RealmBuilder.cameraDefaultRot);
            let camOffset = tempCam.forward.mulScalar(level.terrain.scale * -2.1);
            tempCam.setLocalPosition(camOffset);

            const tempCamPivotPosition = tempCamPivot.getPosition().clone();
            const icon = UI.SetUpItemButton({
                parentEl:RealmBuilder.changeMapScreenLayout,
                width:60,height:60,

                anchor:[.2,.5,.2,.5],
                mouseDown:function(){
                    RealmBuilder.MoveCamera({source:"changemap",targetPivotPos:tempCamPivotPosition,targetZoomFactor:level.terrain.scale*1.5});
                    setTimeout(function(){ RealmBuilder.SetMode(RealmBuilderMode.Normal);},200); // prevent user double action accident
                    // e.g. double action mouse down change map, close map window, mouse up select item on current map, map change fails.
                    if (RealmBuilder.lastPlacedItem != null ){ // && ThisTerrain.lastItem could be older than OtherTerrain.lastItem but still center there
                        
                    } else {

                    }
                   },
                cursor:'pointer',
            });
            UI.AddCloseWindowButton({
                parentEl:icon,
                onClickFn:function(){
                    var deleteLevel = confirm("Are you sure you want to delete RealmBuilder map?");
                    if (deleteLevel == true) {
                        level.Clear();
                        const levelIndex = RealmBuilder.RealmData.Levels.indexOf(level);
                        RealmBuilder.RealmData.Levels.splice(levelIndex,1);
                        RealmBuilderUI.UpdateMapIcons();
                    }
                }
            });


            RealmBuilder.mapIcons.push(icon);

            var texture = new pc.Texture(pc.app.graphicsDevice, {
                width: 512,
                height: 512,
                format: pc.PIXELFORMAT_R8_G8_B8_A8,
                autoMipmap: true
            });

            // Create a render target
            var renderTarget = new pc.RenderTarget({ colorBuffer: texture, flipY: true, depth: true });
            tempCam.camera.renderTarget = renderTarget;

            // Render once to the texture then scrap the camera
           pc.app.once('postrender', function () {
                icon.element.texture = texture;
                tempCam.destroy();
                tempCamPivot.destroy();
            }.bind(pc)); 


        });

        // Create New Terrain button
        const icon = UI.SetUpItemButton({
            parentEl:RealmBuilder.changeMapScreenLayout,
            width:60,height:60,
            textureAsset:assets.textures.ui.builder.newMap,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){
                // Create new level AND new terrain by GUI interaction

                level = new Level({skipTerrainGen:true});
                RealmBuilder.RealmData.Levels.push(level);
                const newTerrainPos = RealmBuilder.TerrainCentroidManager.getCentroid();
                
                level.terrain = new Terrain({centroid:newTerrainPos,seed:Math.random()});
                level.terrain.generate(); // race condiiton with regenerate() callbacks on TerrainTools change
                RealmBuilder.SetMode(RealmBuilderMode.Normal);
                
                const zoomFactor = 100;
                RealmBuilder.MoveCamera({source:"newmap",targetPivotPos:newTerrainPos,targetZoomFactor:zoomFactor});
                RealmBuilderUI.UpdateTerrainToolValues();

            },
            cursor:'pointer',
        });
        RealmBuilder.mapIcons.push(icon);
    },

   CreateRealmInfoScreen(){
        // Add (custom) Terrain builder panel screen
        RealmBuilder.realmInfoScreen = new pc.Entity();
        RealmBuilder.realmInfoScreen.addComponent('element',{
            type:'image',
            anchor:[0.5,0.5,0.5,0.5],
            pivot:[0.5,1],
            height:330,
            width:150,
            opacity:0.5,
            color:pc.Color.BLUE,
        }); 
        RealmBuilder.realmInfoScreen.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_VERTICAL,
            spacing: new pc.Vec2(-20, 0),
            alignment: [0.5,1],
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
        });

        
        const inputGroup = UI.createInputWithLabel({text:"Name:",onChangeFn:(val)=>{
            RealmBuilder.RealmData.name=val;
        }});

        RealmBuilder.realmInfoScreen.addChild(inputGroup.root);
        RealmBuilder.realmNameText = inputGroup.inputText;

        return RealmBuilder.realmInfoScreen;

 
    },
 


 
}
