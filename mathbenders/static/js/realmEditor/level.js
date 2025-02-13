import Terrain from './terrain.js'; // @Eytan - dislike how I'm having a complex dependency tree for each of these
// e.g. Level relies on Terrain relies on ..
export default class Level {
    // A "Level" is a collection of a Terrain and LevelObjects. 
    // Multiple "Levels" exist in a single Realm and are all loaded at the same time.
    // Levels are positioned in world space apart from each other so as to prevent overlap.
     constructor(opts={}) {
        const { skipTerrainGen=false } = opts; 
//        this._placedItems = [];
        this.templateInstances = [];
        if (!skipTerrainGen){
            const newTerrain = new Terrain();
            newTerrain.generate();
            this._terrain = newTerrain;


        }
    }
    get terrain(){ return this._terrain;}
    set terrain(value) { this._terrain = value; }
//    get placedItems() { return this._placedItems;}
//    set placedItems(value) { this._placedItems=value;}
   
    registerPlacedTemplateInstance(templateInstance){
        this.templateInstances.push(templateInstance);
    }

    ClearPlacedTemplateInstances(){
        var entities = [];
        this.templateInstances.forEach(x=>{entities.push(x.entity);})
        entities.forEach(x=>{x.destroy();}) // each destroy instance also fires "deregister". awkward.
    }

    deRegisterPlacedTemplateInstance(templateInstance){
        const index = this.templateInstances.indexOf(templateInstance);
        if (index > -1) { // only splice array when item is found
            this.templateInstances.splice(index,1);
        } else {
            console.log("Oh dear!~ An entity was destroyed and deRegister was called, but that item wasn't found in level!!");
        }
    }

//    deRegisterPlacedItem(item){
//        const index = this.placedItems.indexOf(item);
//        if (index > -1) { // only splice array when item is found
//            this.placedItems.splice(index,1);
//        } else {
//            console.log("Oh dear!~ An entity was destroyed and deRegister was called, but that item wasn't found in level!!");
//        }
//    }


//    registerPlacedItem(item){
//        this.placedItems.push(item);
//    }

//    ClearPlacedItems(){
//        // console.log("Clear:"+this._placedItems.length+" items");
//        this._placedItems.forEach(x=>{
//            x._entity.destroy();
//        });
//    }


//    getPlacedItemByEntity(entity){
//        const g = entity.getGuid();
//        
//        // console.log('checking by:'+g+' across '+this.placedItems.length+' items');
//        const matches = this.placedItems.filter((x)=>{return x.entity.getGuid()===g});
//        if (matches.length > 0) return matches[0];
//        else return null;
//    }
 
    toJSON(){
        const templateInstances = [];
        this.templateInstances.forEach(x=>{
            const instanceData = x.getInstanceData({terrainCentroidOffset:this.terrain.centroid}); 
            templateInstances.push(instanceData);
        });
        const obj = {
            templateInstances : templateInstances,
            terrain : this._terrain,
        };
        return obj;//JSON.stringify(obj);
    }
    
    Clear(opts={}){
        const {deleteLevelObjects=true} = opts;
        this.terrain.destroy();
        if (deleteLevelObjects) {
    //        this.ClearPlacedItems();
            this.ClearPlacedTemplateInstances();
        }

    }
}


