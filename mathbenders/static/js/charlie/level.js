import Terrain from './terrainManager.js'; // @Eytan - dislike how I'm having a complex dependency tree for each of these
// e.g. Level relies on Terrain relies on ..
export default class Level {
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


