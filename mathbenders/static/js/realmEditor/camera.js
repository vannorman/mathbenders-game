// There is a lot of camera behavior in the RealmBuilder implementation, so perhaps
// we can capture it within a class/object, RealmBuilderCamera, Camera
export default class EditorCamera {

    #mode;
    #modes;
    targetPivotPosition;
    targetZoomFactor=35;
    degreesRotated;
    targetPivot; // for rotation, it's easier and more straightforward to have a dummy entity snap to rotation then lerp to that rotation
    get currentZoom(){ return this.entity.getLocalPosition().length(); }

    constructor(args) {
        this.defaultSettings = {
            // height: 25,
            rotation: new pc.Vec3(-45, 45, 0),
            zoom: 35
        }
        const {realmEditor}=args;
        this.realmEditor=realmEditor;

        // Mapping modes.. locally defined, "Normal" in this context applies to this class only
        this.#modes = new Map([
            ['normal',new Normal(this)],
            ['lerping', new Lerping(this)],
            ['rotating', new Rotating(this)],
        ]);
        // Set a default mode
        this.toggle('normal');

        this.pivot = new pc.Entity();
        pc.app.root.addChild(this.pivot);

        this.targetPivot = new pc.Entity();

        // Set up camera and position
        this.entity = new pc.Entity();
        this.createCameraComponent();
        this.pivot.addChild(this.entity);
        this.entity.setLocalEulerAngles(this.defaultSettings.rotation);
        this.entity.setLocalPosition(this.entity.forward.mulScalar(-this.defaultSettings.zoom));

        this.renderTexture = this.setUpRenderTexture();
    }


    get cameraComponent(){ return this.entity.camera; }

    createCameraComponent(){
        const cameraComponent = this.entity.addComponent("camera", {
            layers: [pc.LAYERID_SKYBOX, pc.LAYERID_DEPTH,  pc.LAYERID_WORLD,  ],
            projection:0,
//            orthoHeight:20,
            priority:3,
            clearColorBuffer:false,
            clearDepthBuffer:true,
            viewport:[0.5,0.5,1,1],
            farClip:15000,
            aspectRatio:Camera.skyCamAspectRatio,
            aspectRatioMode:1
        });
    }



    setUpRenderTexture(){

        // Create a render target texture
        var texture = new pc.Texture(pc.app.graphicsDevice, {
            name: "EditorCameraRenderTexture",
            width: 512,
            height: 512,
           // format: pc.PIXELFORMAT_R8_G8_B8_A8,
            format: pc.PIXELFORMAT_RGBA8,
            mipMaps: true,
            addressU: pc.ADDRESS_CLAMP_TO_EDGE,
            addressV: pc.ADDRESS_CLAMP_TO_EDGE
        });

        // Create a render target
        var renderTarget = new pc.RenderTarget({
            name: 'RT',
            colorBuffer: texture,
            flipY: true,
            depth: true,
            samples:2
        });

        // Assign the render target to the camera
        this.cameraComponent.renderTarget = renderTarget;
        this.cameraComponent.aspectRatio = Camera.skyCamAspectRatio;

        // Set the UI element's texture to the render target texture
        // After rendering, set the UI element's texture
        return texture; 

    }

    rotate(degToRotate) {
        if (this.#mode.name === 'rotating') return;
        this.targetPivot.rotate(-degToRotate);
        this.toggle('rotating');
        this.#mode.directionMoving = degToRotate > 0 ? -1 : 1;
    }

    // MoveCamera(opts = {})
    translate(parameters = {}) {
        const {
            targetPivotPosition,
            targetZoomFactor,
            scrollDelta,
            shouldLerpPivot = true,
            shouldLerpZoom = true,
        } = parameters;
        if (targetPivotPosition)  this.targetPivotPosition = targetPivotPosition.clone();
        if (targetZoomFactor) this.targetZoomFactor = targetZoomFactor;
        else if (scrollDelta){
            this.targetZoomFactor -= scrollDelta;
            if (!shouldLerpZoom){
                this.entity.setLocalPosition( new pc.Vec3(1,1.414,1).normalize().mulScalar(this.targetZoomFactor));
            }
        }else {
            // Not scrolling and no zoom factor was set, so simply keep the existing target zoom as the existing height
            this.targetZoomFactor = this.entity.getLocalPosition().length();
        }
        if (shouldLerpPivot) {
            this.toggle('lerping');
        } else {
            
            this.pivot.moveTo(targetPivotPosition);
        }

    }

    toggle(mode) {

        // If the 'mode' does not exist, return
        if (!this.#modes.has(mode)) return;
        // Exit the current mode (if there is one)
        // Point to the mode to use
        // Enter the new current mode
        if (this.#mode) this.#mode.onExit();
        this.#mode = this.#modes.get(mode);
        this.#mode.onEnter();
    }



    update(dt) {
        this.#mode.onUpdate(dt);
    }

}

// Locally accessible classes only, since this file is only accesible outside by the "export"ed class.
class Mode {
    constructor(cam){
        this.cam = cam;
    }
    onEnter(e) {}
    onUpdate(dt) {}
    onExit(e) {}
}

class Lerping extends Mode {
    onUpdate(dt) {
        // super.onUpdate(camera);
        const camera = this.cam;
        const lerpSpeed = 10.0;
        const lerpPos = new pc.Vec3().lerp(camera.pivot.getPosition(),camera.targetPivotPosition,lerpSpeed*dt);
       
        // Lerp  zoom.
        const lerpZoomSpeed = 10;
        const targetLocalCamPos = new pc.Vec3(1,1.414,1).normalize().mulScalar(camera.targetZoomFactor);
        const lerpZoomPos = new pc.Vec3().lerp(camera.entity.getLocalPosition(),targetLocalCamPos,lerpZoomSpeed*dt);

        // Finished both?
        const distToTargetPos = pc.Vec3.distance(lerpPos,camera.targetPivotPosition);
        const distToTargetZoom = pc.Vec3.distance(targetLocalCamPos,camera.entity.getLocalPosition());
       
        const finishedLerpPos = distToTargetPos < 0.2;
        const finishedLerpZoomPos = distToTargetZoom < 0.2;
        
        if (finishedLerpPos && finishedLerpZoomPos) {
            // Lerp finished
            camera.toggle('normal');
            camera.pivot.moveTo(camera.targetPivotPosition)
            camera.entity.setLocalPosition(targetLocalCamPos); // awkward camera(instance).camera(component).entity
        } else {
            // Lerping
            camera.pivot.moveTo(lerpPos);
            camera.entity.setLocalPosition(lerpZoomPos);
        }

    }
}

class Rotating extends Mode {
    directionMoving;
    #degreesRotated;
    onEnter(){
        this.degreesRotated=0;
    }
        
    onUpdate(dt) {
        // super.onUpdate(camera);
        const degreesToRotate = 200 * dt;
        this.degreesRotated += degreesToRotate;
        const angleBetweenPivotPoints = new pc.Vec3().angle(this.cam.pivot.forward, this.cam.targetPivot.forward);
        if (angleBetweenPivotPoints < 1 || this.degreesRotated > 90) {
            // Done, snap to final
            this.cam.pivot.setRotation(this.cam.targetPivot.getRotation());
        }
        else {
            // Step
            this.cam.pivot.rotate(this.directionMoving * degreesToRotate)
        }
    }
}

// A 'default' mode if you will, where nothing happens
class Normal extends Mode {
}



