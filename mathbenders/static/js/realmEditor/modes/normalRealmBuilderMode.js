import RealmBuilderMode from "./realmBuilderMode.js";

export default class NormalRealmBuilderMode extends RealmBuilderMode {

    onEnter(){
    }

    onMouseMove(e) {
        super.onMouseMove(e);
    }
    mouseHeld=false;
    timer = 0;
    onMouseDown(e) {
        this.mouseHeld=true;
        // console.log("%c Mousedown w/ mode: Normal",'color:#07f');
       // const itemIsUnderCursor = this.realmEditor.gui.editableItemUnderCursor != null;
        super.onMouseDown(e);
    }
    
    onMouseUp(e) {
        this.mouseHeld=false;
        this.timer=0;
        const itemToEdit = this.realmEditor.gui.editableItemUnderCursor;
        
        if (itemToEdit != null){
            realmEditor.editItem({entity:this.realmEditor.gui.editableItemUnderCursor});
        }
        super.onMouseUp(e);
    }

    update(dt){
        if (this.mouseHeld){
            this.timer += dt;
            const handPanHoldThreshold = 0.16;
            if (this.timer > handPanHoldThreshold && this.realmEditor.gui.isMouseOverMap){
                this.realmEditor.toggle('handpan');
            }
        }
    }

    onExit(){
        this.timer=0;
        this.mouseHeld=false;

    }

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

 




}
