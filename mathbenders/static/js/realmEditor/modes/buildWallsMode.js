import RealmBuilderMode from "./realmBuilderMode.js";

export default class BuildWallsMode extends RealmBuilderMode {

    #closeBtn;
    #lastPosition;
    #turrets;
    #pointsClicked=[];
    onEnter () {
        this.realmEditor.gui.setHandPanCursor();
        this.buildGui(); 
        this.#pointsClicked=[];

    }

    setData(args={}){
        const {originalEntity,turrets}=args;
        this.#lastPosition = originalEntity.getPosition();
        this.#turrets = turrets;
        originalEntity.destroy();
        if (this.#turrets) realmEditor.InstantiateTemplate({ItemTemplate:CastleTurret,position:this.#lastPosition})
    }


    buildGui(){ 
        const $this=this;
        this.#closeBtn = UI.SetUpItemButton({
            parentEl:realmEditor.gui.mapPanel,
            width:70,height:70,
            textureAsset:assets.textures.ui.icons.wall,
            text:"Finished",
            anchor:[.5,.9,.5,.9],
            colorOn:pc.Color.YELLOW,
            mouseDown:function(){ $this.exit(); },
            cursor:'pointer',
        });

    }

    exit(){
        realmEditor.toggle('normal')
    }

    onExit(){
        this.realmEditor.gui.setNormalCursor();
        this.#closeBtn.destroy();
    }

    onMouseMove(e) {
        
    
    }

    onMouseDown(e) { 
        if (!realmEditor.gui.isMouseOverMap || !realmEditor.gui.isMouseOverTerrain) {
            this.exit();
            return;
        }
        let nowPos = realmEditor.gui.worldPointUnderCursor;
        
        const snapThreshold = 3;
        this.#pointsClicked.forEach(prevPos=>{
            // While clicking, we may be trying to "Join" the wall with another wall. If so, snap
            if (nowPos.distance(prevPos) < snapThreshold) nowPos = prevPos;
        });
        this.#pointsClicked.push(nowPos);
        // create interval positions between this.#lastPosition and p
        // create a template for CastleWallFormed at each interval, scaled to match
        // rotate it to be along the line
        // drop it to the terrain
        if (Mouse.isMouseOverEntity(this.#closeBtn)) return;
        function fenceSegmentCenters(a, b, maxDist) {
            const distance = a.distance(b);
            const segments = Math.ceil(distance / maxDist);
            const segmentLength = distance / segments;
            const points = [];

            for (let i = 0; i < segments; i++) {
                const t = (i + 0.5) / segments;
                points.push(new pc.Vec3().lerp(a, b, t));
            }

            return points;
        }

        function getRightFacingRotation(a, b) {
            const forward = new pc.Vec3().sub2(b, a).normalize();
            let rot = Quaternion.LookRotation(forward).getEulerAngles();
            rot = new pc.Vec3(rot.x,rot.y+90,rot.z);
            return rot;
        }

        let maxDist = 8;
        let centers = fenceSegmentCenters(nowPos,this.#lastPosition,maxDist);
        if (centers.length <=1 ) return;
        let distBetweenCenters = centers[0].clone().flat().distance(centers[1].clone().flat());
        let rot = getRightFacingRotation(nowPos.flat(),this.#lastPosition.flat());
        centers.forEach(p=>{
            let wall = realmEditor.InstantiateTemplate({
                ItemTemplate:CastleWallFormed,
                position:p,
                rotation:rot,
            });      
            const xScale = distBetweenCenters/6;
            // console.log("scalex:"+distBetweenCenters/6);
            wall.formToTerrain({xScale:xScale});
        });
        this.#lastPosition =  nowPos;

        // Add turret?
        if (this.#turrets){
            realmEditor.InstantiateTemplate({ItemTemplate:CastleTurret,position:this.#lastPosition})

        }

    }

    onMouseUp(e) {
        super.onMouseUp(e);
    }

}

