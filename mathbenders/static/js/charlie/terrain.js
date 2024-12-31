export default class Terrain {

    // TODO :Remove references to centroid here. use getPosition(). ref centroid only when you generate()

    // Each "Level" (with mutiple Levels per Realm) has a Terrain associated with it.
    // The Terrain is created when the Level is created, and can be modified using BuilderPanel Terrain.
    // Terrains cannot be created or destroyed independently of Levels.
    constructor(args={}){
        let data = {
            name : "New Terrain", 
            heightTruncateInterval : 0.0, // 0 : smooth, 1 : blocky
            heightScale : 0.5, // how tall hills
            seed : 0.5,  
            dimension : 16, // x^2 verts
            sampleResolution : 0.004, // higher values : more coarse terrain
            size : 50, // world scale
            placeTrees : true,
            treeCount : 2,
            /// realmEditor @Eytan should I be passing realmEditor everywhere here or is accessing the global ok?
       };
        Object.keys(args).forEach(k => {
            data[k] = args[k];
        });
        this._data = data;
        this.placeTreeFn = null;
    }

    placeTrees() {
        // could get verts from meshUtil.GetVertsFromEntityMesh(this.entity)
        // OR, simply get the xz bounds of the terrain then pick a random point above it and raycast down (more variety)
        // Need to setTimeout so that all trees dont get instanced at once (too slow)
        // Need to buffer initial setTimeout kickoff time (5s?) so that "terarin slider tweaking" doesn't kick off 100 times before user is done messing with it
        // Need to store the setTimeout so that it can be interrupted on terrain.destroy()
        const positions = meshUtil.GetVertsFromEntityMesh({entity:this.entity});
        const terEnt = this.entity;
        const selectedPositions = Utils.SelectRandomFromArray({arr:positions,count:this.data.treeCount})
        const thisInstance = this;
        this.placeTreeTimeoutFn = setTimeout(function(){
            var placeTreeFn = setInterval(function(){
                if (selectedPositions.length <= 0){
                    clearInterval(placeTreeFn);
                    return;
                }
                const p = selectedPositions.pop();
                const tree = TerrainGenerator.Tree({position:p});
                terEnt.addChild(tree);
            },25)
            thisInstance.placeTreeFn = placeTreeFn;
        },100);

        // Raycast down method
        /*
         var { positions = [], TerrainEntity = null, treeCount = 20000 } = options;
            const verts = reshape(positions); // create a 2d array
            extents = findExtents(verts);
            extents = extents.map(x => x.add(TerrainEntity.getPosition())); // world coords
    
        let p = getRandomVec3WithinExtents(extents);
            if (pc.Vec3.distance(p,pc.Vec3.ZERO) < 15) continue;
            p.add(new pc.Vec3(0,100,0));
            var results = pc.app.systems.rigidbody.raycastAll(p, p.clone().add(new pc.Vec3(0,-300,0)));
            for (let j=0;j<results.length;j++){
                let result = results[j];
                if (result.entity == TerrainEntity){
                    setTimeout(function(){TerrainGenerator.Tree({position:result.point,TerrainEntity:TerrainEntity})},i);
                }
            }
        */

    }
    postGenerationFunction() { 
        const mat = Shaders.GrassDirtByHeight({yOffset:this.centroid.y});
        this.entity.render.meshInstances[0].material = mat;
        this.placeTrees();
    }
    
    toJSON(){ 
        const data = JSON.parse(JSON.stringify(this._data));
        data.terrainInstance 
        return data;
    }
    
    get entity(){ return this._entity; }
    set entity(value){ this._entity = value; }
    get centroid() {
        if (!this._data.centroid){
            this._data.centroid = terrainCentroidManager.getCentroid();
        }
        return this._data.centroid;
    }
    get data(){
        this._data.centroid = this.centroid;
        return this._data; 
    }

    get scale(){
        if (this.entity.render) return this.entity.render.meshInstances[0].aabb.halfExtents.length();
        else return 10;
    }
    
    generate(source="none"){
        // console.log("%c load ter:"+source+" at:"+this.data.centroid.trunc(),'color:#5af;font-weight:bold;');
        this.entity = TerrainGenerator.Generate(this.data);
        this.postGenerationFunction();
    }
   
    RegenerateWithDelay(opts={}){
        const {delay=500,realmEditor} =opts;
        this.clearTimeouts();
        const $this = this;
        this.regenerateTimeoutFn = setTimeout(function(){
            $this.Regenerate({realmEditor:realmEditor}); 
        },delay)
//        console.log("reg del");
    }

    Regenerate(args){
        // console.log("regen ter");
        const {realmEditor} = args;
        this.entity.destroy();
        this.clearTimeouts();
        this.generate(this.data);
        const terrainPos = this.entity.getPosition();    
        realmEditor.camera.translate({source:'regen',targetPivotPosition:terrainPos, targetZoomFactor:this.scale*2.2});
    } 

    clearTimeouts(){
        clearInterval(this.placeTreeFn);
        clearTimeout(this.placeTreeTimeoutFn);
        clearTimeout(this.regenerateTimeoutFn);
    }

    destroy(){
        terrainCentroidManager.relinquishCentroid(this._data.centroid);
        this.clearTimeouts();
        this.entity.destroy();

    }
}


