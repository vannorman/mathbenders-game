/*
### SCRIPT MANAGER
- singular hub where (almost) all scripts live (some still live in playcanvasInitializer)
- fires groups of scripts in specific order including dependency, singeltons, and instances
*/


var ScriptManager = {
    ScriptType : {
        Plain : "Plain",
        Playcanvas : "Playcanvas",
        Module : "Module"
    },
    dependencyScripts : [
        "/static/lib/playcanvas.js",// -stable.js",
        // "https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.1/socket.io.min.js",
    ],
    gameManagementScripts : [
        // "Plain" script type
        // These scripts do not live on any entity and are all singletons or utilities
         "/static/js/mouse.js", 
         "/static/js/animationManager.js", 

        "/static/js/playcanvasExtensions/extensions.js", 
        "/static/js/utils/extensions.js",
        "/static/js/utils/glb-utils.js",
        "/static/js/javascriptExtensions.js",
        "/static/js/utils/noise.js",
        "/static/js/utils/marchingCubes.js",
        "/static/js/utils/perlin.js",
        "/static/js/utils/math.js",
        "/static/js/utils/jsonUtil.js",
        "/static/js/imprint.min.js",
        "/static/js/playerNameGenerator.js",
        "/static/js/audio.js", 
        "/static/js/fx.js", 
        "/static/js/castleArchitecture.js",
        "/static/js/shaders/outline-post-effect.js", // used in editor to highlight selected items
        "/static/js/shaders/outline-post-process.js", // used in game to outline everything
//        "/static/js/shaders/posteffectExample.js",
        "/static/js/shaders/toonOutlineShader.js",
//        "/static/js/shaders/claudeFogOutlineShader.js",

        "/static/js/shaders.js",
        "/static/js/terrain3d.js",
        "/static/js/terrainGenerator.js",
        "/static/js/network.js",
        "/static/js/utils/utils2.js",
        "/static/js/utils/physics.js",
        "/static/js/utils/ui-input-library.js",
        "/static/js/utils/ui-input-field.js",
        
        "/static/js/utils/UI.js",
         "/static/js/assetRegistry.js", 
        "/static/js/constants.js",
        "/static/js/utils/util.js",
        // "/static/js/utils/ammoDebugDrawer.js",
        "/static/js/utils/debugPhysics.js",
         "/static/js/shaders/groundFogShader.js",
         "/static/js/cameras.js", 
         "/static/js/playerController.js", 
         "/static/js/player/messenger.js",
         //"/static/js/player/inventory/base.js", 
         "/static/js/debug.js", 
         "/static/js/game.js", 
          "/static/js/cheats.js", 
         "/static/js/tests.js", 

    ],
    entityScripts : [
        // "PlayCanvas" script type
        // should (probably) exist only attached to entities / instances in the game
        // requires "pc.app.assets.loadFromUrl" with a promise return to ensure proper load order
        "/static/js/matchPos.js",
        "/static/js/utils/fpsMeter.js",
        "/static/js/fraction.js",
        "/static/js/creatureSpikey.js",
        "/static/js/screenFadeBlack.js",
        "/static/js/collisionDetector.js",
        "/static/js/machineNumberWall.js",
        "/static/js/destroyAfterSeconds.js",
        "/static/js/explodeOnImpact.js",
        "/static/js/numberInfo.js",
        "/static/js/constantForce.js",
        "/static/js/followTarget.js",
        "/static/js/nogravity.js",
        "/static/js/machineNumberFaucet.js",
        "/static/js/btnStates.js",
        "/static/js/lightningGenerator.js",
        "/static/js/alwaysFaceCamera.js",
        "/static/js/rigidbodySleep.js",
        //"/static/js/networkObjectInfo.js",
        "/static/js/machineHoop.js",
        "/static/js/machinePortal.js",
        "/static/js/machineCrossingDetector.js",
        "/static/js/thirdPersonController.js",
        "/static/js/cameraWallHandler.js",
        "/static/js/recordPosition.js",
        "/static/js/portalGeometry.js",
        "/static/js/portal.js",
        // "/static/js/terrainCollider.js",
        "/static/js/portalCameraRenderTexture.js",
        "/static/js/mirror.js",
        "/static/js/fx/sinePopIn.js",
        "/static/js/fx/sinePop.js",
        "/static/js/fx/sinePulsate.js",
//        "/static/js/gfx/toon.js",

      ],
    moduleScripts : [
//          "/static/js/charlie/gui/builderPanel.js", 
//          "/static/js/charlie/gui/base.js", 
//          "/static/js/charlie/camera.js", 
//          "/static/js/charlie/placedItem.js", 
         "/static/js/templates/properties.js", 
         "/static/js/templates/templates.js", 
         "/static/js/templates/creatures/spikey.js", 
          "/static/js/realmEditor/realmEditor.js", 

          "/static/js/player/inventory/base.js",
          "/static/js/player/player.js",
        ],
    loaderScripts : [
        "/static/js/startup/applicationLoader.js",
    ],
    Init(){
        this.LoadDependencyScripts();
        this.LoadApplicationLoader();
        this.loadNext();
    },
    LoadDependencyScripts(){
        ScriptManager.dependencyScripts.forEach(x => this.addScript(x,ScriptManager.ScriptType.Plain));
    },
    LoadPlaycanvasScripts(){
        ScriptManager.entityScripts.forEach(x => this.addScript(x,ScriptManager.ScriptType.Playcanvas));
    },
    LoadGameScripts(){
        ScriptManager.gameManagementScripts.forEach(x => this.addScript(x,ScriptManager.ScriptType.Plain));
    },
    LoadModules(){
        ScriptManager.moduleScripts.forEach(x => this.addScript(x,ScriptManager.ScriptType.Module));
    },
    LoadApplicationLoader(){
        ScriptManager.loaderScripts.forEach(x => this.addScript(x,ScriptManager.ScriptType.Module));

    },
    queue: [],
    addScript: function(path,scriptType=ScriptManager.ScriptType.Plain) {
        this.queue.push({path:path,type:scriptType});
    },
    index : 0,
    loadNext: function() {
        if (this.queue.length > 0){
            let obj = this.queue.shift();
            //console.log("Script manager loaded: "+(++this.index)+" "+obj.path.substr(obj.path.length - 15))
            switch(obj.type){
                case ScriptManager.ScriptType.Module:
                    var script = document.createElement('script');
                    // let p = obj.path; 
                    script.src = obj.path;
                    script.type = 'module';
                    script.onload = () => {
                        //console.log("%c L:"+obj.path.split('/').pop(), 'color:cyan');
                        ScriptManager.loadNext();
                    };

                    // Append the script to the body
                    document.head.appendChild(script);
                    break;
                 case ScriptManager.ScriptType.Plain:
                    var script = document.createElement('script');
                    let scr = obj.path; 
                    script.src = obj.path;
                    script.onload = () => {
                        //console.log("%c L:"+obj.path.split('/').pop(), 'color:cyan');
                        ScriptManager.loadNext();
                    };

                    // Append the script to the body
                    document.head.appendChild(script);
                    break;
                case ScriptManager.ScriptType.Playcanvas:
                    this.loadPlaycanvasScript(obj.path, function(){
                    //console.log("%c L:"+obj.path.split('/').pop(), 'color:#99f');
                        ScriptManager.loadNext();
                    });
                    break;
            }
        }
    },
    loadPlaycanvasScript(url,callback) {
        return new Promise((resolve, reject) => {
          pc.app.assets.loadFromUrl(url, 'script', function(err, asset) {
            if (err) {
                console.log("%c ERROR LOADING:"+url,"color:red");
              reject(err);
            } else {
              resolve(asset);
              callback();
            }
          });
        });
      },
   async AppLoaded(){
        ScriptManager.LoadPlaycanvasScripts();
        ScriptManager.LoadGameScripts();
        ScriptManager.LoadModules();

        ScriptManager.loadNext();
    },

}

ScriptManager.Init();


// If you want to load scripts one by one
//ScriptManager.loadNext(); //jq
//setTimeout(function(){
//    $(document).on("keydown", function (e) {
//     
//     if (e.code == "KeyN"){
//        ScriptManager.loadNext();
       // }
//    });
//   },2000);


