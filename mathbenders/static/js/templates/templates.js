var templateNameMap = {}

class Template {

    static name="TemplateSuper";
    static icon;
    static editablePropertiesMap=[];
    colliders = new Map();

    entity; // stores scale, position, and rotation;

    constructor(args={}) {
        const {position=pc.Vec3.ZERO,rotation=pc.Vec3.ZERO}=args;
        this.entity = new pc.Entity();
        const $this=this;
        pc.app.root.addChild(this.entity);
        this.entity.moveTo(position,rotation);
        this.entity.addComponent('script');
        this.entity.script.create('itemTemplateReference',{attributes:{itemTemplate:this}});
        this.name = this.constructor.name;
        this.entity.name = this.constructor.name;
        this.entity.tags.add(Constants.Tags.BuilderItem);
        this.setup();
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
           props[x.name] = x.getCurValFn(this.entity) 
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
                x.onChangeFn(this.entity,val);
            }
        })
    }

    destroy(){
        this.entity.destroy();
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

class NumberHoop extends Template {
    static { templateNameMap["NumberHoop"] = NumberHoop }
    static editablePropertiesMap = [
         {  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : "NumberHoop",
            property : FractionProperty, 
            onChangeFn : (entity,value) => { entity.getComponentsInChildren('machineHoop')[0].setFraction(value); },
            getCurValFn : (entity) => { return entity.getComponentsInChildren('machineHoop')[0].fraction },
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

    }
}

class NumberFaucet extends Template {

    static icon = assets.textures.ui.icons.faucet;
    static editablePropertiesMap = [
         {  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : "Fraction",
            property : FractionProperty, 
            onChangeFn : (entity,value) => { entity.getComponentsInChildren('machineNumberFaucet')[0].setFraction(value); },
            getCurValFn : (entity) => { return entity.getComponentsInChildren('machineNumberFaucet')[0].fraction },
         },

    ]

    setup(){
        const scale = 2;
    
        this.renderEntity = assets.models.faucet.resource.instantiateRenderEntity();
        this.entity.addChild(this.renderEntity);
        this.renderEntity.setLocalEulerAngles(-90,0,0);

        this.entity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(scale));
        this.fraction = new Fraction(1,2);
        
        this.renderEntity.addComponent('script');
        this.renderEntity.script.create('machineNumberFaucet',{attributes:{fraction:this.fraction}});

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
 
    }

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
                Game.player.moveTo($this.entity.getPosition().clone().add(pc.Vec3.UP.clone().mulScalar(3)));
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
            onChangeFn : (entity,value) => { entity.getComponentsInChildren('machineNumberWall')[0].setFraction1(value); },
            getCurValFn : (entity) => { return entity.getComponentsInChildren('machineNumberWall')[0].fraction1 },
         },

         {  
            name : "Fraction2",
            property : FractionProperty, 
            onChangeFn : (entity,value) => { entity.getComponentsInChildren('machineNumberWall')[0].setFraction2(value); },
            getCurValFn : (entity) => { return entity.getComponentsInChildren('machineNumberWall')[0].fraction2 },
         },
         {  
            name : "Size",
            property : SizeProperty, 
            onChangeFn : (entity,value) => { entity.getComponentsInChildren('machineNumberWall')[0].setSize(value); },
            getCurValFn : (entity) => { return entity.getComponentsInChildren('machineNumberWall')[0].size },
         },
    ]


    setup(){
        this.entity.addComponent('script'); 
        this.entity.script.create('machineNumberWall');
        // @Eytan, I have a PlacedItem problem here. PlacedItem 
        const $this = this;
        this.entity.script.machineNumberWall.onChangeFn = function(){$this.updateColliderMap(); }
        this.entity.script.machineNumberWall.rebuildWall();
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
            valueType : pc.Vec3,
            onChangeFn : (entity,value) => { entity.script.itemTemplateReference.itemTemplate.setScale(value);},
            getCurValFn : (entity) => { return entity.script.itemTemplateReference.itemTemplate.pad.getLocalScale() }, // todo: expect ItemTemplate, not Entity, here
         },
    ];
 

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
        // Custom set properties due to SCALE being serialized as JSON and needing to be inflated as Vec3.
        // TODO: Property should have a TYPE so that it knows how to be deserialized.  @Eytan
        if (scale instanceof pc.Vec3 == false) {
            scale = JsonUtil.ArrayToVec3(scale);
        }
        this.pad.setLocalScale(scale);
        this.pad.collision.halfExtents = this.pad.getLocalScale().clone().mulScalar(1/2);
    }

}

class Multiblaster extends Template {
    icon = assets.textures.ui.icons.multiblaster;
    static { templateNameMap["Multiblaster"] = Multiblaster }
    setup(){
        const blaster = assets.models.gadgets.multiblaster.resource.instantiateRenderEntity();
        blaster.addComponent('script'); 
        blaster.script.create('gadgetMultiblaster',{attributes:{
            onFireFn:()=>{AudioManager.play({source:assets.sounds.multiblasterFire,position:pc.Vec3.ZERO,volume:0.4,pitch:1,positional:false});},
            // createBulletFn:(p)=>{return Network.Instantiate.NumberSphere({position:p});}, // not sure why we passed this in as fn?
            //onSelectSound:()=>{AudioManager.play({source:assets.sounds.getGadget});},
            onPickupFn:()=>{AudioManager.play({source:assets.sounds.getGadget});},
            camera:Camera.main.entity,
        }}); 
        this.entity.addChild(blaster);
        blaster.script.create('objectProperties', {attributes:{ objectProperties:{templateName:this.constructor.name},  }}) 
  
    }
}

templateNameMap = { ...templateNameMap, ... {
    "NumberFaucet" : NumberFaucet,
    "NumberWall" : NumberWall,
    "PlayerStart" : PlayerStart,
    "PlayerPortal" : PlayerPortal,
    "CastleTurret" : CastleTurret,
    "CastleWall" : CastleWall,
    "BigConcretePad" : BigConcretePad,

}}

function getTemplateByName(name){
    return templateNameMap[name];
}
