// .fix rigidbody state / save it and load it on levelbuilder start/stop.

//class TemplateState {
//    rigidbodyType,
//    colliderType
//}
//
//this.entity.colliders.forEach(x=>{this.physicalState[collider]=new TemplateState({rigidbody:static,collision:normal})})

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
        this.setup(args);// All templates need to be "setup" BEFORE updateColliderMap is called. But, this leads to "this" confusion between superclass and subclass; SomeClass extends Template { setup() } cannot refer to the "this" of that local class.
        if (properties) {
            // Can't do this until other constructors have finished..
            // circular / ordering error
            this.setProperties(properties);
        }
        this.updateColliderMap(); // All templates need to have their colliders registered. I don't want to do this in each indivdually.
        this.entity._templateInstance = this; // partial, incomplete ref
        GameManager.subscribe(this,this.onGameStateChange);
        this.entity.on('destroy',this.entityWasDestroyed,this);

    }

    entityWasDestroyed(){
        // console.log("%c destroyed "+this.name+":"+this.uuid.substr(0,5),"color:#f88")
        //cleanup
        GameManager.unsubscribe(this);
    }

    setup(args={}){
        // console.log("ERR: No setup method on "+this.constructor.name);
    }

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
        // Need to store both the rigidbody state and collision state.
        for (const [colliderComponent, activeState] of this.colliders) {
            if (activeState) colliderComponent.enabled = true;
        }
    }

    disableColliders(){
        for (const [colliderComponent, activeState] of this.colliders) {
            if (activeState) colliderComponent.enabled = false;
        }
    }

    onBeginDragByEditor(){
        this.disableColliders();
    }
    onEndDragByEditor(){
        this.enableColliders();
    }
    onGameStateChange(state){
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
        if (properties != {}){
            //console.log(properties);
        }
        this.constructor.propertiesMap.forEach(x=>{
            if (properties[x.name] !== undefined){
                const val = properties[x.name];
                // Are we "changing" or  "initting" here?
                // We have two ways to "modify" a template in this way
                // ONE, the template was instantiated and passed some properties[] and those need to be initialized, onInitFn()
                // TWO, the template was already created, and needs to be modified, onChangeFn()
                x.onInitFn(this,val);
            } else{
            }
        })
    }


    static createHeldItem(){
        console.log("huh? no createHeldGfx for this template:"+this.constructor);
        return null;
    }

}


