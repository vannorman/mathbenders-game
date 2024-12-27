import RealmBuilderMode from "./realmBuilderMode.js";

export default class HandPanRealmBuilderMode extends RealmBuilderMode {

    onEnter () {
        this.realmEditor.gui.setHandPanCursor();

    }
    onExit(){
        this.realmEditor.gui.setNormalCursor();
    }
    onMouseMove(e) {
        
        super.onMouseMove(e);
        let right = this.realmEditor.camera.entity.right.flat();
        let up = this.realmEditor.camera.entity.up.flat();
        let dt = .004;
        let xSpeed = new pc.Vec3().distance(this.realmEditor.camera.entity.getPosition().sub(this.realmEditor.camera.pivot.getPosition())) / 1000;
        let ySpeed = new pc.Vec3().distance(this.realmEditor.camera.entity.getPosition().sub(this.realmEditor.camera.pivot.getPosition())) / 1000;
        const mov = new pc.Vec3().add2(
                    right.mulScalar(-e.dx * xSpeed),
                    up.mulScalar(e.dy * ySpeed)
                )
        if (this.realmEditor.camera.cameraComponent.projection == 1){
            // Orthographic projection, we currently don't do this way
//                Camera.sky.entity.translate(mov);
        } else if (this.realmEditor.camera.cameraComponent.projection == 0){
            this.realmEditor.camera.pivot.translate(mov);
        }
        if (!this.realmEditor.gui.isMouseOverMap || !Mouse.isPressed){
            console.log('breakpan');
            this.realmEditor.toggle('normal');
        }


    }

    onMouseDown(e) { /* No operation per the existing code */ }

    onMouseUp(e) {
        super.onMouseUp(e);
        this.realmEditor.toggle('normal');
    }

}
