var Camera = {
    SwitchCurrentCamera(cam) {
        Camera.main.enabled = false;
        Camera.sky.enabled = false;
        Camera.main.entity.script.groundFogShader.enabled=false;
        Camera.current = cam;
        Camera.current.enabled = true;
        if (Camera.current.entity.script && Camera.current.entity.script.groundFogShader) Camera.current.entity.script.groundFogShader.enabled=true;
    },
};

class PortalCam{
    constructor(args={}){
        // Portals camera
        const portalCam = new pc.Entity();
        portalCam.addComponent('script');
        portalCam.script.create('portalCameraRenderTexture');
        pc.app.root.addChild(portalCam);
        Game.portalCam = portalCam.script.portalCameraRenderTexture.targetCam;
    }
}
        

class UiCamera {
    constructor(args){
        const uiCam = new pc.Entity("UiCamera");
        uiCam.addComponent("camera",{
            layers:[pc.LAYERID_UI],
            projection:1,
            priority:0,
            aspectRatio:Constants.Resolution.aspectRatio
        })
        Camera.ui = uiCam.camera;
        pc.app.root.addChild(uiCam);
    }
}

class PlayerCamera{
    constructor(args={}){
        const { pivot, playerEntity } = args;


        this.entity = new pc.Entity("MainCamera");
        this.self = this.entity.addComponent("camera", {
            layers: [pc.LAYERID_SKYBOX, pc.LAYERID_DEPTH,  pc.LAYERID_WORLD,  pc.LAYERID_UI ],
            priority:2,
            clearColorBuffer:true,
            clearDepthBuffer:true,

            farClip:1500,
            aspectRatio:Constants.Resolution.aspectRatio,
            aspectRatioMode:1
        });
        Camera.main = this.self;
        pc.app.root.addChild(this.entity);
        Camera.current = Camera.main;
        this.entity.addComponent('script');

        this.entity.script.create('groundFogShader');
        const ent = this.entity;
        ent.script.groundFogShader.init({
            cameraEntity:ent,
            playerEntity:playerEntity,
        
        });
//        this.entity.script.groundFogshader.init({
//        });
        // This is where fog gets added as fog is part of this shader.
        // performance


        // ADd text to camera.
        const playerNameCamTextPos = new pc.Vec3(0,-0.3,-3);
//        const camTextPlayerName = Utils.AddText({text:"Server loading ...",parent:mainCam,localPos:playerNameCamTextPos,scale:0.01});
        
        const debugTextPos = new pc.Vec3(-0.4,1.0,-3);
        const debugText = Utils.AddText({color:new pc.Color(1.0,0.8,0.8),text:"debug",parent:this.entity,localPos:debugTextPos,scale:0.015});
        Game.debugText = debugText.element;

//        Game.playerNameElement = camTextPlayerName.element;
        pc.app.root.addChild(this.entity);


        const skyboxCam = new pc.Entity("SkyboxCam");
        skyboxCam.addComponent("camera", {
            layers:[pc.LAYERID_SKYBOX],
            priority:-1
            })
        pc.app.root.addChild(skyboxCam);
        Camera.skybox = skyboxCam;
        pc.app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

        // make our scene prettier by adding a directional light
        // Maybe this should not be handled globally as skyboxes will change with scene portals.
        pc.app.scene.envAtlas = assets.textures.skyboxes.helipad.resource;
        pc.app.scene.toneMapping = pc.TONEMAP_ACES;
        pc.app.scene.skyboxIntensity = 0.7;
        
     
        Camera.main.entity.reparent(pivot);
 
        Camera.main.entity.reparent(pivot);
        Camera.main.entity.addComponent('audiolistener');
        Camera.main.entity.translate(0, 1, 9);
        Camera.main.entity.lookAt(0, 2, 0);
        Camera.main.entity.addComponent('script');
        Camera.main.entity.script.create('cameraWallHandler',{attributes:{camera:Camera.main.entity}});


    }
}
// Player camera
    
class RealmBuilderCamera {
    constructor(args={}){
/*        const skyCam = new pc.Entity("SkyCamera");
        skyCam.addComponent("camera", {
            layers: [pc.LAYERID_SKYBOX, pc.LAYERID_DEPTH,  pc.LAYERID_WORLD,  ],
            projection:0,
//            orthoHeight:20,
            priority:3,
            clearColorBuffer:false,
            clearDepthBuffer:true,
            viewport:[0.5,0.5,1,1],
            farClip:15000,
            aspectRatio:Constants.Resolution.aspectRatio,
            aspectRatioMode:1
        });
        Camera.sky = skyCam.camera;
        Camera.sky.entity.addComponent('script');
        Camera.sky.enabled = false;
        pc.app.root.addChild(Camera.sky.entity); */

    }


}



