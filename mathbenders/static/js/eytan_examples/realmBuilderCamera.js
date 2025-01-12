// There is a lot of camera behavior in the RealmBuilder implementation, so perhaps
// we can capture it within a class/object, RealmBuilderCamera, Camera
export default class RealmBuilderCamera {

    constructor() {
        this.defaultSettings = {
            height: 25,
            rotation: new pc.Vec3(-45, 45, 0),
            zoom: 35
        }
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
        this.pivot = new pc.Vec3();
        this.targetPivot = new pc.Vec3();
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
        const dir = Camera.sky.entity.back;
        Camera.sky.entity.moveTo(RealmBuilder.cameraPivot.getPosition().add(dir.mulScalar(amount)));
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

    // On every frame, resume the current state
    update(dt) {
        this.state.onResumeBy(this);
    }

}

// Usage of the State design pattern
// 1. State.onEnterBy(entity) => setup code to run when the owner of the state wants to enter/make it active
// 2. State.onResumeBy(entity) => code that runs every frame when this is the active state
// 3. State.onExitBy(entity) => cleanup code to run by the owner of the state before entering the next state
class State {
    onEnterBy(entity) {}
    onResumeBy(entity) {}
    onExitBy(entity) {}
}

class LerpingCameraState extends State {
    onResumeBy(camera) {
        super.onResumeBy(camera);
        const lerpSpeed = 10.0;
        const lerpPosition = new pc.Vec3().lerp(camera.pivot.getPosition(), camera.targetPivot, lerpSpeed * dt);
        const currentZoom = Camera.sky.entity.getLocalPosition().length();
        const zoomLerpSpeed = 500;
        const zoomLerpedPosition = Math.lerp(currentZoom, camera.targetZoomFactor,zoomLerpSpeed * dt);
        const d = pc.Vec3.distance(lerpPosition, camera.targetPivot);
        const z = Math.abs(camera.targetZoomFactor - currentZoom);
        if (d < .2 && z < 0.2) {
            camera.pivot.moveTo(camera.targetPivot)
            Camera.sky.entity.setLocalPosition(Camera.sky.entity.forward.mulScalar(-camera.targetZoomFactor));
            camera.switchTo('idling');
        } else {
            camera.pivot.moveTo(lerpPosition);
            Camera.sky.entity.setLocalPosition(Camera.sky.entity.forward.mulScalar(-zoomLerpedPosition));
        }
    }
}

class RotatingCameraState extends State {
    onResumeBy(camera) {
        super.onResumeBy(camera);
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
const realmBuilderCamera = new RealmBuilderCamera();
realmBuilderCamera.switchTo('lerping');
realmBuilderCamera.switchTo('rotating');

realmBuilderCamera.zoom(3);
realmBuilderCamera.rotate(30)