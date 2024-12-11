/* ********************** */
/*     Define Classes     */
/* ********************** */
class RealmData {
    constructor(opts={}){
        const {
            name=Utils.randomName(),
            creator="nocreat",
            date_created=Date.now(),
            date_last_edited=Date.now(),
            levels=[new Level()],
            guid=Utils.newGuid(),
        } = opts;
        this.name = name;
        this.creator = creator;
        this.date_created = date_created;
        this.date_last_edited = date_last_edited;
        this.Levels = levels;
        this.guid = guid;
    }

    Clear(opts = {}){
        const {deleteLevelObjects=true} = opts;
        if (deleteLevelObjects){
            this.Levels.forEach(level=>{
                level.Clear({deleteLevelObjects:deleteLevelObjects});
            });

        }
    }

    get currentLevel(){
        // Estimate!
        let min = Infinity;
        let closest = null;
        this.Levels.forEach(level=>{
            let d = pc.Vec3.distance(
                Camera.sky.entity.getPosition(),
                level.terrain.entity.getPosition()); // equivalent to terrainData.terrainEntity.getPosition()?
            if(d < min){
                min = d;
                closest = level;
            }
        });
        return closest;
    }
 
}

class TerrainCentroidManager {
    constructor(args={}){
        const { terrainSpacing = 1000 }  = args;
        this.terrainSpacing = terrainSpacing;
        this.centroids = [];

        const dim = 4;
        const arr = Array.from({ length: dim }, () => Array.from({ length: dim }, () => Array.from({length:dim})));
        arr.forEach((layer, x) => layer.forEach((row, y) => row.forEach((element, z) => {
            this.centroids.push(new pc.Vec3(x-1,y-1,z-1).mulScalar(this.terrainSpacing)); 
            // -1,-1,-1 to 1,1,1 (a total of 27 positions in a 3x3x3 cube) 
        })))
    }
    getCentroid () {
        if (this.centroids.length <= 0){ //this.centroids.index - 1) {
            console.log("%c ERROR : Too many terrains!","color:red,font-weight:bold");
            return new pc.Vec3(0,150,0); // a spacing likely to be visually seen by the user as an error
        }
//        console.log("%c CENTROID : "+(this.index + 1),"color:#0a0")
        return this.centroids.pop();//[this.index++];
    }
    relinquishCentroid(centroid){
        // Terrain will call this when it's destroyed.
        this.centroids.push(centroid);
    }
}

class Level {
    // A "Level" is a collection of a Terrain and LevelObjects. 
    // Multiple "Levels" exist in a single Realm and are all loaded at the same time.
    // Levels are positioned in world space apart from each other so as to prevent overlap.
     constructor(opts={}) {
        const { skipTerrainGen=false } = opts; 
        this._placedObjects = [];
        if (!skipTerrainGen){
            const newTerrain = new Terrain();
            newTerrain.generate();
            this._terrain = newTerrain;

        }
    }
    get terrain(){ return this._terrain;}
    set terrain(value) { this._terrain = value; }
    get placedObjects() { return this._placedObjects;}
    set placedObjects(value) { this._placedObjects=value;}
    

    ClearPlacedObjects(){
        this._placedObjects.forEach(x=>{x._entity.destroy();})
        //this._placedObjects = [];
    }

    RemoveEntityFromPlacedObjects(entity){
        const matched = this._placedObjects.filter((x)=>x._entity.getGuid()==entity.getGuid())[0]
        if (matched) {
            const index = this._placedObjects.indexOf(matched);
            console.log("remove entity;"+entity.name);
            this._placedObjects.splice(index,1);
        } else {
            console.log("Failed to remove entity;"+entity.name);
        }

    }
    
    DestroyEntity(entity){
        const matched = this._placedObjects.filter((x)=>x._entity.getGuid()==entity.getGuid())[0]
        if (matched) {
            const index = this._placedObjects.indexOf(matched);
            this._placedObjects.splice(index,1);
            entity.destroy();
        } else {
            console.log("Failed to destroy entity;"+entity);
        }
    }

    Clear(opts={}){
        const {deleteLevelObjects=true} = opts;
        this.terrain.destroy();
        if (deleteLevelObjects) {
            this.ClearPlacedObjects();
        }

    }
}

class PlacedEntity {
    // Each object placed by RealmBuilder, either by drag-and-drop or by "Loading a Realm", 
    // has a corresponding PlacedEntity object stored in memory.

    constructor(args={}){
        const { entity, template, level } = args;
       this._entity = args.entity; 
       this._template = template;
       this._level = level;
    }

    get position(){return this._entity.getPosition().sub(this._level.terrain.centroid).trunc();}
    get rotation(){return this._entity.getRotation().trunc();}
    get template(){ return this._template; }

    toJSON(){
        return {
            position : this._entity.getPosition().sub(this._level.terrain.centroid).trunc(),
            rotation : this._entity.getRotation().trunc(),
            template : this._template
        }
    }
}

class Terrain {

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
            this._data.centroid = RealmBuilder.TerrainCentroidManager.getCentroid();
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
        const {delay=500} =opts;
        this.clearTimeouts();
        const $this = this;
        this.regenerateTimeoutFn = setTimeout(function(){
            $this.Regenerate(); 
        },delay)
        console.log("reg del");
    }

    Regenerate(){
        console.log("reg");
        this.entity.destroy();
        this.clearTimeouts();
        this.generate(this.data);
        const terrainPos = this.entity.getPosition();    
        RealmBuilder.MoveCamera({source:'regen',targetPivotPos:terrainPos, targetZoomFactor:this.scale*2.2});
    } 

    clearTimeouts(){
        clearInterval(this.placeTreeFn);
        clearTimeout(this.placeTreeTimeoutFn);
        clearTimeout(this.regenerateTimeoutFn);
    }

    destroy(){
        RealmBuilder.TerrainCentroidManager.relinquishCentroid(this._data.centroid);
        this.clearTimeouts();
        this.entity.destroy();

    }
}

// Class BuilderPanel is in static/js/RealmBuilder/builderPanel.js



/* ********************** */
/*     Define States      */
/* ********************** */


const EditableItemMode = Object.freeze({
    // When the user Drags-and-drops an item onto the level, enter this mode.
    Editing : 'Editing',
    PoppingIn : 'PoppingIn',
    Normal : 'Normal',
    PoppingOut : 'PoppingOut',
});

const DraggingMode= Object.freeze({
    // When user Drags-and-drops an item, 
    // State is Pre-Instantiation mode when mouse cursor is over the Builder Panel.
    // State is Post-Instantiation when mouse cursor is over the Map panel.
    // When state moves from Pre to Post, Instantiate the item (and store its PlacedObject in memory).
    // When state moves from Post to Pre, Destroy the item (and remove its PlacedObject in memory).
    PreInstantiation : 'PreInstantiation',
    PostInstantiation : 'PostInstantiation',
});

const RealmBuilderMode =  Object.freeze({
        Normal: 'Normal',
        HandPan: 'HandPan',
        Orbit: 'Orbit',
        DraggingObject: 'DraggingObject',
        EditingItem : 'EditingItem',
        MapScreen : 'MapScreen',
        LoadRealmScreen : 'LoadRealmScreen',
})



