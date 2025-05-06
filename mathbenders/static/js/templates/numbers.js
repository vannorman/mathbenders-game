import Template from './template.js';
import * as P from './properties.js';

export class NumberWall extends Template {
    static _icon = assets.textures.ui.icons.numberWall;
    static properties = [
         new P.FractionModifier({  
            name : "Fraction1",
            onInitFn : (template,value) => { template.fraction1 = value },
            onChangeFn : (template,value) => { template.setFraction1(value); }, 
            getCurValFn : (template) => { return template.fraction1; }, 
            min : new Fraction(-5,1),
            max : new Fraction(5,1),
         }),

         new P.FractionModifier({  
            name : "Fraction2",
            onInitFn : (template,value) => { template.fraction2 = value },
            onChangeFn : (template,value) => { template.setFraction2(value); }, 
            getCurValFn : (template) => { return template.fraction2; }, 
            min : new Fraction(-5,1),
            max : new Fraction(5,1),
         }),
         new P.Size({  
            name : "Size",
            min : 1,
            max : 10,
            onInitFn : (template,value) => { template.size = value },
            onChangeFn : (template,value) => { template.setSize(value); },
            getCurValFn : (template) => { return template.size; }
         }),
         new P.GenericData({  
            name : "WallState",
            // onChangeFn : null,
            onInitFn : (template,value) => {console.log("Generic init:"+JSON.stringify(value))},
            getCurValFn : (template) => { return template.currentState; }
         }),
     ]

    fraction1 = new Fraction(1,1);
    fraction2 = new Fraction(2,1);
    setFraction1(value){
        this.fraction1 = value;
        this.script.setFraction1(value);
    }
    setFraction2(value){
        this.fraction2 = value;
        this.script.setFraction2(value);
    }

    size = [1,2,2];
    setSize(value) { 
        this.size = value;
        this.script.setSize(value); 
    }

    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);

        // Initialize script
        this.entity.addComponent('script'); 
        this.entity.script.create('machineNumberWall',{attributes:{
            fraction1:this.fraction1,
            fraction2:this.fraction2,
            size:this.size,

            }});
        const $this = this;
        this.entity.script.machineNumberWall.onChangeFn = function(){$this.updateColliderMap(); }

        
        // Build the wall with correct properties.
        this.entity.script.machineNumberWall.rebuildWall();
    }

    get script(){
        return this.entity.script.machineNumberWall;

    }
}

export class NumberCube extends Template {

    static _icon = assets.textures.ui.numberCubePos;
    static _icon_neg = assets.textures.ui.numberCubeNeg;
    static isStaticCollider = true;

    static icon(properties){
        const pos = Object.values(properties).find(x=>x instanceof Fraction).numerator > 0;
        if (pos) return this._icon;
        else return this._icon_neg;
    }
    static isNumber = true;
    static isThrowable=false; // delete and have a map of throwable items?

    static properties = [
         new P.FractionModifier({  
            onInitFn : (template,value) => { template.setFraction(value);},// = value; },
            onChangeFn : (template,value) => { template.setFraction(value); }, 
            getCurValFn : (template) => { return template.fraction; }, 
         }),
    ]
    
    constructor(args={}) {
        // args['rigidbodyType'] = pc.RIGIDBODY_TYPE_KINEMATIC;
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        // cube.tags.add(Constants.Tags.PlayerCanPickUp);
        this.entity.addComponent("render",{ type : "box" });
        // sphere.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_DYNAMIC, restitution: 0.5, linearDamping : .85 });
        const s = this.entity.getLocalScale.x;
        this.entity.addComponent('rigidbody', {type:pc.RIGIDBODY_TYPE_KINEMATIC});
        this.entity.addComponent("collision", { type: "box", halfExtents: pc.Vec3.ONE.clone().mulScalar(0.5)});//new pc.Vec3(s/2, s/2, s/2)});
        this.entity.addComponent('script');
        this.entity.script.create('numberInfo',{attributes:{
            destroyFxFn:(x)=>{Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter});},
            fraction:this.fraction,
            type:NumberInfo.Type.Cube
            }});

    }

    
    setFraction(value) { 
        if (this.script){
            this.script.setFraction(value);
        }  else {
            this.fraction=value;
        }
   }

   get script(){ return this.entity.script.numberInfo; }

    static createHeldItem(properties){
        // The "incorrect" (?) way to create a non collision graphics only item; not a Template; 
        // createes issues if we try to ref its entity._templateInstance ref
        // awkward conflict between the version of this template that is graphics only or not... ughhh
        // Should this create a templateInstance or not? It can't be a NORMAL templateInstance since its gfxonly
        // For now, it's nOT a templateInstance, it's just an orphaned Entity which gets cleaned up immediately after use
        // const {fraction=new Fraction(3,1)}=args;
        console.log(properties)
        Game.p=properties;
        const fraction = properties.FractionModifier; // awkward data model.
        const cube = new pc.Entity("helditem");
        cube.addComponent("render",{ type : "box" });
        cube.addComponent('script');
        cube.script.create('numberInfo');//,{attributes:{ fraction:this.fraction, }});
        cube.script.numberInfo.setFraction(fraction);
        return new HeldItem({
            entity:cube,
        });
    }
}

