import Terrain from './terrain.js'; 
// A "Level" is a collection of a Terrain and LevelObjects. 
// Multiple "Levels" exist in a single Realm and are all loaded at the same time.
// Levels are positioned in world space apart from each other so as to prevent overlap.



export default class Level {
    terrain;
    static CreateNewLevel(args={}){
        const { zoomCamera = true } = args;
        const level = new Level({skipTerrainGen:true,realmEditor:realmEditor});
        realmEditor.RealmData.Levels.push(level);
        
        level.terrain = new Terrain({data:{seed:Math.random()},realmEditor:this,level:level});
        const newTerrainPos = level.terrain.centroid;
        level.terrain.generate(); // race condiiton with regenerate() callbacks on TerrainTools change
        
        if (zoomCamera){
            const zoomFactor = 100;
            realmEditor.camera.translate({targetPivotPosition:newTerrainPos,targetZoomFactor:zoomFactor});
        }
        return level;    
    }


     constructor(opts={}) {
        const { skipTerrainGen=false, realmEditor } = opts; 
        this.realmEditor=realmEditor;
        this.templateInstances = [];
        if (!skipTerrainGen){
            const newTerrain = new Terrain({realmEditor:this.realmEditor,level:this});
            newTerrain.generate();
            this.terrain = newTerrain;
        }
    }
   
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
 
    toJSON(){
        const templateInstances = [];
        this.templateInstances.forEach(x=>{
            const instanceData = x.getInstanceData({terrainCentroidOffset:this.terrain.centroid}); 
            templateInstances.push(instanceData);
        });
        const obj = {
            templateInstances : templateInstances,
            terrain : this.terrain,
        };
        return obj;
        //JSON.stringify(obj);
    }
    
    Clear(opts={}){
        const {deleteLevelObjects=true} = opts;
        this.terrain.destroy();
        if (deleteLevelObjects) {
            this.ClearPlacedTemplateInstances();
        }

    }
}


