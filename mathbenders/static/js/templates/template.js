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
    static properties=[];
    static isThrowable = false;
    static isStaticCollider = false;
    colliders = new Map();
    uuid;

    static {

    }

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
        // All templates need to have their colliders registered. I don't want to do this in each indivdually.
        // But, now some templates have individual colliders created *after* constructor here, so this must be called in each of them
        this.updateColliderMap(); 
        this.entity._templateInstance = this; // partial, incomplete ref
        GameManager.subscribe(this,this.onGameStateChange);
        this.entity.on('destroy',this.entityWasDestroyed,this);
    }

    onInflated(){}

    entityWasDestroyed(){
        // console.log("%c destroyed "+this.name+":"+this.uuid.substr(0,5),"color:#f88")
        //cleanup
        GameManager.unsubscribe(this);
    }

    setup(args={}){
        // console.log("ERR: No setup method on "+this.constructor.name);
    }

    duplicate() {
        let copy = { // copy or duplicate template should be its own class.
            data : this.getInstanceData(),
            Template : this.constructor,
        }

        const copyDelta = realmEditor.camera.entity.forward.flat().normalize().mulScalar(20); // copy "north" from Camera view
        let p = copy.data.position.clone().add(copyDelta);
        p = Utils.getGroundPosFromPos(p);
        let c = realmEditor.InstantiateTemplate({
            ItemTemplate:copy.Template,
            position:p,
            rotation:copy.data.rotation,
            properties:copy.data.properties,
        });
        realmEditor.editItem({entity:c.entity});
 
    }

    updateColliderMap(){
        this.colliders = new Map();
        this.entity.getComponentsInChildren('collision').forEach(collisionComponent =>{
            this.colliders.set(collisionComponent,collisionComponent.enabled);
            const r = collisionComponent.entity.rigidbody;
            if (r && this.constructor.isStaticCollider){
                // console.log("static:"+this.entity.name);
                // static colliders do not collide each other; set rigidbody group and mask accordingly
                r.group = Constants.CollisionLayers.FixedObjects;
                r.mask = pc.BODYMASK_ALL & ~r.group;
                const $this = this;
                /*
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
                    */

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
        if (this.constructor.properties){
            
            this.constructor.properties.forEach(x=>{
               if (x.getCurValFn) props[x.name] = x.getCurValFn(this) 
            
            });
            return props;
        } else {
//            console.log("none.rpops");
        }
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

    setProperties2(properties) {
        if (typeof properties == "undefined" || properties == {}){
            return;
            //console.log(properties);
        }
        this.constructor.properties.forEach(x=>{
            if (typeof properties[x.name] !== 'undefined'){
                const val = properties[x.name];
                x.onInitFn(this,val);
            }
        });
    }



    static createHeldItem(){
        console.log("huh? no createHeldGfx for this template:"+this.constructor);
        return null;
    }

    updateCollider(args){
        const{colEnt}=args;
        colEnt.enabled=false;
        Ammo.destroy(colEnt.collision.shape);
        colEnt.collision.shape = null;
        for (const mesh of colEnt.collision.render.meshes) {
            delete pc.app.systems.collision._triMeshCache[mesh.id];
        }
        colEnt.enabled=true;
    }

    updateTextureTiling(args={}){
        var {ent=null,scale=null,density=3}=args;
        if (ent == null) ent = this.entity.getComponentsInChildren('render')[0].entity;
        if (scale == null) scale = ent.getScale();
        const mat = ent.render.meshInstances[0].material;
        mat.diffuseMapTiling = scale.clone().mulScalar(1/density);
        mat.update();
    }



}


