export default class PlacedItem {
    // Each object placed by RealmBuilder, either by drag-and-drop or by "Loading a Realm", 
    // has a corresponding PlacedEntity object stored in memory.

    constructor(args={}){
        const { entity, templateName, level, iconTextureAsset } = args;
       this._entity = args.entity; 
       this._templateName = templateName;
       this._level = level;
       //this.iconTextureAsset = iconTextureAsset;
       entity.tags.add(Constants.Tags.BuilderItem);
        this.colliders = new Map();
        entity.getComponentsInChildren('collision').forEach(collisionComponent =>{
            this.colliders.set(collisionComponent,collisionComponent.enabled);
        });

 
    }

    

    enableColliders(){
        for (const [colliderComponent, activeState] of this.colliders) {
            if (activeState) colliderComponent.enabled = true;
        }
    }

    disableColliders(){
        for (const [colliderComponent, activeState] of this.colliders) {
            if (activeState) colliderComponent.enabled = false;
        }
    }

    get position(){return this._entity.getPosition().sub(this._level.terrain.centroid).trunc();}
    get rotation(){return this._entity.getRotation().trunc();}
    get templateName(){ return this._templateName; }
    get entity() {return this._entity; } 
    

    toJSON(){
        
        return {
            position : this._entity.getPosition().sub(this._level.terrain.centroid).trunc(),
            rotation : this._entity.getRotation().trunc(),
            templateName : this._templateName
        }
    }
}


