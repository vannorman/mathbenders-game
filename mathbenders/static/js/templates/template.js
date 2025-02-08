export default class Template {

    static name="TemplateSuper";
    static icon;
    static editablePropertiesMap=[];
    static isThrowable = false;
    colliders = new Map();

    entity; // stores scale, position, and rotation;

    constructor(args={}) {
        const {
            position=pc.Vec3.ZERO,
            rotation=pc.Vec3.ZERO,
            properties={},
            rigidbodyType='none',
            rigidbodyVelocity=pc.Vec3.ZERO,
        }=args;
        this.entity = new pc.Entity();

        const $this=this;
        pc.app.root.addChild(this.entity);
        this.entity.moveTo(position,rotation);
        if (rigidbodyType != 'none'){
            this.entity.addComponent('rigidbody',{type:rigidbodyType});
            this.entity.rigidbody.linearVelocity = rigidbodyVelocity;
        }
        this.entity.addComponent('script');
        this.entity._template = this;
        this.name = this.constructor.name;
        this.entity.name = this.constructor.name;

         // this.entity.tags.add(Constants.Tags.BuilderItem); // why ..? Sure?
        this.setup();
        if (properties) {
            this.setProperties(properties);
        }
        this.updateColliderMap();



    }

    setup(){console.log("ERR: No setup method on "+this.constructor.name);}

    updateColliderMap(){
        this.colliders = new Map();
        this.entity.getComponentsInChildren('collision').forEach(collisionComponent =>{
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

    get properties() {
        const props = {};
        this.constructor.editablePropertiesMap.forEach(x=>{
           props[x.name] = x.getCurValFn(this) 
        });
        return props;
    }

    getInstanceData(args={}){
        const {terrainCentroidOffset = pc.Vec3.ZERO} = args;
        return {
            templateName : this.constructor.name,
            position : this.entity.getPosition().sub(terrainCentroidOffset).trunc(),
            rotation : this.entity.getEulerAngles().trunc(),
            properties : this.properties,
        }
    }

    setProperties(properties) {
        // Note that all data here is stored in the *game entity* not in the template instance.
        this.constructor.editablePropertiesMap.forEach(x=>{
            if (properties[x.name] !== undefined){
                const val = properties[x.name];
                x.onChangeFn(this,val);
            }
        })
    }

    destroy(){
        this.entity.destroy();
    }

    static createHeldItem(){
        console.log("huh? no createHeldGfx for this template:"+this.constructor);
        return null;
    }

//    toJSON(){
    // Handle this in Level.toJson()?
//
//        return {
//            position : this.entity.getPosition().sub(this.level.terrain.centroid).trunc(), // I hate how this is here
//            rotation : this.entity.getEulerAngles().trunc(),
//            templateName : this.constructor.name,
//            properties : this.properties,
//        }
//    }
}


