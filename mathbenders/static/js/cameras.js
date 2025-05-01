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
            priority:3,
            aspectRatio:Constants.Resolution.aspectRatio,
            gammaCorrection:0,

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
            priority:4,
            clearColorBuffer:true,
            clearDepthBuffer:true,

            farClip:1500,
            aspectRatio:Constants.Resolution.aspectRatio,
            aspectRatioMode:1,
            gammaCorrection:1,
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
        pc.app.scene.envAtlas = assets.textures.skyboxes.sunny.resource;
        pc.app.scene.toneMapping = pc.TONEMAP_ACES;
        pc.app.scene.skyboxIntensity = 0.7;
        
     
        pivot.addChild(Camera.main.entity);
        Camera.main.entity.addComponent('audiolistener');
        Camera.main.entity.translate(0, 1, 9);
        Camera.main.entity.lookAt(0, 2, 0);
        Camera.main.entity.addComponent('script');
        Camera.main.entity.script.create('cameraWallHandler',{attributes:{camera:Camera.main.entity}});


    }
}

class OutlineCamera {
    constructor(realmEditor){
        // create texture and render target for rendering into, including depth buffer
        function createRenderTarget() {
            const texture = new pc.Texture(pc.app.graphicsDevice, {
                name: 'OutlineObjects',
                width: 512,
                // pc.app.graphicsDevice.height,
                height: 512, //pc.app.graphicsDevice.height,
                format: pc.PIXELFORMAT_RGBA8,
                mipmaps: false,
                minFilter: pc.FILTER_LINEAR,
                magFilter: pc.FILTER_LINEAR
            });
            return new pc.RenderTarget({
                colorBuffer: texture,
                depth: true
            });
        }

        let renderTarget = createRenderTarget();

        // create a layer for rendering to texture, and add it to the layers
        const outlineLayer = new pc.Layer({ name: 'OutlineLayer' });
        pc.app.scene.layers.push(outlineLayer);

        // Create outline camera, which renders entities in outline layer into the render target
        const outlineCamera = new pc.Entity('Outline Camera');
        outlineCamera.addComponent('camera', {
            clearColor: new pc.Color(0.0, 0.0, 0.0, 0.0),
            layers: [outlineLayer.id],
            renderTarget: renderTarget,
            viewport:[0.5,0.5,1,1],
            aspectRatio:Camera.skyCamAspectRatio,
            aspectRatioMode:1,
 
            // set the priority of outlineCamera to lower number than the priority of the main camera (which is at default 0)
            // to make it rendered first each frame
            priority: -1
        });
        realmEditor.camera.entity.addChild(outlineCamera);
        outlineCamera.setLocalPosition(0,0,0);
        outlineCamera.setLocalEulerAngles(0,0,0);
        this.cameraComponent = outlineCamera.camera;
        const thickness = 4;
        const outline = new OutlineEffect(pc.app.graphicsDevice, thickness, pc.Color.YELLOW);
        this.shader = outline;
        outline.color = new pc.Color(0, 0.5, 1, 1);
        outline.texture = renderTarget.colorBuffer;
        realmEditor.camera.cameraComponent.postEffects.addEffect(outline);
        // outlineCamera.moveTo(realmEditor.camera.entity.getPosition(),realmEditor.camera.entity.getEulerAngles());
        Camera.outline = this;//outlineCamera.camera;
        return this;
    }
    
    get thickness(){ return this.shader.thickness;}
    set thickness(value){ this.shader.thickness= value;}

}

Object.defineProperty(Camera, "skyCamAspectRatio", {
    get: function skyCamAspectRatio() {
        if (typeof realmEditor !== 'undefined'){
            const mpe = realmEditor.gui.mapPanel.element;
            return mpe.width / mpe.height;
        } else {
            return 1.12;
        }
    }
});
