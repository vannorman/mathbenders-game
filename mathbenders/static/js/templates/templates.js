import HeldItem from './heldItem.js';
import Template from './template.js';
import {Gadget,Multiblaster} from './gadgets.js';
import {Property,MoveProperty,SizeProperty,FractionProperty,ScaleProperty,RotateProperty} from './properties.js';
const globalProperties = [Property,MoveProperty,SizeProperty,FractionProperty,ScaleProperty,RotateProperty]; 
globalProperties.forEach(x=>{window[x.name]=x});

class NumberHoop extends Template {
    static editablePropertiesMap = [
         {  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : "NumberHoop",
            property : FractionProperty, 
            onChangeFn : (template,value) => {  template.fraction=value; },
            getCurValFn : (template) => { return template.fraction },
         },

    ]
  
    static icon = assets.textures.ui.icons.hoop;

    setup(){
        const scale = 1.5;
        this.renderEntity = assets.numberHoop.resource.instantiateRenderEntity();
        this.entity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(scale));
        this.entity.addChild(this.renderEntity);
        
        const childOffset = new pc.Vec3(0,0,2);
        this.renderEntity.setLocalPosition(childOffset);
        
        const hoop = this.renderEntity; // specific to architecture of NumberHoop
        hoop.addComponent('script');
        hoop.script.create('machineHoop',{
            attributes:{
                onCrossFn : (pos)=>{ 
                    AudioManager.play({source:assets.sounds.popHoop,position:pos});
                    Fx.Shatter({position:pos});
                },
                hoopMeshRenderAsset : assets.numberHoop.resource.renders[1],
                hoopTextureAsset : assets.textures.hoop,

                }});
        hoop.setEulerAngles(new pc.Vec3(-90,0,0));                        
        hoop.script.machineHoop.init();
        this.script = hoop.script.machineHoop;

    }

    get fraction(){ return this.script.fraction; }
    set fraction(value) { this.script.setFraction(value); }

}

class NumberFaucet extends Template {

    static icon = assets.textures.ui.icons.faucet;
    static editablePropertiesMap = [
         {  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : "Fraction",
            property : FractionProperty, 
            onChangeFn : (template,value) => {  template.fraction=value; },
            getCurValFn : (template) => { return template.fraction },
         },

    ]

    setup(){
        const scale = 2;
    
        this.renderEntity = assets.models.faucet.resource.instantiateRenderEntity();
        this.entity.addChild(this.renderEntity);
        this.renderEntity.setLocalEulerAngles(-90,0,0);

        this.entity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(scale));
        
        this.renderEntity.addComponent('script');
        this.renderEntity.script.create('machineNumberFaucet',{attributes:{fraction:new Fraction(1,2)}});

        this.renderEntity.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(0.75,0.75,4)}); 
        this.renderEntity.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        const renders = this.renderEntity.getComponentsInChildren('render');
        renders[0].enabled=false;
        renders[3].enabled=false;
        // TODO: HIre GLB artist lol
        renders[1].meshInstances[0].material=Materials.red;
        renders[1].meshInstances[1].material=Materials.gray;
        renders[1].meshInstances[3].material=Materials.gray;
        renders[2].meshInstances[0].material=Materials.red;
        renders[2].meshInstances[1].material=Materials.gray;
        renders[2].meshInstances[2].material=Materials.white;

        this.script = this.renderEntity.script.machineNumberFaucet;
    }
    
    get fraction(){ return this.script.fraction; }
    set fraction(value) { this.script.setFraction(value); }

    toJSON(){}

}

class PlayerStart extends Template {
    static icon = assets.textures.ui.builder.start;

    setup () {
        const childOffset = new pc.Vec3(0,0,0.5)
        const scale = 1.5
        
        this.entity.addComponent("collision", { type: "sphere", halfExtents: new pc.Vec3(6,6,6)});
        this.entity.addComponent('render', { type: 'sphere'  });
        this.entity.render.material = Materials.green;
        this.entity.setLocalScale(6,6,6);

        const $this = this;
        function onGameStateChange(state) {
            switch(state){
            case GameState.RealmBuilder:
                // ("enable save/load so we can start worldbuilding.")
                //console.log("Levelbuilder on");
                $this.entity.enabled=true;
                break;
            case GameState.Playing:
                //console.log("Levelbuilder off");
                Game.player.moveTo($this.entity.getPosition().clone().add(pc.Vec3.UP.clone().mulScalar(10)));
                $this.entity.enabled=false;
                break;
            }
        }
        GameManager.subscribe(this.entity,onGameStateChange);
        this.entity.tags.add(Constants.Templates.PlayerStart);
        pc.app.root.findByTag(Constants.Templates.PlayerStart).forEach(other => {
            // awkward singleton implementation .. may need to modify later ..
            if (other.getGuid() !== this.entity.getGuid()) other.destroy(); // only one start 
        });

   }

}

