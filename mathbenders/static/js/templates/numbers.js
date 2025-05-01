import Template from './template.js';
import * as P from './properties.js';

export class NumberWall extends Template {
    static _icon = assets.textures.ui.icons.numberWall;
    static propertiesMap = [
         new P.PropertyMap({  
            name : "Fraction1",
            property : P.FractionProperty, 
            onChangeFn : (template,value) => { template.fraction1 = value; }, 
            getCurValFn : (template) => { return template.fraction1; }, 
            min : new Fraction(-5,1),
            max : new Fraction(5,1),
         }),

         new P.PropertyMap({  
            name : "Fraction2",
            property : P.FractionProperty, 
            onChangeFn : (template,value) => { template.fraction2 = value; }, 
            getCurValFn : (template) => { return template.fraction2; }, 
            min : new Fraction(-5,1),
            max : new Fraction(5,1),
         }),
         new P.PropertyMap({  
            name : "Size",
            property : P.SizeProperty, 
            min : 1,
            max : 10,
            onChangeFn : (template,value) => { template.size = value; },
            getCurValFn : (template) => { return template.size; }
         }),
    ]

    get fraction1() { return this.script.fraction1;}
    get fraction2() { return this.script.fraction2;}
    set fraction1(value) { this.script.setFraction1(value); }
    set fraction2(value) { this.script.setFraction2(value); }
    set size(value) { this.script.setSize(value); }
    get size() { return this.script.size; }


    setup(args={}){
        this.entity.addComponent('script'); 
        this.entity.script.create('machineNumberWall');
        // @Eytan, I have a PlacedItem problem here. PlacedItem 
        const $this = this;
        this.entity.script.machineNumberWall.onChangeFn = function(){$this.updateColliderMap(); }
        this.entity.script.machineNumberWall.rebuildWall();
        this.script = this.entity.script.machineNumberWall;
    }
 
}

export class NumberCube extends Template {

    // TODO: Exclude collision bewteen cubes and cubes
    // Currently, when numberSphere collides with Numbercube, the sphere may remain; this is wrong; hiearchy should be cube remains.
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

    static propertiesMap = [
         new P.PropertyMap({  
            name : this.name, // if this changes, data will break 
            property : P.FractionProperty, 
            onInitFn : (template,value) => { template.fraction = value; },
            onChangeFn : (template,value) => { template.setFraction(value); }, 
            getCurValFn : (template) => { return template.fraction; }, 
         }),
    ]
    
    constructor(args={}) {
        // args['rigidbodyType'] = pc.RIGIDBODY_TYPE_KINEMATIC;
        super(args);
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
            }});

        this.script.type = NumberInfo.Type.Cube;

    }

    
    getFraction(){ 
        if (this.script){
            return this.script.fraction; 
        } else {
            return this.fraction;
        }
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
        const fraction = properties[this.name]; // awkward data model.
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
    static propertiesMap = [
         new P.PropertyMap({  
            name : this.name, // if this changes, data will break // Should be Fraction1?
            property : P.FractionProperty, 
            onInitFn : (template,value) => {template.fraction = value; },
            onChangeFn : (template,value) => { template.setFraction(value); }, 
            getCurValFn : (template) => { return template.fraction; }, 
         }),
    ]

    constructor(args={}){
        super(args);
        this.entity.addComponent("render",{ type : "sphere" });
        const s = this.entity.getLocalScale.x;
        this.entity.addComponent('script');
        let fraction = this.fraction ?? new Fraction(1,5);
        this.entity.script.create('numberInfo',{attributes:{
            destroyFxFn:(x)=>{Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter});},
            fraction:this.fraction,
            }});
         
    }
     setup(args={}){
   }

    get script(){ return this.entity.script.numberInfo; }
    
    getFraction(){ 
        if (this.script){
            return this.script.fraction; 
        } else{
            return this.fraction;
        }
    }
    setFraction(value) { 
        if( this.script) this.script.setFraction(value); 
        else this.fraction = value;
    }

}

export class NumberSphereRaw extends Template {
    static combinationHierarchy = 1;
    static isNumber = true;
//    fraction=new Fraction(1,3);
   
    constructor(args={}) {
        args['rigidbodyType'] = pc.RIGIDBODY_TYPE_DYNAMIC;
        super(args); 
        this.entity.addComponent("render",{ type : "sphere" });
        const s = this.entity.getLocalScale.x;
        this.entity.addComponent("collision", { type: "sphere", halfExtents: new pc.Vec3(s/2, s/2, s/2)});
        this.entity.rigidbody.linearDamping = 0.5;
        this.entity.addComponent('script');
        this.entity.script.create('numberInfo',{attributes:{
            destroyFxFn:(x)=>{Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter});},
            fraction:this.fraction,
            }});
        if (this.fraction){
            // null if add two and result is zero? What a mess
            this.entity.script.numberInfo.setFraction(this.fraction); //ugh
        }
        // this.script = sphere.script.numberInfo;

    }

    getFraction(){ 
        // Is there ever a case the script hasn't been created yet? but we stil want the fraction?
        if (this.script){
            return this.script.fraction; 
        } else {
            console.log("Shouldn?");
            return this.fraction;
        }
    }
    setFraction(value) { 
        this.script.setFraction(value); 
    }
   

    get script(){
        return this.entity.script.numberInfo;
    }


}

export class NumberSphere extends NumberSphereRaw {
    static propertiesMap = [
         new P.PropertyMap({  
            name : this.name, // if this changes, data will break // Should be Fraction1?
            property : P.FractionProperty, 
            onChangeFn : (template,value) => { template.setFraction(value); }, 
            onInitFn : (template,value) => { template.fraction = value; },
            getCurValFn : (template) => { return template.getFraction(); }, 
         }),
    ]
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
        const fraction = properties[this.name];//NumberSphere; // awkward data model.
        const options =  {
            properties : {
               NumberSphereGfxOnly : fraction
            }
        } 
        let template = new NumberSphereGfxOnly(options);
        return new HeldItem({
            entity:template.entity,
        });
    }
}


