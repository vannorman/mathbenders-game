export default class Template {

    static _icon;
    static icon(properties={}) { return this._icon};
    static propertiesMap=[];
    static isThrowable = false;
    static isStaticCollider = false;
    colliders = new Map();
    uuid;

    entity; // stores scale, position, and rotation;

    static get isGadget(){ return false;  }

    static findEntityByUuid(uuid){
        let cont = true;
        let ret = null;
        pc.app.root.getComponentsInChildren('entity').forEach(x=>{
            if (cont && x._templateInstance && x._templateInstance.uuid == uuid){
                cont = false;
                ret = x;
            }
        });
        return ret;
    }

    constructor(args={}) {
        // NOTE: "properties" arg will contain the specific settings per template (e.g. Fraction) 
        // and must match editablePropertyMap as defined per template
        var {
            position=pc.Vec3.ZERO,
            rotation=pc.Vec3.ZERO,
            uuid=null,
            properties={},
            rigidbodyType='none',
            rigidbodyVelocity=pc.Vec3.ZERO,
        }=args;
        this.entity = new pc.Entity(this.constructor.name);
        if (uuid==null){
            uuid=crypto.randomUUID();
        }
        this.uuid=uuid;

        const $this=this;
        pc.app.root.addChild(this.entity);
        this.entity.moveTo(position,rotation);
        if (rigidbodyType != 'none'){
            //console.log("T;"+rigidbodyType+" on:"+this.name);
            this.entity.addComponent('rigidbody',{type:rigidbodyType});
            this.entity.rigidbody.linearVelocity = rigidbodyVelocity;
        }
        this.entity.addComponent('script');
        this.name = this.constructor.name;

         // this.entity.tags.add(Constants.Tags.BuilderItem); // why ..? Sure?
        this.setup(args);
        if (properties) {
            this.setProperties(properties);
        }
        this.updateColliderMap();
        this.entity._templateInstance = this; // partial, incomplete ref

    }

    setup(args={}){console.log("ERR: No setup method on "+this.constructor.name);}

    duplicate() {
        let copies = []; 
        let copy = { // copy or duplicate template should be its own class.
            data : this.getInstanceData(),
            Template : this.constructor,
        }
        copies.push(copy);
        return { copies:copies};
    }

    updateColliderMap(){
        this.colliders = new Map();
        this.entity.getComponentsInChildren('collision').forEach(collisionComponent =>{
            this.colliders.set(collisionComponent,collisionComponent.enabled);
            const r = collisionComponent.entity.rigidbody;
            if (r && this.constructor.isStaticCollider){
//                console.log("static:"+this.entity.name);
                // static colliders do not collide each other; set rigidbody group and mask accordingly
                r.group = Constants.CollisionLayers.FixedObjects;
                r.mask = pc.BODYMASK_ALL & ~r.group;
                const $this = this;
                const debugCollisions = false;
                if (debugCollisions) {
                    collisionComponent.on('collisionstart',
                        function(result){
                            let intervalFn = $this.entity.getGuid()+"_"+result.other.getGuid();
                            window[intervalFn] = setInterval(function(){
                                if (!result.other) {
                                    clearInterval(window[intervalFn]);
                                }
                                if (!result.other.rigidbody) {
                                    clearInterval(window[intervalFn]);
                                    console.log("%c HUH? Where is this guy ","color:red;font-weight:bold;");
                                    window.oo = result.other;
                                    console.log(result.other);
                                }
                                console.log($this.entity.name+" hit "+result.other.name+" g1:"+r.group+", m1:"+r.mask+",g2:"+result.other.rigidbody?.group+",m2:"+result.other.rigidbody?.mask);
                            },2000);     
                        });
                    collisionComponent.on('collisionend', 
                        function(result){
                            let intervalFn = $this.entity.getGuid()+"_"+result.getGuid();
                            clearInterval(window[intervalFn]);
                        });
                    }
                }
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
        // awkward that this is irrelevant for gadgets being held in inventory
        // and that we overwrite this in Gadget get properties() {return this.ammo....}
        const props = {};
        this.constructor.propertiesMap.forEach(x=>{
           props[x.name] = x.getCurValFn(this) 
        });
        return props;
    }

    getInstanceData(args={}){
        const {terrainCentroidOffset = pc.Vec3.ZERO} = args;
        return {
            templateName : this.constructor.name,
            uuid : this.uuid,
            position : this.entity.getPosition().sub(terrainCentroidOffset).trunc(),
            rotation : this.entity.getEulerAngles().trunc(),
            properties : this.properties,
        }
    }

    setProperties(properties) {
        // Note that all data here is stored in the *game entity* not in the template instance.
        this.constructor.propertiesMap.forEach(x=>{
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


