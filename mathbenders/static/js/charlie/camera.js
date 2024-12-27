// There is a lot of camera behavior in the RealmBuilder implementation, so perhaps
// we can capture it within a class/object, RealmBuilderCamera, Camera
export default class EditorCamera {

    constructor(args) {
        this.defaultSettings = {
            // height: 25,
            rotation: new pc.Vec3(-45, 45, 0),
            zoom: 35
        }
        const {realmEditor}=args;
        this.realmEditor=realmEditor;
        this.degreesRotated = 0;

        // Mapping of realm states
        this.states = {
            'lerping': new LerpingCameraState(),
            'rotating': new RotatingCameraState(),
            'idling': new IdlingCameraState()
        }
        // Set a default state
        this.state = this.states['idling'];

        this.directionMoving = 0;
        this.pivot = new pc.Entity();
        pc.app.root.addChild(this.pivot);
        GameManager.subscribe(this, this.onGameStateChange);
       this.targetPivot = new pc.Vec3();
        
        // Set up camera and position
        this.entity = new pc.Entity();
        this.createCameraComponent();
        this.pivot.addChild(this.entity);
        this.entity.setLocalEulerAngles(this.defaultSettings.rotation);
        this.entity.setLocalPosition(this.entity.forward.mulScalar(-this.defaultSettings.zoom));

        this.renderTexture = this.setUpRenderTexture();
    }

    onGameStateChange(state){
        if (state == GameState.RealmBuilder) { 
            this.pivot.moveTo(Game.player.getPosition())
        }
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
            aspectRatio:Constants.Resolution.aspectRatio,
            aspectRatioMode:1
        });
    }

    get skyCamAspectRatio() { 
        // Since the screen is more narrow in the "Map" area, we adjust the aspect ratio accordingly 
        const leftMargin = 80;
        const logoPanelWidth = 80; 
        return (pc.app.graphicsDevice.width-leftMargin-logoPanelWidth)/pc.app.graphicsDevice.height;
    }


    setUpRenderTexture(){

        // Create a render target texture
        var texture = new pc.Texture(pc.app.graphicsDevice, {
            name: "EditorCameraRenderTexture",
            width: 512,
            height: 512,
           // format: pc.PIXELFORMAT_R8_G8_B8_A8,
            format: pc.PIXELFORMAT_SRGBA8,
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
        this.cameraComponent.aspectRatio = this.skyCamAspectRatio;

        // Set the UI element's texture to the render target texture
        // After rendering, set the UI element's texture
        return texture; 

    }

    // Use to switch between camera states
    switchTo(stateName) {
        // Camera exit the current state
        this.state?.onExitBy(this);

        // Point to desired camera state
        this.state = this.states[stateName];

        // Camera enter the new current state
        this.state.onEnterBy(this);
    }

    zoom(amount) {
        const dir = this.entity.back;
        this.entity.moveTo(this.pivot.getPosition().add(dir.mulScalar(amount)));
    }

    rotate(direction = 1) {
        if (this.state.name === 'rotating') return;

        this.degreesRotated = 0;
        this.directionMoving = direction;
        this.targetPivot.rotate(90 * -direction);
    }

    // MoveCamera(opts = {})
    translate(parameters = {}) {
        const {
            targetPivotPosition,
            targetZoomFactor = 35,
            shouldLerp = true,
            shouldSnapToDefaultRotation = false
        } = parameters;
        if (shouldSnapToDefaultRotation) {
            // then do so
        }
        if (shouldLerp) {
            this.state.name = 'lerping';
        } else {

        }
    }



    update(dt) {
        this.state.onUpdateBy(this);
    }

}

// Usage of the State design pattern
// 1. State.onEnterBy(entity) => setup code to run when the owner of the state wants to enter/make it active
// 2. State.onUpdateBy(entity) => code that runs every frame when this is the active state
// 3. State.onExitBy(entity) => cleanup code to run by the owner of the state before entering the next state
class State {
    onEnterBy(entity) {}
    onUpdateBy(entity) {}
    onExitBy(entity) {}
}

class LerpingCameraState extends State {
    onUpdateBy(camera) {
        super.onUpdateBy(camera);

        const lerpSpeed = 10.0;
        const lerpPos = new pc.Vec3().lerp(this.pivot.getPosition(),this.targetPivotPos,lerpSpeed*dt);
       
        // Lerp  zoom.
        const lerpZoomSpeed = 10;
        const targetLocalCamPos = new pc.Vec3(1,1.414,1).mulScalar(this.targetZoomFactor);
        const lerpZoomPos = new pc.Vec3().lerp(this.entity.getLocalPosition(),targetLocalCamPos,lerpZoomSpeed*dt);

        // Finished both?
        const distToTargetPos = pc.Vec3.distance(lerpPos,this.targetPivotPos);
        const distToTargetZoom = pc.Vec3.distance(targetLocalCamPos,this.entity.getLocalPosition());
       
        const finishedLerpPos = distToTargetPos < 0.2;
        const finishedLerpZoomPos = distToTargetZoom < 0.2;
        
        if (finishedLerpPos && finishedLerpZoomPos) {
            // Lerp finished
            camera.switchTo('idling');
            camera.pivot.moveTo(this.targetPivotPos)
            camera.camera.entity.setLocalPosition(targetLocalCamPos); // awkward camera(instance).camera(component).entity
        } else {
            // Lerping
            this.pivot.moveTo(lerpPos);
            this.entity.setLocalPosition(lerpZoomPos);
        }

        /*
        const lerpSpeed = 10.0;
        const lerpPosition = new pc.Vec3().lerp(camera.pivot.getPosition(), camera.targetPivot, lerpSpeed * dt);
        const currentZoom = this.entity.getLocalPosition().length();
        const zoomLerpSpeed = 500;
        const zoomLerpedPosition = Math.lerp(currentZoom, camera.targetZoomFactor,zoomLerpSpeed * dt);
        const d = pc.Vec3.distance(lerpPosition, camera.targetPivot);
        const z = Math.abs(camera.targetZoomFactor - currentZoom);
        if (d < .2 && z < 0.2) {
            camera.pivot.moveTo(camera.targetPivot)
            this.entity.setLocalPosition(this.entity.forward.mulScalar(-camera.targetZoomFactor));
            camera.switchTo('idling');
        } else {
            camera.pivot.moveTo(lerpPosition);
            this.entity.setLocalPosition(this.entity.forward.mulScalar(-zoomLerpedPosition));
        }
        */
    }
}

class RotatingCameraState extends State {
    onUpdateBy(camera) {
        super.onUpdateBy(camera);
        const degreesToRotate = 200 * dt;
        this.degreesRotated += degreesToRotate;
        const angleBetweenPivotPoints = new pc.Vec3().angle(camera.pivot.forward, camera.targetPivot.forward);
        if (angleBetweenPivotPoints < 1 || camera.degreesRotated > 90) {
            camera.pivot.setRotation(camera.targetPivot.getRotation());
        }
        else {
            camera.pivot.rotate(camera.directionMoving * degreesToRotate)
        }
    }
}

// A 'default' state if you will, where nothing happens
class IdlingCameraState extends State {
}


// Example usage
//const realmBuilderCamera = new RealmBuilderCamera();
//realmBuilderCamera.switchTo('lerping');
//realmBuilderCamera.switchTo('rotating');
//
//realmBuilderCamera.zoom(3);
//realmBuilderCamera.rotate(30)
