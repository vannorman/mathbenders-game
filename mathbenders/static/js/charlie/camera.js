export default class Camera {
    constructor(args={}){
        const skyCam = new pc.Entity("SkyCamera");
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
        pc.app.root.addChild(Camera.sky.entity);
    }




}


