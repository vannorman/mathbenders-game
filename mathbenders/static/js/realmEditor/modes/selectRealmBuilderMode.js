import RealmBuilderMode from "./realmBuilderMode.js";

export default class SelectRealmBuilderMode extends RealmBuilderMode {

    #mouseHeld=false;
    #screenStart;
    selectedEntities=[];
    #screenEnd;
    get #mp(){
        return new pc.Vec2(Mouse.xMap,Mouse.y);
    }
    
    onEnter(){
    }

    clearHighlights(){
        this.selectedEntities.forEach(entity=>{
            entity.getComponentsInChildren('render').forEach(x=>{
                x.layers = [0];
            });

        });
    }
    onMouseMove(e) {
        super.onMouseMove(e);
        if (!this.#mouseHeld) return;
        this.updateBoxSize();

    
         // Step 1: Get screen positions
        this.#screenEnd = this.#mp;//new pc.Vec2(Mouse.xMap,Mouse.y);




       // box abcd at screen and box efgh extruded forward form camera.
        let cam = realmEditor.camera.cameraComponent;
        let s = 1;
        let h = pc.app.graphicsDevice.height;
        let A = new pc.Vec3(); cam.screenToWorld(this.#screenStart.x,h-this.#screenStart.y,s,A);
        let B = new pc.Vec3(); cam.screenToWorld(this.#screenEnd.x,h-this.#screenStart.y,s,B);
        let C = new pc.Vec3(); cam.screenToWorld(this.#screenEnd.x,h-this.#screenEnd.y,s,C);
        let D = new pc.Vec3(); cam.screenToWorld(this.#screenStart.x,h-this.#screenEnd.y,s,D);
        let z = realmEditor.camera.currentZoom*2; // note: possible to miss on deep canyons
        let E = new pc.Vec3(); cam.screenToWorld(this.#screenStart.x,h-this.#screenStart.y,z,E);
        let F = new pc.Vec3(); cam.screenToWorld(this.#screenEnd.x,h-this.#screenStart.y,z,F);
        let G = new pc.Vec3(); cam.screenToWorld(this.#screenEnd.x,h-this.#screenEnd.y,z,G);
        let H = new pc.Vec3(); cam.screenToWorld(this.#screenStart.x,h-this.#screenEnd.y,z,H);

        if (pc.app.keyboard.isPressed(pc.KEY_SHIFT)){
            Utils3.debugSphere({scale:2,position:E,timeout:20000,color:pc.Color.BLACK})
            Utils3.debugSphere({scale:2,position:F,timeout:20000,color:pc.Color.BLUE})
            Utils3.debugSphere({scale:2,position:G,timeout:20000,color:pc.Color.INDIGO})
            Utils3.debugSphere({scale:2,position:H,timeout:20000,color:pc.Color.VIOLET})
            Utils3.debugSphere({scale:2,position:A,timeout:20000,color:pc.Color.WHITE})
            Utils3.debugSphere({scale:2,position:B,timeout:20000,color:pc.Color.ORANGE})
            Utils3.debugSphere({scale:2,position:C,timeout:20000,color:pc.Color.YELLOW})
            Utils3.debugSphere({scale:2,position:D,timeout:20000,color:pc.Color.GREEN})
        }
 
        Camera.outline.thickness = clamp((1/realmEditor.camera.currentZoom)*300,1,4);
        // Step 4: Check each entity
        this.clearHighlights();
        this.selectedEntities = [];

        for (const item of realmEditor.currentLevel.templateInstances) {
            const entity = item.entity;
            const pos = entity.getPosition();
            let points = [A,B,C,D,E,F,G,H];
            if (Utils.isPointInsidePolyhedra(points,pos)){
                entity.getComponentsInChildren('render').forEach(x=>{
                    x.layers = x.layers.concat(Camera.outline.cameraComponent.layers);
                });
                this.selectedEntities.push(entity);
            }
        }

    }

    onMouseDown(e) {
        if (!realmEditor.gui.isMouseOverMap){
            return;
        }
        this.#screenStart = this.#mp.clone();
        this.#mouseHeld=true; 
        realmEditor.gui.dragBox.enabled=true;
        this.updateBoxSize();
        super.onMouseDown(e);
    }
  
    updateBoxSize(){
        if (!realmEditor.gui.isMouseOverMap){ return; }
        let c = pc.app.graphicsDevice.canvas;
        let anchor = [this.#screenStart.x/c.width,this.#screenStart.y/c.height,this.#mp.x/c.width,this.#mp.y/c.height];

        // Flip x start and end if they are inverted
        if (anchor[0] > anchor[2]){
            let a = anchor[0];
            anchor[0] = anchor[2];
            anchor[2] = a;
        }
        // Flip y start and end if they are inverted

        if (anchor[1] > anchor[3]){
            let a = anchor[1];
            anchor[1] = anchor[3];
            anchor[3] = a;

        }
        realmEditor.gui.dragBox.element.anchor=anchor;

    }

    onMouseUp(e) {
        this.clearHighlights();
        this.#mouseHeld=false; 
        realmEditor.gui.dragBox.enabled=false; 
        super.onMouseUp(e);
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

