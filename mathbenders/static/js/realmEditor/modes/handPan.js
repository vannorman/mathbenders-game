import Base from "./base.js";

export default class HandPan extends Base {

    onEnter () {
        this.realmEditor.gui.setHandPanCursor();

    }
    onExit(){
        this.realmEditor.gui.setNormalCursor();
    }
    onMouseMove(e) {
        
        super.onMouseMove(e);
        const moveSpeedX = 1.3;
        const moveSpeedY = 2.3;
        let right = this.realmEditor.camera.entity.right.flat();
        let up = this.realmEditor.camera.entity.up.flat();
        let xSpeed = new pc.Vec3().distance(this.realmEditor.camera.entity.getPosition().sub(this.realmEditor.camera.pivot.getPosition())) / 1000;
        let ySpeed = new pc.Vec3().distance(this.realmEditor.camera.entity.getPosition().sub(this.realmEditor.camera.pivot.getPosition())) / 1000;

        // console.log("mousepan:"+e.dx.toFixed(3)+","+e.dy.toFixed(3)+",spd;"+xSpeed.toFixed(3)+","+ySpeed.toFixed(3))
        const mov = new pc.Vec3().add2(
                    right.mulScalar(-e.dx * xSpeed * moveSpeedX),
                    up.mulScalar(e.dy * ySpeed * moveSpeedY)
                )
        if (this.realmEditor.camera.cameraComponent.projection == 1){
            // Orthographic projection, we currently don't do this way
//                Camera.sky.entity.translate(mov);
        } else if (this.realmEditor.camera.cameraComponent.projection == 0){
            const pos = this.realmEditor.camera.pivot.getPosition().clone().add(mov);
            this.realmEditor.camera.translate({targetPivotPosition:pos,shouldLerpPivot:false});
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
