import RealmBuilderMode from "./realmBuilderMode.js";

export default class SelectRealmBuilderMode extends RealmBuilderMode {

    #mouseHeld=false;
    #startDragPos=new pc.Vec2();
    screenStart;

    #screenEnd;
    get #mp(){
        return Mouse.getMousePositionInElement(realmEditor.gui.mapPanel);

    }
    onEnter(){
    }

    onMouseMove(e) {
        super.onMouseMove(e);
        if (!this.#mouseHeld) return;
        this.updateBoxSize();

    
         // Step 1: Get screen positions
        const screenEnd = new pc.Vec2(Mouse.x,Mouse.y);

        // Step 2: Convert screen positions to world space (on ground plane, assume y = 0)
        const getWorldPoint = (screenPos) => {
            console.log(screenPos);
            const raycastResult = realmEditor.camera.cameraComponent.screenPointToRay(screenPos.x, screenPos.y);
            return raycastResult.point;
        };

        const worldStart = getWorldPoint(this.screenStart);
        const worldEnd = getWorldPoint(screenEnd);

        // Step 3: Build bounding box on X/Z plane
        const minX = Math.min(worldStart.x, worldEnd.x);
        const maxX = Math.max(worldStart.x, worldEnd.x);
        const minZ = Math.min(worldStart.z, worldEnd.z);
        const maxZ = Math.max(worldStart.z, worldEnd.z);

        // Step 4: Check each entity
        const selectedEntities = [];

        for (const item of realmEditor.currentLevel.templateInstances) {
            const entity = item.entity;
            entity.getComponentsInChildren('render').forEach(x=>{
                x.layers = [0];
            });
            const pos = entity.getPosition();
            if (pos.x >= minX && pos.x <= maxX && pos.z >= minZ && pos.z <= maxZ) {
                entity.getComponentsInChildren('render').forEach(x=>{
                    x.layers.concat(Camera.outline.layers);
                });
                selectedEntities.push(entity);
            }
        }

        console.log("Selected entities:", selectedEntities);
    }

    onMouseDown(e) {
        if (!realmEditor.gui.isMouseOverMap){
            return;
        }
        this.screenStart = new pc.Vec2(Mouse.x,Mouse.y);
        this.#mouseHeld=true; 
        realmEditor.gui.dragBox.enabled=true;
        this.#startDragPos = new pc.Vec2(this.#mp[0],this.#mp[1]);
        this.updateBoxSize();
        super.onMouseDown(e);
    }
  
    updateBoxSize(){
        let anchor = [this.#startDragPos.x,this.#startDragPos.y,this.#mp[0],this.#mp[1]];

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
        this.#mouseHeld=false; 
        realmEditor.gui.dragBox.enabled=false; 
        super.onMouseUp(e);
    }



}

