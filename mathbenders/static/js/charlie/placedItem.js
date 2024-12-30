export default class PlacedItem {
    // Each object placed by RealmBuilder, either by drag-and-drop or by "Loading a Realm", 
    // has a corresponding PlacedEntity object stored in memory.

    constructor(args={}){
        const { entity, templateName, level } = args;
       this._entity = args.entity; 
       this._templateName = templateName;
       this._level = level;
       entity.tags.add(Constants.Tags.BuilderItem);
       entity.on('destroy',function(){
            console.log('item was destroyed; did we update the save data model in realmEditor?');
        })
 
    }

    get position(){return this._entity.getPosition().sub(this._level.terrain.centroid).trunc();}
    get rotation(){return this._entity.getRotation().trunc();}
    get templateName(){ return this._templateName; }
    

    toJSON(){
        return {
            position : this._entity.getPosition().sub(this._level.terrain.centroid).trunc(),
            rotation : this._entity.getRotation().trunc(),
            template : this._template
        }
    }
}


