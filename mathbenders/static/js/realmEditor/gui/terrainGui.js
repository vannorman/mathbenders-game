import ChangeMapScreen from './changeMapScreen.js'; 
export default class TerrainGui {
    screen;
    #TerrainTools={};
    #changeMapBtn;
    changeMapScreen;
    width=150;

    // Todo
        // Add "exp" to regular heights
        // Add "exp2" to regular heights (how "flat" do I want overall terrain, don't exp except for extreme values?)
        // 
        // X Add secondary "dimension" with exp gain.
        // X Add Texture Height Offset


        // Add Terrain Height Offset
        // Add Fog Height Offset (can we see Fog from sky cam?);:



    constructor(args={}){
        const {guiBase}=args;
        this.guiBase = guiBase;
        this.screen = new pc.Entity("Terrain screen");
        this.screen.addComponent('element',{
            type:'image',
            anchor:[0,0,1,1],
            pivot:[0.5,0.5],
            margin:[0,0,0,0],
            opacity:0.2,
            color:pc.Color.WHITE,
        }); 

                //const realmData = realmEditor.RealmData; 
        // @Eytan is it better to pass realmEditor or realmData reference around rather than acces the global?

        function CreateTerrainEditingSlider(args){
            const {onChangeFn=(val)=>{
                const curTer = realmEditor.currentLevel.terrain;
                curTer.data[args.key] = val;
                curTer.RegenerateWithDelay({realmEditor:realmEditor});

            }}=args;
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
                onChangeFn:onChangeFn,
            });
            return slider;
        }


        // Create the TerrainTools; they are added to UI and no longer referenced in code
        // We keep a reference to this.#TerarinTools because later, we will udpate the tool state when a terrain is loaded.
            // relies on terrain tools keys having same name as terrain data keys

        function spacer(){
            const obj = {};

            obj.group = new pc.Entity(); 
            obj.group.addComponent('element',{
                type:'image',
                height:12,
                width:80,
                opacity:0,
            }); 
            return obj;
        }

        // TODO: make this grouped e.g. this.terrainTools ={}
        // Global group properties
        function toggleButton(args={}){
            const { menu } = args;
            const tb = new pc.Entity();
            tb.addComponent("element", { 
                type: "image", 
                anchor: [0,0,0,0],
                pivot: [0.5, 0.5], 
                width: 40, 
                height: 40,
                color:pc.Color.GRAY,
                opacity:0.4,
                useInput:true,
            });
           const text = new pc.Entity("text");
            text.addComponent('element', {
                type: 'text',
                text: name,
                color: pc.Color.BLACK,
                anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
                pivot: new pc.Vec2(0.5, 0.5),
                fontSize: 20,
                fontAsset: assets.fonts.montserrat,
            });
            tb.addChild(text);

            // UI.HoverColor({element:tb.element});
            tb.element.on("mousedown", () => {
                text.element.text = menu.enabled ? ">" : "v"
                menu.enabled = !menu.enabled; // Toggle menu visibility
            });

             return tb; 
        }

        const $this =this;
        function uiGroup(name){
            const group = new pc.Entity("global group");
            group.addComponent('element',{
                  type:'image',
                anchor:[0,0,1,1],
                opacity:0.5,
                margin:[0,0,0,0],
                color:pc.Color.BLUE,
            });
            group.addComponent('layoutgroup',{
               orientation: pc.ORIENTATION_VERTICAL,
                spacing: new pc.Vec2(-20, 0),
                alignment: new pc.Vec2(0.5,0.5),
                widthFitting: pc.FITTING_NONE,
                heightFitting: pc.FITTING_NONE,
            });


            return group;
        }

        const tabGroup = new pc.Entity("tabgroup");
        tabGroup.addComponent('element',{
                  type:'image',
                anchor:[0.5,1,0.5,1],
                pivot:[0.5,1],
                height:80,
                width:160,
                opacity:0.8,
                color:pc.Color.CYAN,
           }); 
            tabGroup.addComponent('layoutgroup',{
               orientation: pc.ORIENTATION_HORIZONTAL,
                spacing: new pc.Vec2(0,10),
                alignment: new pc.Vec2(0.5,0.5),
                widthFitting: pc.FITTING_NONE,
                heightFitting: pc.FITTING_NONE,
            });

        this.screen.addChild(tabGroup);
         const globals = uiGroup("Globals");
        // const toggleGlobals = toggleButton({menu:globals});

        const toggleGlobals = UI.SetUpItemButton({
            parentEl:tabGroup,
            width:80,height:30,
            colorOn:pc.Color.GREEN,
            text:"Globals",
            colorOff:pc.Color.BLUE,
            mouseDown:function(){realmEditor.gui.terrain.seconds.enabled=false;realmEditor.gui.terrain.globals.enabled=true;console.log('globals on/off');},
            cursor:'pointer',
        });




        tabGroup.addChild(toggleGlobals);
       this.screen.addChild(globals);
       this.globals=globals;

        this.#TerrainTools.size= CreateTerrainEditingSlider({key:'size',minVal:16,maxVal:1024,minStep:10});
        this.#TerrainTools.dimension = CreateTerrainEditingSlider({key:'dimension',maxVal:128,minStep:1});
        this.#TerrainTools.seed = CreateTerrainEditingSlider({key:'seed',maxVal:1.0,minStep:.001,precision:3});
        this.#TerrainTools.resolution = CreateTerrainEditingSlider({key:'resolution',maxVal:0.2,minStep:.001,precision:3});
        this.#TerrainTools.heightScale = CreateTerrainEditingSlider({key:'heightScale',maxVal:4,minStep:0.02});
        this.#TerrainTools.heightTruncateInterval = CreateTerrainEditingSlider({key:'heightTruncateInterval',maxVal:2,minStep:0.01});
        this.#TerrainTools.textureOffset = CreateTerrainEditingSlider({key:'textureOffset',maxVal:64,minStep:1});
        globals.addChild(this.#TerrainTools.size.group);
        globals.addChild(this.#TerrainTools.dimension.group);
        globals.addChild(this.#TerrainTools.seed.group);
        globals.addChild(this.#TerrainTools.resolution.group);
        globals.addChild(this.#TerrainTools.heightScale.group);
        globals.addChild(this.#TerrainTools.heightTruncateInterval.group);
        globals.addChild(this.#TerrainTools.textureOffset.group);
//        this.#TerrainTools.spacer = spacer();



        const seconds = uiGroup("Seconds");
        const toggleSeconds = UI.SetUpItemButton({
            parentEl:tabGroup,
            text:"Panel2",
            width:80,height:60,
            colorOn:pc.Color.GREEN,
            colorOff:new pc.Color(0,0.8,0),
            anchor:[0.5,0.5,0.5,0.5],
            pivot:[0.5,0],
            mouseDown:function(){
                realmEditor.gui.terrain.seconds.enabled=true;realmEditor.gui.terrain.globals.enabled=false;
                console.log('seconds on/off');},
            cursor:'pointer',
        });
        this.toggleSeconds=toggleSeconds;
        tabGroup.addChild(toggleSeconds);
        this.screen.addChild(seconds);

        this.#TerrainTools.resolution2 = CreateTerrainEditingSlider({key:'resolution2',maxVal:0.2,minStep:.001,precision:3});
        this.#TerrainTools.heightScale2 = CreateTerrainEditingSlider({key:'heightScale2',maxVal:4,minStep:.02});
        this.#TerrainTools.exp = CreateTerrainEditingSlider({key:'exp',maxVal:10,minStep:1});
        const treeChangeFn =(val)=>{
            // console.log('t?'+val);
            realmEditor.placeTrees({numTrees:val})
        }
        this.#TerrainTools.trees = CreateTerrainEditingSlider({onChangeFn:treeChangeFn,key:'trees',maxVal:2000,minStep:1});
        seconds.addChild(this.#TerrainTools.resolution2.group);
        seconds.addChild(this.#TerrainTools.heightScale2.group);
        seconds.addChild(this.#TerrainTools.exp.group);
        seconds.addChild(this.#TerrainTools.trees.group);
        seconds.enabled=false;
       this.globals = globals;
       this.seconds = seconds;
       this.toggleGlobals=toggleGlobals; 
//        Object.keys(this.#TerrainTools).forEach(key=>{
//            // Add them to the screen UI to make each tool visible.
//            const group = this.#TerrainTools[key].group;
//            if (group) this.screen.addChild(group);
//        });

        // Map icon in bottom left allows for terrain selection / addition menu
        this.changeMapBtn = UI.SetUpItemButton({
            parentEl:this.guiBase.mapPanel,
            width:60,height:60,
            textureAsset:assets.textures.ui.builder.changeMapBtn,
            anchor:[0.92,0,0.92,0],
            pivot:[0.5,0],
            mouseDown:function(){realmEditor.toggle('mapScreen')},
            cursor:'pointer',
        });

        this.guiBase.editTerrainPanel.navButton.element.on('click',function(){
            // TODO: Move outside of UI?
            const terrainPos = realmEditor.currentLevel.terrain.entity.getPosition();
            const terrainScale = realmEditor.currentLevel.terrain.scale;
            realmEditor.camera.translate({source:"click ter",targetPivotPosition:terrainPos, targetZoomFactor:terrainScale * 2.2});
//            editTerrainPanel.select();
            $this.UpdateTerrainToolValues('navoncl');

        });

        this.changeMapScreen = new ChangeMapScreen();
        this.guiBase.mapPanel.addChild(this.changeMapScreen.group);


    } 

    UpdateTerrainToolValues(args={}){
        const {terrainData=realmEditor.currentLevel.terrain.data}=args;
        // console.log('update ter val from:'+source);
        Object.keys(this.#TerrainTools).forEach(key=>{
            // relies on terrain tools keys having same name as terrain data keys
            if (key in terrainData){
                const val = terrainData[key] / this.#TerrainTools[key]._maxVal; 
                this.#TerrainTools[key].SetVal({resultX:val,fireOnChangeFn:false});
            } else {
                // console.log("terdatakey not exist:"+key);
            }
        });
    } 
    


}
