GameState = Object.freeze({
    None : 'None',
    RealmBuilder : 'RealmBuilder',
    Playing : 'Playing',
});
 
class GameManagerClass {
    // tODO: Use a game namespace such as Game.GameManager then window.GameManager = new Game.GameManager
    constructor(){
        this.state = GameState.None;
        this.listeners = [];
    }
    setState(state){}

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.notifyListeners();
        }
    }

    notifyListeners() {
        this.listeners.forEach(({ listener, callback }) => {
         //   console.log("calling "+callback+" on  "+listener);
            callback.call(listener, this.state);
        })
    }

    subscribe(listener, callback) {
        this.listeners.push({ listener, callback });
    }

    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    } 
}

window.GameManager = new GameManagerClass();

var myTemplates = {}; // stores prefabs
var Game = {
    Mode : {
        Normal : 'Normal',
        Playing : 'Playing',
        InGameGui : 'InGameGui',
    },
   sun : null,
    get sunDir() {
        return Game.sun.up;
    },
    
    Instantiate : {}, 
    templateIcons : {}, 
    
    GameState : {
        PreStart : "PreStart",
        Running : "Running"
    },
    currentState : "PreStart", // DISLIKE!! 

   async LoadGame(){

        await CreateTemplates();

        const light = new pc.Entity("Sun (DirectionalLight)");
        light.addComponent("light", {
            type: "directional",
            color: new pc.Color(1, 1, 1),
            castShadows: true,
            shadowBias:0.5,
            shadowResolution:2048,
        });
        
        light.setLocalEulerAngles(45, 30, 0);
        Game.sun = light;
//        Game.sunDir = -light.up;
        pc.app.root.addChild(light);



//        Levels.CreateSpaceship();
        pc.app.systems.rigidbody.gravity.set(0, -25, 0); // -20 seems to work better than default -9.8 

        // Create core objects
        window.Mouse = new MouseClass();
        Game.currentState = Game.GameState.Running;
        
        // window.Player = new PlayerClass({startingPosition:new pc.Vec3(0,20,0)}); // Module, so now handled in /player/player.js


        // let fpsMeter = new DebugFps();
        let uiCam = new UiCamera();
        let skyCam = new RealmBuilderCamera();
        // let axis = new DebugAxis();

        // Bootstrapped starting area (temporary) -- Platform for player to stand.
        let cubeP = new pc.Vec3(0,18,0);
        let c =Utils.Cube({position:cubeP,scale:new pc.Vec3(13,0.5,30)});
        ApplyTextureAssetToEntity({textureAsset:assets.textures.chess,entity:c,scaleTexture:true});
        Game.c = c; // Player relies on the position of the starting platform; boostrap; awkward
        GameManager.setState(GameState.Playing);

    },

    printLoadTime(color,message){
        var loadTime = Date.now() - Game.startTime; 
        console.log("%c LOADED: "+loadTime+" "+message,"color:"+color);
        //window.performance.timing.domContentLoadedEventEnd- window.performance.timing.navigationStart;

    },
    startTime : Date.now(),
      
}



