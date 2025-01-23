class Template {

    static name="TemplateSuper";
    static icon;
    static editablePropertiesMap;

    entity; // stores scale, position, and rotation;

    constructor(args) {
        const {position=pc.Vec3.ZERO,rotation=pc.Vec3.ZERO}=args;
        // Container entity
        this.entity = new pc.Entity();
        pc.app.root.addChild(this.entity);
        this.entity.moveTo(position,rotation);
        //globalThis[this.constructor.name] = this.constructor;
        this.entity.addComponent('script');
        this.entity.script.create('itemTemplateReference',{attributes:{itemTemplate:this.constructor.name}});
        this.name = this.constructor.name;
        this.entity.name = this.constructor.name;
        console.log("This name:"+this.constructor.name);
    }

}

class NumberHoop extends Template {
 
    static icon = assets.textures.ui.icons.hoop;
    constructor(args={}){
        super(args);

        const scale = 1.5;
        this.renderEntity = assets.numberHoop.resource.instantiateRenderEntity();
        this.entity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(scale));
        this.entity.addChild(this.renderEntity);
        
        const childOffset = new pc.Vec3(0,0,2);
        this.renderEntity.setLocalPosition(childOffset);
        this.setup(); 
        const {position=pc.Vec3.ZERO,rotation=pc.Vec3.ZERO}=args;
        //this.entity.moveTo(position,rotation);
    }

    setup(){
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

    get properties() {
//        return new PropertiesGroup(){
//            new FractionProperty(this),
//
//        }
    }
    set properties(properties) {}
    toJSON(){}
}

class NumberFaucet extends Template {

    static icon = assets.textures.ui.icons.faucet;
    static editablePropertiesMap = [
         {  property : FractionProperty, 
            onChangeFn : (value) => { this.entity.script.machineNumberFaucet.setFraction(value); } 
         },

    ]
    constructor(args={}){
        super(args);
        const scale = 2;
    
        this.renderEntity = assets.models.faucet.resource.instantiateRenderEntity();
        this.entity.addChild(this.renderEntity);
        this.renderEntity.setLocalEulerAngles(-90,0,0);

        this.entity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(scale));
        this.fraction = new Fraction(1,2);
        this.setup();    
    }

    setup(){
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

    get properties() {
//        return new PropertiesGroup(){
//            new FractionProperty(this),
//
//        }
    }
    set properties(properties) {}
    toJSON(){}

}

class PlayerStart extends Template {
    static icon = assets.textures.ui.builder.start;

    constructor(args={}){
        super(args);

        const childOffset = new pc.Vec3(0,0,0.5)
        const scale = 1.5
        
            this.entity.addComponent("collision", { type: "sphere", halfExtents: new pc.Vec3(6,6,6)});
            this.entity.addComponent('render', { type: 'sphere'  });
            this.entity.render.material = Materials.green;
            this.entity.setLocalScale(6,6,6);

            this.setup();

    }            

    setup () {
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

const templateNameMap = {
    "NumberHoop" : NumberHoop,
    "NumberFaucet" : NumberFaucet,
    "PlayerStart" : PlayerStart,
}


