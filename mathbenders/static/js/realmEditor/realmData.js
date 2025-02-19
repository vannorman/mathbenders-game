import Level from './level.js'
export default class RealmData {
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

//    get currentLevel(){
//        // Estimate!
//        let min = Infinity;
//        let closest = null;
//        this.Levels.forEach(level=>{
//            let d = pc.Vec3.distance(
//                realmEditor.camera.entity.getPosition(),
//                level.terrain.entity.getPosition()); // equivalent to terrainData.terrainEntity.getPosition()?
//            if(d < min){
//                min = d;
//                closest = level;
//            }
//        });
//        return closest;
//    }
 
}