async function CreateTemplates(){

    // TODO Eytan - confusing logic split here bewteen Prefabs and the Templatize funciton, with lots of conditionals for type of asset and features

    Game.templatize = function(options={}){

        const { 
            hasEmptyParent=false, 
            emptyParentOffset=pc.Vec3.ZERO, 
            primitiveType, 
            scale3=pc.Vec3.ONE, 
            asset, 
            scale=1, 
            extraFn=null, 
            icon 
        } = options; // bundling primitve and non-primitive options for brevity

        const isPrimitive = options.isPrimitive == undefined ? false : options.isPrimitive;
        let templateName = "None Yet";
        try {templateName = options.templateName == undefined ? asset.name : options.templateName;}
        catch {templateName = "fail"}
//        console.log("loading:"+templateName);

        if (icon != undefined) {
            Game.templateIcons[templateName] = icon;
        }
        
        // Primitive options: primitiveType, scale3, name (builds from primitive)
        // non-primitives: asset, scale, extraFn (requires a glb asset)
        if (isPrimitive){
            const entity = new pc.Entity(templateName);
            if (primitiveType != undefined) entity.addComponent("render", {  type: primitiveType });  // undefined primitive type returns an empty object.
            entity.setLocalScale(scale3);
            entity.addComponent('script');
            pc.app.root.addChild(entity); 
            myTemplates[templateName] = entity;
            myTemplates[templateName].enabled = false;
        } else {
            myTemplates[templateName] = asset.resource.instantiateRenderEntity();
            myTemplates[templateName].addComponent('script');
            myTemplates[templateName].setLocalScale(pc.Vec3.ONE.clone().mulScalar(scale));
            myTemplates[templateName].enabled = false;
        }

        if (hasEmptyParent){
            const emptyParent = new pc.Entity();
            pc.app.root.addChild(emptyParent);
            myTemplates[templateName].enabled = true;
            emptyParent.addChild(myTemplates[templateName]);
            myTemplates[templateName].setLocalPosition(emptyParentOffset);
            myTemplates[templateName] = emptyParent;
            emptyParent.addComponent('script');
            emptyParent.enabled = false;
        }


        
        Game.Instantiate[templateName] = function(options={}){
            const {
                rigidbodyType,
                rigidbodyVelocity=pc.Vec3.ZERO,
                position=pc.Vec3.ZERO,
                rotation=pc.Vec3.ZERO,
                //scale=pc.Vec3.ONE, // note, we don't set scale when instantiating .. scale is preset by the prefab and may not equal one.
                gfxOnly=false,
                noCollision=false,
                enabled=true
            } = options;
            const clone = myTemplates[templateName].clone();
            clone.name = templateName;
            pc.app.root.addChild(clone);
            clone.moveTo(position,rotation);
            if (typeof extraFn === 'function') {
                extraFn(clone,asset,options); // note that primitives will be sent an undefined 2nd arg for asset here. 
            }

            // Special case to check for NumberInfo, dislike; would rather GetProps and SetProps regardless of type
            if (options.numberInfo && clone.script?.numberInfo){
                // TODO: with new flow is NumberInfo options captured by objectProperties.getProperties?
                clone.script.numberInfo.setProperties(options);
            }
            if (gfxOnly){
                Utils.stripObjToGfxOnly(clone);
            }
            if (noCollision){
                clone.removeComponent('collision');
            }
            if (clone.rigidbody && rigidbodyType == pc.RIGIDBODY_TYPE_DYNAMIC){
                clone.rigidbody.linearVelocity = rigidbodyVelocity;
                // console.log('vel:'+rigidbodyVelocity);
            }
            clone.enabled = enabled;
//            console.log('inst:'+templateName);

            // Save object properties for when we deal with object later, e.g. in Inventory.
            const properties = {templateName : templateName}
            clone.script.create('objectProperties', {attributes:{ objectProperties:properties,  }}) // shouldn't this already b in the template?
            //Game.c=clone;
            return clone;

        }

        // There's a fundamental difference between game.assetCreate for setup / procedural, vs game.assetCreate for network actions.
        // One (startup / procedural creation) will already be present on all machines, and you don't want to duplicate it.
        // the other (creation at runtime) needs to be tracked during the Network

        // Futhermore, consider the case of a button that creates or destroys or modifies a game object.
        // Should that creation/modification action itself be networked? Or simply the creation/modification events that result?
        // Could get game into conflicting state where one client thinks x happened, but another client thinks y.

        // One way to do this is to have button bound directly to networked creation events.

    }

    Game.addMeshCollider = function(clone,asset,rbType){
        //console.log("a:"+clone.name+", asset:"+asset);
//        let colEnt = clone.findComponent('render').entity; // assumes only one render per asset
//        colEnt.addComponent('collision' ,{type:'mesh',renderAsset:asset.resource.renders[0]}); 
//        colEnt.addComponent( 'rigidbody',{type:rbType});
//        clone.addComponent('rigidbody',{type:rbType}); // won't add twice to same obj
//        return colEnt.collision;
    }

//    Prefabs.TemplatizePrefabs(); 
}


(()=>{ 
    const assetListLoader = new pc.AssetListLoader(
        Utils2.getFlatObjectValues(assets),
        pc.app.assets
    );
    Game.printLoadTime('green',"game.js start load assets");
    assetListLoader.load(() => { 
        Game.printLoadTime('red',"game.js assets done");
        Game.LoadGame(); 

    }); 
    $('#loading').hide();
})()