export class NumberSphereGfxOnly extends Template {
    static properties = [
         new P.FractionModifier({  
            onInitFn : (template,value) => {template.fraction = value; },
            onChangeFn : (template,value) => { template.setFraction(value); }, 
            getCurValFn : (template) => { return template.fraction; }, 
         }),
    ]
    fraction = new Fraction(2,1);

    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        this.entity.addComponent("render",{ type : "sphere" });
        const s = this.entity.getLocalScale.x;
        this.entity.addComponent('script');
        let fraction = this.fraction ?? new Fraction(1,5);
        this.entity.script.create('numberInfo',{attributes:{
            destroyFxFn:(x)=>{Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter});},
            fraction:this.fraction,
        }});
         
    }

    get script(){ return this.entity.script.numberInfo; }
    
    setFraction(value) { 
        if( this.script) this.script.setFraction(value); 
        else this.fraction = value;
    }

}

export class NumberSphereRaw extends Template {
    static combinationHierarchy = 1;
    static isNumber = true;
//    fraction=new Fraction(1,3);
    static properties = [
         new P.FractionModifier({  
            onInitFn : (template,value) => { template.fraction = value; },
            onChangeFn : (template,value) => { template.setFraction(value); }, 
            getCurValFn : (template) => { return template.fraction;},
         }),
    ]
   
    fraction=new Fraction(2,1);
    constructor(args={}) {
        args['rigidbodyType'] = pc.RIGIDBODY_TYPE_DYNAMIC;
        super(args); 
        const {properties}=args;
        this.setProperties2(properties);
        // console.log("this prop was set:"+JSON.stringify(properties));
        this.entity.addComponent("render",{ type : "sphere" });
        const s = this.entity.getLocalScale.x;
        this.entity.addComponent("collision", { type: "sphere", halfExtents: new pc.Vec3(s/2, s/2, s/2)});
        this.entity.rigidbody.linearDamping = 0.5;
        this.entity.addComponent('script');
        this.entity.script.create('numberInfo',{attributes:{fraction:this.fraction}});
        // this.script = sphere.script.numberInfo;
    }

    setFraction(value) { 
        this.fraction=value;
        this.script.setFraction(value); 
    }
   

    get script(){
        return this.entity.script.numberInfo;
    }


}

export class NumberSphere extends NumberSphereRaw {
    static _icon = assets.textures.ui.numberSpherePos;
    static _icon_neg = assets.textures.ui.numberSphereNeg;

    static icon(properties){
        const pos = Object.values(properties).find(x=>x instanceof Fraction).numerator > 0;
        if (pos) return this._icon;
        else return this._icon_neg;
    }


    static isThrowable=true; // move to "Number.Type"  
   
    constructor(args={}) {

        super(args);

        this.entity.tags.add(Constants.Tags.PlayerCanPickUp);
        this.script.type = NumberInfo.Type.Sphere;
    }


    static createHeldItem(properties){
        // The "correct" (?) way to create the graphics version is one that is yet another Template, this one without collision.
        const options =  {
            properties : properties,
        } 
        let template = new NumberSphereGfxOnly(options);
        return new HeldItem({
            entity:template.entity,
        });
    }
}


