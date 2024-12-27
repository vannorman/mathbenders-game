import RealmBuilderMode from "./realmBuilderMode.js";

export default class NormalRealmBuilderMode extends RealmBuilderMode {

    onMouseMove(e) {
        super.onMouseMove(e);
    }

    onMouseDown(e) {
        console.log("%c Mousedown w/ mode: Normal",'color:#07f');
        if (this.editablItemUnderCursor){
            this.realmEditor.toggle('editingItem');
        } else if (this.realmEditor.gui.isMouseOverMap){
            .

            // Eytan TODO: implement "hand pan" mode. 
            console.log('map');
        }



        super.onMouseDown(e);
    }

    // move to getter?
    get editableItemUnderCursor () {
        // was:  UpdateWorldPointUnderCursor(){
        const editableItemUnderCursor = null;

        // Bit of annoying math to adjust for the fact that the MapPanel is only 560 x 500, while the Camera's viewport size is 800 x 500
        // I couldn't figure out how to make the camera's viewport etc be correct so I just adjust based on the app width and left margin
        // Without this math, there is an offset between the cursor position and the "world Point Under Cursor" position
        const w = pc.app.graphicsDevice.width;
        const leftMargin = this.realmEditor.gui.leftMargin * pc.app.graphicsDevice.width / Constants.Resolution.width;
        let invXmap = (-leftMargin + Mouse.x) * (pc.app.graphicsDevice.width-leftMargin)/pc.app.graphicsDevice.width;
        let mx = (Mouse.x - leftMargin);
        let ww = w - leftMargin;
        let adjust = leftMargin*(ww - mx)/ww;
        let raycastResult = this.cameraComponent.screenPointToRay(Mouse.x-adjust,Mouse.y);
        // Whew ok bs math is over
        if (raycastResult) {
            if (raycastResult.entity) {
                this.worldPointUnderCursor = raycastResult.point;
                this.lastCameraDistance = pc.Vec3.distance(this.worldPointUnderCursor,Camera.sky.entity.getPosition());
                // editable item under cursor? while in normal mode?
                // editable item may be a "parent" with no colliders, so go upstream until we find it
                const parentDepthSearch = 5;
                let par = raycastResult.entity;

                for(i=0;i<parentDepthSearch;i++){
                    if (par.tags._list.includes(Constants.Tags.BuilderItem)){
                        editableItemUnderCursor = par;
                        return;
                    } else {
                    //    if (par.name == "NumberHoop") console.log('not found:'+par.name+","+par.getGuid()+" vs "+item.obj.getGuid());
                        par = par.parent ? par.parent : par;
                    }
                }
            }
        } else {
            let wc = new pc.Vec3()
            Camera.sky.screenToWorld(Mouse.x,pc.app.graphicsDevice.height-Mouse.y,0,wc);
            this.worldPointUnderCursor = wc.add(Camera.sky.entity.forward.mulScalar(this.lastCameraDistance));
        }

        return editablItemUnderCursor;
    }

 



    onMouseUp(e) {
        super.onMouseUp(e);
    }

}