class NumberWall extends Template {
    static icon = assets.textures.ui.icons.numberWall;
    static editablePropertiesMap = [
         {  
            name : "Fraction1",
            property : FractionProperty, 
            onChangeFn : (template,value) => { template.fraction = value; }, 
            getCurValFn : (template) => { return template.fraction; }, 
         },

         {  
            name : "Fraction2",
            property : FractionProperty, 
            onChangeFn : (template,value) => { template.fraction = value; }, 
            getCurValFn : (template) => { return template.fraction; }, 
         },
         {  
            name : "Size",
            property : SizeProperty, 
            onChangeFn : (template,value) => { template.size = value; },
            getCurValFn : (template) => { return template.size; }
         },
    ]

    get fraction1() { return this.script.fraction1;}
    get fraction2() { return this.script.fraction2;}
    set fraction1(value) { this.script.setFraction1(value); }
    set fraction2(value) { this.script.setFraction2(value); }
    set size(value) { this.script.setSize(value); }
    get size() { return this.script.size; }


    setup(){
        this.entity.addComponent('script'); 
        this.entity.script.create('machineNumberWall');
        // @Eytan, I have a PlacedItem problem here. PlacedItem 
        const $this = this;
        this.entity.script.machineNumberWall.onChangeFn = function(){$this.updateColliderMap(); }
        this.entity.script.machineNumberWall.rebuildWall();
        this.script = this.entity.script.machineNumberWall;
    }
 
}

class PlayerPortal extends Template {
    static icon = assets.textures.ui.builder.portal;

    setup(){
        this.entity.addComponent("script");
        this.entity.script.create("portal"); //,{attributes:{portalPlane:portalPlane}}); // comment out this line to see the geometry

        //const childOffset = new pc.Vec3(-2.75,-1,0.75)
        //portal.setLocalPosition(childOffset);
 
    }
}

class CastleTurret extends Template {
    static icon = assets.textures.ui.icons.turret1;

    setup(){
        // Castle Pillar
        const pillarAsset = assets.models.castle_pillar;
        const pillarRender = pillarAsset.resource.instantiateRenderEntity();
        let pillarCollision = Game.addMeshCollider(pillarRender,pillarAsset,pc.RIGIDBODY_TYPE_KINEMATIC); // TODO performance: move to a box collider.

        // Set up collision groups and masks for castles not to intersect each other
        var COLLISION_GROUP_1 = 1;
        var COLLISION_GROUP_2 = 2;
        var ALL_GROUPS = 0xFFFFFFFF;

        pillarCollision.group = COLLISION_GROUP_1;
        pillarCollision.mask = ALL_GROUPS ^ COLLISION_GROUP_2;

        pillarRender.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        ApplyTextureAssetToEntity({entity:pillarRender,textureAsset:assets.textures.stone90}); 
        
        // Castle Top
        const topAsset = assets.models.castle_top;
        const topRender = topAsset.resource.instantiateRenderEntity();
        let topCollision = Game.addMeshCollider(topRender,topAsset,pc.RIGIDBODY_TYPE_STATIC); // todo performance change to box collider


        // Set up collision groups and masks for castles not to intersect each other
        topCollision.group = COLLISION_GROUP_1;
        topCollision.mask = ALL_GROUPS ^ COLLISION_GROUP_2;

        topRender.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_STATIC});
        ApplyTextureAssetToEntity({entity:topRender,textureAsset:assets.textures.stone90}); 
        
        this.entity.addChild(topRender);
        this.entity.addChild(pillarRender);
        topRender.setLocalEulerAngles(-90,0,0);
        topRender.setLocalPosition(new pc.Vec3(0,3.4,0));
        
        pillarRender.setLocalEulerAngles(-90,0,0);
        pillarRender.setLocalPosition(new pc.Vec3(0,0.0,0));
    }

}

class CastleWall extends Template {
    static icon = assets.textures.ui.icons.wall;

    setup(){ 
        
        const asset = assets.models.castle_wall;
        const render = asset.resource.instantiateRenderEntity();
        this.entity.addChild(render);
        const col = new pc.Entity("castlewall collider");
        col.addComponent('rigidbody', {type:pc.RIGIDBODY_TYPE_KINEMATIC});
        col.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(3,3.5,0.5)});
        col.setLocalPosition(0,0,0);
        let mat = ApplyTextureAssetToEntity({entity:render,textureAsset:assets.textures.stone}); 
        mat.diffuseMapTiling=new pc.Vec2(3,3); 
        mat.update();
        
        this.entity.addChild(col);
        render.setLocalPosition(new pc.Vec3(-2.75,-1,0.75));
    }
}

class BigConcretePad extends Template {
    static icon = assets.textures.ui.builder.concretePadBig;

    static editablePropertiesMap = [
         {  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : ScaleProperty.constructor.name,
            property : ScaleProperty,
            // valueType : pc.Vec3,
            onChangeFn : (template,value) => { template.scale = value; },
            getCurValFn : (template) => { return template.scale },
         },
    ];

    get scale(){ return this.pad.getLocalScale(); }
    set scale(value) { this.pad.setLocalScale(value); }

