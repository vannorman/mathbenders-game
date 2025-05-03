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
        this.platform =rs[4].children[0];
        this.platform.render.meshInstances[0].material = Materials.red; // platform
        this.platformC = new pc.Entity();
        this.platformC.addComponent('render',{type:'box'});
        this.platform.addChild(this.platformC);
        this.platformC.setLocalPosition(0,1.75,0);
        this.platformC.setLocalScale(2,0.2,2);
        this.platformC.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(2,0.2,2)});
        this.platformC.addComponent('rigidbody',{type:'kinematic'});
        Game.p=this;

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
        pc.app.on('update',this.update,this);
    }


    entityWasDestroyed(){
        super.entityWasDestroyed();
        pc.app.off('update',this.update);
    }

    riseFactor = 3;

    onCollectNumber(ni){
        // const amt = ni.fraction.numerator / ni.fraction.denominator;
        let heldNumber = new NumberSphereGfxOnly({
            properties:{"NumberSphereGfxOnly":ni.fraction}
        });
        ni.entity.destroy();
        this.entity.addChild(heldNumber.entity);
        heldNumber.entity.setLocalPosition(0,1,0);
        const riseAmt = ni.fraction.numerator/ni.fraction.denominator * this.riseFactor;
        this.platformTargetPosY = riseAmt;
        this.setState(NumberRiser.State.Rising);
        this.riseTime = 0;

    }

    platformTargetPosy=0;

    onTriggerEnter(other){
        switch(this.state){
            case NumberRiser.State.Ready:
            this.trySlurpNumber(other);
            break;
            default:break;
        }
   }

   trySlurpNumber(other){
        const script = other.getComponent('script');
        const ni = other.script?.numberInfo;
        if (ni){
            this.slurpNumber(ni);
        }
 
   }

    slurpNumber(ni){
        AudioManager.play({source:assets.sounds.plunger,position:this.entity.getPosition()})
        let ni2 = new NumberSphereGfxOnly({
            position:this.slurpedStartPos,
            properties:{"NumberSphereGfxOnly":ni.fraction}
        });
        ni.entity.destroy();
        this.slurpTime = 0;
        this.numberToSlurp = ni2;
        this.setState(NumberRiser.State.Slurping);
    }

    static State = {
        Ready : 0,
        Slurping : 1,
        Rising : 2,
    };
    state = NumberRiser.State.Ready;
    get collectedTargetPos() { return this.entity.getPosition().clone().add(pc.Vec3.UP); }
    get slurpedStartPos() { return this.entity.getPosition().clone().add(new pc.Vec3(1.5,1,1.5));}
    get slurpedTargetPos() { return this.entity.getPosition().clone().add(new pc.Vec3(0.8,1,1.5));}
    setState(state){
        this.state=state;
    }
    slurpTime=0;
    riseTime=0;
    update(dt){
        switch(this.state){

        case NumberRiser.State.Slurping:
            let a = this.numberToSlurp.entity.getPosition();
            let b = this.slurpedTargetPos;
            let d = a.distance(b);
            if (d < 0.1){
                this.onCollectNumber(this.numberToSlurp);
                this.numberToSlurp.entity.moveTo(this.collectedTargetPos);    
            }else{
                this.slurpTime += dt;
                const slurpDuration = 2;
                const t = this.slurpTime/slurpDuration;
                let p = new pc.Vec3().lerp(this.numberToSlurp.entity.getPosition(),this.slurpedTargetPos,t);
                this.numberToSlurp.entity.moveTo(p);
                if (this.slurpTime > slurpDuration){
                    this.onCollectNumber(this.numberToSlurp);
                    this.numberToSlurp.entity.moveTo(this.collectedTargetPos);    
                    
                }
            }
            break;
        case NumberRiser.State.Rising:
            this.riseTime+=dt;
            const riseDuration = 3;
            const t= this.riseTime/riseDuration;
            let y = Math.lerp(this.platform.getLocalPosition().y,this.platformTargetPosY,t);
            this.platform.setLocalPosition(0,y,0);

            if (Math.abs(y - this.platformTargetPosY) < 0.1){
                this.setState(NumberRiser.State.Ready);
            }
            break;

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



