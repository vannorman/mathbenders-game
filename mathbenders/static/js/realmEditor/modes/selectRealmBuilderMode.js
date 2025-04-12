import RealmBuilderMode from "./realmBuilderMode.js";

export default class SelectRealmBuilderMode extends RealmBuilderMode {

    #mouseHeld=false;
    #startDragPos=new pc.Vec2();
    screenStart;
    selectedEntities=[];
    #screenEnd;
    get #mp(){
        return Mouse.getMousePositionInElement(realmEditor.gui.mapPanel);

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
        const screenEnd = new pc.Vec2(Mouse.xMap,Mouse.y);

        // Step 2: Convert screen positions to world space (on ground plane, assume y = 0)
        const getWorldPoint = (screenPos) => {
            const raycastResult = realmEditor.camera.cameraComponent.screenPointToRay(screenPos.x, screenPos.y);
             //Utils3.debugSphere({position:raycastResult.point})

            return raycastResult.point;
        };

        const worldStart = getWorldPoint(this.screenStart);
        const worldEnd = getWorldPoint(screenEnd);

        const worldCorner1 = getWorldPoint(new pc.Vec2(this.screenStart.x,screenEnd.y));
        const worldCorner2 = getWorldPoint(new pc.Vec2(screenEnd.x,this.screenStart.y));


        // Step 3: Build bounding box on X/Z plane
        const minX = Math.min(worldStart.x, worldEnd.x);
        const maxX = Math.max(worldStart.x, worldEnd.x);
        const minZ = Math.min(worldStart.z, worldEnd.z);
        const maxZ = Math.max(worldStart.z, worldEnd.z);

        // Step 4: Check each entity
        this.clearHighlights();
        this.selectedEntities = [];

        for (const item of realmEditor.currentLevel.templateInstances) {
            const entity = item.entity;
            const pos = entity.getPosition();
            function flatPos(pos){
                return new pc.Vec2(pos.x,pos.z);
            }
            let quad = [flatPos(worldStart),flatPos(worldCorner1),flatPos(worldEnd),flatPos(worldCorner2)];
            let point = flatPos(pos);
            if (Utils.isPointInQuad(point,quad)){
                entity.getComponentsInChildren('render').forEach(x=>{
                    x.layers = x.layers.concat(Camera.outline.layers);
                });
                this.selectedEntities.push(entity);
            }
        }

    }

    onMouseDown(e) {
        if (!realmEditor.gui.isMouseOverMap){
            return;
        }
        this.screenStart = new pc.Vec2(Mouse.xMap,Mouse.y);
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
        this.clearHighlights();
        this.#mouseHeld=false; 
        realmEditor.gui.dragBox.enabled=false; 
        super.onMouseUp(e);
    }



}