    setup(){
        const pad = new pc.Entity();
        pad.addComponent("render", {  type: "box" }); 
        pad.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_KINEMATIC, restitution: 0.5, });
        pad.addComponent("collision", { type: "box", halfExtents: pc.Vec3.ONE});
        this.pad = pad;
        this.setScale(new pc.Vec3(10,10,10));
        this.entity.addChild(pad);

    }

    setScale(scale){
        // after serialization, vec3(1,2,3) becomes [1,2,3]
        // Custom set properties due to SCALE being serialized as JSON and needing to be inflated as Vec3.
        // TODO: Property should have a TYPE so that it knows how to be deserialized.  @Eytan
        if (scale instanceof pc.Vec3 == false) {
            scale = JsonUtil.ArrayToVec3(scale);
        }
        this.pad.setLocalScale(scale);
        this.pad.collision.halfExtents = this.pad.getLocalScale().clone().mulScalar(1/2);
    }

}

class NumberSphere extends Template {
    static icon = assets.textures.ui.numberSpherePos;
    static icon_neg = assets.textures.ui.numberSphereNeg;
    static isThrowable=true;
    static editablePropertiesMap = [
         {  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : "NumberSphere", // if this changes, data will break
            property : FractionProperty, 
            onChangeFn : (template,value) => { template.fraction = value; }, 
            getCurValFn : (template) => { return template.fraction; }, 
         },
    ]
    
    constructor(args={}) {
        args['rigidbodyType'] = pc.RIGIDBODY_TYPE_DYNAMIC;
        super(args);
    }
 
    setup(){
        let sphere =this.entity;
        sphere.tags.add(Constants.Tags.PlayerCanPickUp);
        sphere.addComponent("render",{ type : "sphere" });
        // sphere.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_DYNAMIC, restitution: 0.5, linearDamping : .85 });
        const s = sphere.getLocalScale.x;
        sphere.addComponent("collision", { type: "sphere", halfExtents: new pc.Vec3(s/2, s/2, s/2)});
        sphere.addComponent('script');
        // sphere.script.create('pickUpItem',{}); // I don't think I want 1,000,000 pickUpItem scripts ..
        // Infact, I'd probably prefer not to have 1,000,000 NumberInfo scripts instead. Strictly speaking, each Number only needs its Fraction and collision, and a NumberManager can handle the rest.
        // Anyway, playerPickupService can check if collided with Number tag..?
        let fraction = new Fraction(2,1);
        sphere.script.create('numberInfo',{attributes:{
            destroyFxFn:(x)=>{Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter});},
            fraction:fraction,
            }});
        sphere.script.numberInfo.Setup();
        this.script = sphere.script.numberInfo;

    }

    get fraction(){ return this.script.fraction; }
    set fraction(value) { this.script.setFraction(value); }

    static createHeldItem(properties){
        // awkward conflict between the version of this template that is graphics only or not... ughhh
        // Should this create a templateInstance or not? It can't be a NORMAL templateInstance since its gfxonly
        // For now, it's nOT a templateInstance, it's just an orphaned Entity which gets cleaned up immediately after use
        // const {fraction=new Fraction(3,1)}=args;
        const fraction = properties.NumberSphere; // awkward data model.
        const sphere = new pc.Entity("helditem");
        sphere.addComponent("render",{ type : "sphere" });
        sphere.addComponent('script');
        sphere.script.create('numberInfo');//,{attributes:{ fraction:this.fraction, }});
        sphere.script.numberInfo.Setup();
        sphere.script.numberInfo.setFraction(fraction);
        return new HeldItem({
            entity:sphere,
        });
    }
}

class GadgetPickup extends Template {}
window['GadgetPickup'] = GadgetPickup; //awkward
class MultiblasterPickup extends GadgetPickup {
    static icon = assets.textures.ui.icons.multiblaster;

    static onCollect(){
        return Multiblaster;
    }

    setup(){

        // graphics

        this.entity.tags.add(Constants.Tags.PlayerCanPickUp);
        const blaster = assets.models.gadgets.multiblaster.resource.instantiateRenderEntity();
        ApplyTextureAssetToEntity({entity:blaster,textureAsset:assets.textures.gadget});
        this.entity.addChild(blaster);
        blaster.setLocalEulerAngles(0,-90,-90);
        blaster.setLocalPosition(pc.Vec3.UP);

        // pickup item 
        this.entity.addComponent('collision');
        this.entity.addComponent('rigidbody',{type:'kinematic'});

    }
}




window.templateNameMap = {
    "Template" : Template,

    "NumberSphere" : NumberSphere,
    "NumberFaucet" : NumberFaucet,
    "NumberHoop" : NumberHoop,
    "NumberWall" : NumberWall,
    "PlayerStart" : PlayerStart,
    "PlayerPortal" : PlayerPortal,
    "CastleTurret" : CastleTurret,
    "CastleWall" : CastleWall,
    "BigConcretePad" : BigConcretePad,
    "MultiblasterPickup" : MultiblasterPickup,
}

// Export all templates to global scope for use in rest of app
Object.entries(window.templateNameMap).forEach(([key,value])=>{
      window[key] = value;
    });
