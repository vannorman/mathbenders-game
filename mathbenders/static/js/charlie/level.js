import Terrain from './terrain.js'; // @Eytan - dislike how I'm having a complex dependency tree for each of these
// e.g. Level relies on Terrain relies on ..
export default class Level {
    // A "Level" is a collection of a Terrain and LevelObjects. 
    // Multiple "Levels" exist in a single Realm and are all loaded at the same time.
    // Levels are positioned in world space apart from each other so as to prevent overlap.
     constructor(opts={}) {
        const { skipTerrainGen=false } = opts; 
        this._placedItems = [];
        if (!skipTerrainGen){
            const newTerrain = new Terrain();
            newTerrain.generate();
            this._terrain = newTerrain;

        }
    }
    get terrain(){ return this._terrain;}
    set terrain(value) { this._terrain = value; }
    get placedItems() { return this._placedItems;}
    set placedItems(value) { this._placedItems=value;}
   
    registerPlacedItem(item){
        this.placedItems.push(item);
    }

    ClearPlacedItems(){
        console.log("clearing?");
        this._placedItems.forEach(x=>{
            console.log("Clear! x ent;"+x._entity.name);
            console.log(x);
            x._entity.destroy();

        })

        //this._placedItems = [];
    }

    RemoveEntityFromPlacedItems(entity){
        const matched = this._placedItems.filter((x)=>x._entity.getGuid()==entity.getGuid())[0]
        if (matched) {
            const index = this._placedItems.indexOf(matched);
            console.log("remove entity;"+entity.name);
            this._placedItems.splice(index,1);
        } else {
            console.log("Failed to remove entity;"+entity.name);
        }

    }
    
    DestroyEntity(entity){
        const matched = this._placedItems.filter((x)=>x._entity.getGuid()==entity.getGuid())[0]
        if (matched) {
            const index = this._placedItems.indexOf(matched);
            this._placedItems.splice(index,1);
            entity.destroy();
        } else {
            console.log("Failed to destroy entity;"+entity);
        }
    }

    Clear(opts={}){
        const {deleteLevelObjects=true} = opts;
        this.terrain.destroy();
        if (deleteLevelObjects) {
            this.ClearPlacedItems();
        }

    }
}


