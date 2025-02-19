import ChangeMapScreen from './changeMapScreen.js'; 
export default class TerrainGui {
    screen;
    #TerrainTools={};
    #changeMapBtn;
    changeMapScreen;

    // Todo
        // Add secondary "dimension" with exp gain.
        // Add Texture Height Offset
        // Add Terrain Height Offset
        // Add Fog Height Offset (can we see Fog from sky cam?);:



    constructor(args={}){
        const {guiBase}=args;
        this.guiBase = guiBase;
        this.screen = new pc.Entity();
        this.screen.addComponent('element',{
            type:'image',
            anchor:[0.5,0.5,0.5,0.5],
            pivot:[0.5,0.5],
            height:Constants.Resolution.height,
            width:150,
            opacity:0.5,
            color:pc.Color.GREEN,
        }); 

        this.screen.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_VERTICAL,
            spacing: new pc.Vec2(-20, 0),
            alignment: new pc.Vec2(0.5,0.5),
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
        });


        //const realmData = realmEditor.RealmData; 
        // @Eytan is it better to pass realmEditor or realmData reference around rather than acces the global?

        function CreateTerrainEditingSlider(args){
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
                    const curTer = realmEditor.currentLevel.terrain;
                    curTer.data[args.key] = val;
                    curTer.RegenerateWithDelay({realmEditor:realmEditor});
               },
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
        this.#TerrainTools.dimension = CreateTerrainEditingSlider({key:'dimension',maxVal:128,minStep:1});
        this.#TerrainTools.resolution = CreateTerrainEditingSlider({key:'resolution',maxVal:0.2,minStep:.001,precision:3});
        this.#TerrainTools.seed = CreateTerrainEditingSlider({key:'seed',maxVal:1.0,minStep:.001,precision:3});
        this.#TerrainTools.size= CreateTerrainEditingSlider({key:'size',minVal:16,maxVal:512,minStep:10});
        this.#TerrainTools.heightScale = CreateTerrainEditingSlider({key:'heightScale',maxVal:4,minStep:0.02});
        this.#TerrainTools.heightTruncateInterval = CreateTerrainEditingSlider({key:'heightTruncateInterval',maxVal:2,minStep:0.01});
        this.#TerrainTools.textureOffset = CreateTerrainEditingSlider({key:'textureOffset',maxVal:256,minStep:1});
//        this.#TerrainTools.spacer = spacer();
        this.#TerrainTools.resolution2 = CreateTerrainEditingSlider({key:'resolution2',maxVal:0.2,minStep:.001,precision:3});
        this.#TerrainTools.heightScale2 = CreateTerrainEditingSlider({key:'heightScale2',maxVal:4,minStep:.02});
        this.#TerrainTools.exp = CreateTerrainEditingSlider({key:'exp',maxVal:10,minStep:1});

        
        Object.keys(this.#TerrainTools).forEach(key=>{
            // Add them to the screen UI to make each tool visible.
            const group = this.#TerrainTools[key].group;
            if (group) this.screen.addChild(group);
        });

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

        const $this =this;
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
            if (terrainData[key]){
                const val = terrainData[key] / this.#TerrainTools[key]._maxVal; 
                this.#TerrainTools[key].SetVal({resultX:val,fireOnChangeFn:false});
            }
        });
    } 
    


}
