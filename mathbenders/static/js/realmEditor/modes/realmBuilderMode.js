// Superclass of all Realm builder modes. Any new realm builder mode should extend this class
export default class RealmBuilderMode {

    constructor(params) {
        this.realmEditor = params.realmEditor;
    }

    onMouseMove() {
    //  console.log('superc onMouseMove', this.constructor.name); 
    }

    onMouseUp() {}

    onMouseDown() {}
    onMouseScroll(e){
        let r = realmEditor.camera.entity.right.mulScalar(0.22);
        this.cameraIsLerping = false;
        if (realmEditor.camera.cameraComponent.projection == 1){
//            if (e.wheelDelta > 0){
//                if (Camera.sky.orthoHeight < 100) {
//                    Camera.sky.orthoHeight++;
//                    Camera.sky.entity.translate(-r.x,-r.y,-r.z);
//                }
//            } else {
//                if (Camera.sky.orthoHeight > 10) {
//                    Camera.sky.orthoHeight--;
//                    Camera.sky.entity.translate(r.x,r.y,r.z);
//                }
//            }
        } else if (realmEditor.camera.cameraComponent.projection == 0) {
            const fwd = e.wheelDelta < 0 ? 1 : -1; // scroll up or down?
            const heightFactor = realmEditor.camera.entity.getLocalPosition().length(); // closer to ground? scroll slower
            const factor = 0.05;
            const dir = realmEditor.camera.entity.forward;
            const m = dir.mulScalar(fwd * heightFactor * factor)
            realmEditor.camera.entity.translate(m); 
        }

    }



    onEnter() { 
//        console.log('preparation code for mode'); 
    }

    onExit() { 
 //       console.log('clean up code to run'); 
    }

    update(dt){

    }

    mapClicked(){}
    clickOffMap(){}
}
