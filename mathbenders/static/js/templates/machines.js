import Template from './template.js';
import * as P from './properties.js';

export class NumberRiser extends Template {
    static _icon = assets.textures.ui.icons.riser;
    static properties = [
         new P.Quantity({  
            name : "Quantity",
            onInitFn : (template,value) => {  template.quantity = value },
            onChangeFn : (template,value) => {  template.setQuantity(value); },
            getCurValFn : (template) => { return template.quantity },
            min : 0.1,
            max : 10
         }),
    ];
  
    quantity=1;
    setQuantity(value){
        this.quantity = quantity;
    }
    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        this.riser = assets.riser.resource.instantiateRenderEntity();
        this.riser.setLocalScale(2,2,2);
        let rs = this.riser.children;
        rs[0].children[0].render.meshInstances[0].material = Materials.gray; // funnel1
        rs[0].children[0].render.meshInstances[1].material = Materials.red; // funnel1
        // rs[1].children[0].render.meshInstances[0].material = Materials.orange;// funnel2
        rs[2].children[0].render.meshInstances[0].material = Materials.gray;// cage
        rs[3].children[0].render.meshInstances[0].material = Materials.gray; // riser thingie
        rs[4].children[0].render.meshInstances[0].material = Materials.red; // platform

        const receiverLocalPosition = new pc.Vec3(1.5,1,1.7);
        const receiver = new pc.Entity();
        receiver.addComponent('render',{type:'box'});
        receiver.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(2,2,2)});
        receiver.render.meshInstances[0].material = Materials.redAlpha;
        this.entity.addChild(receiver);
        receiver.setLocalPosition(receiverLocalPosition);
        receiver.setLocalScale(1.5,1.5,0.5);
        receiver.setLocalEulerAngles(0,90,0);
        this.receiver=receiver;
        receiver.collision.on('triggerenter',this.onTriggerEnter,this);
        this.entity.addChild(this.riser);
        this.updateColliderMap(); 
    }

    onCollectNumber(ni){
        // const amt = ni.fraction.numerator / ni.fraction.denominator;
        AudioManager.play({source:assets.sounds.plunger,position:this.entity.getPosition()})
        let heldNumber = new NumberSphereGfxOnly({
            position:this.entity.getPosition().add(new pc.Vec3(0,1.0,0)),
            properties:{"NumberSphereGfxOnly":ni.fraction}
        });
        ni.entity.destroy();
        this.entity.addChild(heldNumber.entity);
    }

    onTriggerEnter(other){
        const script = other.getComponent('script');
        const ni = other.script?.numberInfo;
        if (ni){
            console.log('collect');
            this.slurpNumber(ni);
        }
    }

    slurpNumber(ni){
        let ni2 = new NumberSphereGfxOnly({
            position:this.entity.getPosition().add(new pc.Vec3(0,1.0,0)),
            properties:{"NumberSphereGfxOnly":ni.fraction}
        });
        ni.entity.destroy();
        this.slurpStartTime = Date.now();
        pc.app.on('update',this.update,this);
        this.numberToSlurp = ni2;
    }

    localSlurpDest = new pc.Vec3(0,1,1.5);
    slurpStartTime = 0;
    update(dt){
        if (!this.numberToSlurp){
            pc.app.off('update',this.update,this);
        }else {
            let d = this.numberToSlurp.entity.getLocalPosition().sub(this.localSlurpDest).length();
            if (d < 0){
                
                console.log('coling');
                this.onCollectNumber(this.numberToSlurp);
            }else{
                let t = Date.now()-this.slurpStartTime/1000;
                let p = pc.Vec3.lerp(this.numberToSlurp.entity.getPosition(),this.entity.getPosition().add(this.localSlurpDest),t);
                this.numberToSlurp.entity.moveTo(p);
            }

        }
    }


}

export class NumberHoop extends Template {
    static isStaticCollider = true;
    static properties = [
         new P.FractionModifier({  
            name : "NumberHoop",
            onChangeFn : (template,value) => {  console.log("setfr"); template.setFraction(value); },
            getCurValFn : (template) => { console.log("getcurfrachoop"); return template.fraction },
            min : new Fraction(1,1),
            max : new Fraction(10,1)
         }),
    ];
  
    static _icon = assets.textures.ui.icons.hoop;

    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        const scale = 1.5;
        this.renderEntity = assets.numberHoop.resource.instantiateRenderEntity();
        this.entity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(scale));
        this.entity.addChild(this.renderEntity);
        this.renderEntity.setLocalEulerAngles(0,0,0);
        
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
        this.script.setFraction(new Fraction(2,1));
    }

    get fraction(){ return this.script.fraction; }
    setFraction(value) { 
        console.log("val:"+value);
        this.script.setFraction(value);
    }
}

export class NumberFaucet extends Template {
    static isStaticCollider = true;

    static _icon = assets.textures.ui.icons.faucet;
    static properties = [
         new P.FractionModifier({  
            name : "Fraction",
            onInitFn : (template,value) => {  template.fraction=value; },
            onChangeFn : (template,value) => {  template.setFraction(value); },
            getCurValFn : (template) => { return template.fraction },
         }),

    ]

    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        const scale = 2;
    
        this.renderEntity = assets.models.faucet.resource.instantiateRenderEntity();
        this.entity.addChild(this.renderEntity);
        this.renderEntity.setLocalEulerAngles(-90,0,0);

        this.entity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(scale));
        
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

        this.script = this.renderEntity.script.machineNumberFaucet;
    }

    fraction=new Fraction(2,1);
    setFraction(value){
        this.fraction=value;
        this.script.setFraction(value);
    }

    toJSON(){}

}

export class PlayerStart extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.builder.start;

    setup (args={}) {
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
                Player.entity.moveTo($this.entity.getPosition().clone().add(pc.Vec3.UP.clone().mulScalar(2)));
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

export class PlayerPortal extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.builder.portal;

    setup(args={}){
        this.entity.addComponent("script");
        this.entity.script.create("portal"); //,{attributes:{portalPlane:portalPlane}}); // comment out this line to see the geometry

        //const childOffset = new pc.Vec3(-2.75,-1,0.75)
        //portal.setLocalPosition(childOffset);
 
    }
}



