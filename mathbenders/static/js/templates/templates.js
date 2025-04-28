import Template from './template.js';
import { Gadget } from './gadgets/base.js';
import { Sword } from './gadgets/sword.js';
import { Multiblaster } from './gadgets/multiblaster.js';
import {PropertyMap,Property,CopyProperty,QuantityProperty,GroupProperty,MoveProperty,SizeProperty,FractionProperty,ScaleProperty,BasicProperties} from './properties.js';
import {Tree1} from './trees.js';
import {Group} from './groups.js';
import HeldItem from './gadgets/heldItem.js';
const globalProperties = [Property,QuantityProperty,MoveProperty,CopyProperty,SizeProperty,FractionProperty,ScaleProperty,BasicProperties]; 
globalProperties.forEach(x=>{window[x.name]=x});

class NumberHoop extends Template {
    static isStaticCollider = true;
    static propertiesMap = [
         new PropertyMap({  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : "NumberHoop",
            property : FractionProperty, 
            onChangeFn : (template,value) => {  template.fraction=value; },
            getCurValFn : (template) => { return template.fraction },
         }),

    ]
  
    static _icon = assets.textures.ui.icons.hoop;

    setup(args={}){
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
    set fraction(value) { this.script.setFraction(value); }
}

class NumberFaucet extends Template {
    static isStaticCollider = true;

    static _icon = assets.textures.ui.icons.faucet;
    static propertiesMap = [
         new PropertyMap({  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : "Fraction",
            property : FractionProperty, 
            onChangeFn : (template,value) => {  template.fraction=value; },
            getCurValFn : (template) => { return template.fraction },
         }),

    ]

    setup(args={}){
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

class NumberWall extends Template {
    static _icon = assets.textures.ui.icons.numberWall;
    static propertiesMap = [
         new PropertyMap({  
            name : "Fraction1",
            property : FractionProperty, 
            onChangeFn : (template,value) => { template.fraction1 = value; }, 
            getCurValFn : (template) => { return template.fraction1; }, 
         }),

         new PropertyMap({  
            name : "Fraction2",
            property : FractionProperty, 
            onChangeFn : (template,value) => { template.fraction2 = value; }, 
            getCurValFn : (template) => { return template.fraction2; }, 
         }),
         new PropertyMap({  
            name : "Size",
            property : SizeProperty, 
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

class PlayerPortal extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.builder.portal;

    setup(args={}){
        this.entity.addComponent("script");
        this.entity.script.create("portal"); //,{attributes:{portalPlane:portalPlane}}); // comment out this line to see the geometry

        //const childOffset = new pc.Vec3(-2.75,-1,0.75)
        //portal.setLocalPosition(childOffset);
 
    }
}

class CastleTurret extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.turret1;

    setup(args={}){
        // Castle Pillar
        const pillarAsset = assets.models.castle_pillar;
        const pillarRender = pillarAsset.resource.instantiateRenderEntity();
        let pillarCollision = Utils.addMeshCollider(pillarRender,pillarAsset,pc.RIGIDBODY_TYPE_KINEMATIC); // TODO performance: move to a box collider.

        pillarRender.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        ApplyTextureAssetToEntity({entity:pillarRender,textureAsset:assets.textures.stone90}); 
        
        // Castle Top
        const topAsset = assets.models.castle_top;
        const topRender = topAsset.resource.instantiateRenderEntity();
        let topCollision = Utils.addMeshCollider(topRender,topAsset,pc.RIGIDBODY_TYPE_STATIC); // todo performance change to box collider

        topRender.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
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
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.wall;

    setup(args={}){ 
        
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

class ConcretePad extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.builder.concretePad;
    static propertiesMap = [
         new PropertyMap({  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : ScaleProperty.constructor.name,
            property : ScaleProperty,
            // valueType : pc.Vec3,
            onChangeFn : (template,value) => {  template.scale = value; },
            getCurValFn : (template) => { return template.scale },
            min:0.5,
            max:100,
         }),
    ];

    get scale(){ return this.pad.getLocalScale(); }
    set scale(value) { 
        this.pad.setLocalScale(value); 
        this.updateHalfExtents(); 
        this.updateTextureTiling();
    }

    updateTextureTiling(){
        const mat = this.pad.render.meshInstances[0].material;
        const x = this.pad.getLocalScale().x / 3;
        const y = this.pad.getLocalScale().z / 3;
        mat.diffuseMapTiling = new pc.Vec2(x,y);
        mat.update();


    }

    updateHalfExtents(){
        this.pad.collision.halfExtents = this.pad.getLocalScale().clone().mulScalar(0.5);
    }

    static defaultScale = new pc.Vec3(10,10,10);
    setup(args={}){
        const pad = new pc.Entity("concrete pad");
        pad.addComponent("render", {  type: "box" }); 
        pad.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_KINEMATIC, restitution: 0.5, });
        pad.addComponent("collision", { type: "box"});
        let mat = ApplyTextureAssetToEntity({entity:pad,textureAsset:assets.textures.terrain.concrete1});
        mat.diffuseMapTiling=new pc.Vec2(3,3); 
        mat.update();

        this.pad = pad;
        this.scale = this.constructor.defaultScale; // new pc.Vec3(10,10,10); //this.defaultScale;
        this.entity.addChild(pad);

    }

}

class BigConcretePad extends ConcretePad { 
    static _icon = assets.textures.ui.builder.concretePadBig;
    static defaultScale = new pc.Vec3(50,20,50);
}


class NumberCube extends Template {

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
         new PropertyMap({  
            // awkward but, we follow the pattern that the name is my constructor name unless otherwise noted.
            name : this.name, // if this changes, data will break 
            property : FractionProperty, 
            onChangeFn : (template,value) => { template.fraction = value; }, 
            getCurValFn : (template) => { return template.fraction; }, 
         }),
    ]
    
    constructor(args={}) {
        // args['rigidbodyType'] = pc.RIGIDBODY_TYPE_KINEMATIC;
        super(args);
    }
 
    setup(args={}){
        let cube =this.entity;
        // cube.tags.add(Constants.Tags.PlayerCanPickUp);
        cube.addComponent("render",{ type : "box" });
        // sphere.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_DYNAMIC, restitution: 0.5, linearDamping : .85 });
        const s = cube.getLocalScale.x;
        cube.addComponent('rigidbody', {type:pc.RIGIDBODY_TYPE_KINEMATIC});
        cube.addComponent("collision", { type: "box", halfExtents: pc.Vec3.ONE.clone().mulScalar(0.5)});//new pc.Vec3(s/2, s/2, s/2)});
        cube.addComponent('script');
        // sphere.script.create('pickUpItem',{}); // I don't think I want 1,000,000 pickUpItem scripts ..
        // Infact, I'd probably prefer not to have 1,000,000 NumberInfo scripts instead. Strictly speaking, each Number only needs its Fraction and collision, and a NumberManager can handle the rest.
        // Anyway, playerPickupService can check if collided with Number tag..?
        cube.script.create('numberInfo');//,{attributes:{ fraction:this.fraction, }});
        cube.script.numberInfo.Setup();
        cube.script.numberInfo.setFraction(new Fraction(2,1));

        this.script = cube.script.numberInfo;
    }

    get fraction(){ return this.script.fraction; }
    set fraction(value) { this.script.setFraction(value); }

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
        cube.script.numberInfo.Setup();
        cube.script.numberInfo.setFraction(fraction);
        return new HeldItem({
            entity:cube,
        });
    }
}

class NumberSphereGfxOnly extends Template {
    static propertiesMap = [
         new PropertyMap({  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : this.name, // if this changes, data will break // Should be Fraction1?
            property : FractionProperty, 
            onChangeFn : (template,value) => { template.fraction = value; }, 
            getCurValFn : (template) => { return template.fraction; }, 
         }),
    ]

     setup(args={}){
        let sphere = this.entity;
        sphere.addComponent("render",{ type : "sphere" });
        const s = sphere.getLocalScale.x;
        sphere.addComponent('script');
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

}

export class NumberSphereRaw extends Template {
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
        this.entity.script.numberInfo.Setup();
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
        console.log("getscript on sphere");
        return this.entity.script.numberInfo;
    }


}

export class NumberSphere extends NumberSphereRaw {
    static propertiesMap = [
         new PropertyMap({  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : this.name, // if this changes, data will break // Should be Fraction1?
            property : FractionProperty, 
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


    static isThrowable=true; 
   
    constructor(args={}) {
        super(args);
        this.entity.tags.add(Constants.Tags.PlayerCanPickUp);
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

class GadgetPickup extends Template {}
window['GadgetPickup'] = GadgetPickup; //awkward
class MultiblasterPickup extends GadgetPickup {
    static _icon = assets.textures.ui.icons.multiblaster;
    static isStaticCollider = true;

    static onCollect(){
        return Multiblaster;
    }

    setup(args={}){

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


class SwordPickup extends GadgetPickup {
    static _icon = assets.textures.ui.icons.sword;
    static isStaticCollider = true;

    static onCollect(){
        return Sword;
    }

    setup(args={}){

        // graphics

        this.entity.tags.add(Constants.Tags.PlayerCanPickUp);
        const sword = assets.models.gadgets.sword.resource.instantiateRenderEntity();
        ApplyTextureAssetToEntity({entity:sword,textureAsset:assets.textures.gadget});
        this.entity.addChild(sword);
        sword.setLocalEulerAngles(90,0,90);
        sword.setLocalPosition(pc.Vec3.UP);

        // pickup item 
        this.entity.addComponent('collision');
        this.entity.addComponent('rigidbody',{type:'kinematic'});

    }
}


// Should be able to have these in a different file. don't understand proper hierarchy of class, extend,  etc.
class Spikey extends NumberSphereRaw {
    static _icon = assets.textures.ui.icons.spikey;
    timer = 0; 
    //growlFn=(pos)=>{console.log("growl:"+pos);};
    originPoint=pc.Vec3.ZERO;
    movementRange=5;
    currentDirection=pc.Vec3.ZERO;
    static propertiesMap = [
         new PropertyMap({  
            // should be new EditableProperty(property,onchangeFn,getCurValfn) class?
            name : this.name, // if this changes, data will break // Should be Fraction1?
            property : FractionProperty, 
            onChangeFn : (template,value) => { console.log("Ch numbersphere"); template.setFraction(value); }, 
            onInitFn : (template,value) => { console.log("init ns"); template.fraction = value; },
            getCurValFn : (template) => { return template.getFraction(); }, 
         }),
    ]
     setup(args={}){
        super.setup(args);
    }
    constructor(args={}){
        super(args);
        console.log("%c create sp:"+this.uuid.substr(0,5),"color:white");
        let spikeyClothes = assets.models.creatures.spikey.resource.instantiateRenderEntity();
        this.entity.addChild(spikeyClothes);
        spikeyClothes.setLocalPosition(pc.Vec3.ZERO);
        this.originPoint = this.entity.getPosition();

        const $this=this;
        $this.growlFn=(pos)=>{
            AudioManager.play({
                source:PickRandomFromObject(assets.sounds.spikeySounds),
                position:pos,
                positional:true
            });
        }

        pc.app.on('update',this.update,this);

    }

    get randomInterval(){
        const i = Math.random() * 3 + 2; // Random interval between 2-5 seconds
        return i;

    }


    update(dt){
        this.timer -= dt;
        // If the timer reaches zero, change direction and reset timer
        if (this.timer <= 0) {
            this.timer = this.randomInterval * 5;
             console.log("Growling:"+this.uuid.substr(0,5)+"+ at:"+this.entity.getPosition().trunc());
            if (isNaN(this.entity.getPosition().x)){ return;}
            this.growlFn(this.entity.getPosition());
            this.currentDirection = new pc.Vec3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        }

        // Give it a chance to redirect efforts toward player, if player is close enough
        var distToPlayer = Player.entity.getPosition().sub(this.entity.getPosition()).length();
        if (distToPlayer < 10){
            this.currentDirection = Player.entity.getPosition().sub(this.entity.getPosition()).normalize();
        }

        // Calculate distance from origin point
        var distance = this.entity.getPosition().sub(this.originPoint).length();
        // If creature is too far from origin, move towards it
        if (distance > this.movementRange) {
            this.currentDirection = this.originPoint.clone().sub(this.entity.getPosition()).normalize();
        }


        // Apply force in the current direction of movement

        var force = 1 * dt;// (10*dt); // You can adjust the force value
        this.entity.rigidbody.applyForce(this.currentDirection.clone().normalize().mulScalar(force));
    }

    entityWasDestroyed(){
    //    console.log("This was destroyed:"+this.uuid);
        super.entityWasDestroyed();
        pc.app.off('update',this.update,this);
    }



}


class SpikeyGroup extends Template {
    static _icon = assets.textures.ui.icons.spikey;
    _quantity = 1;
    range=5;
    spikeys=[];
    setup(args={}){}
    static propertiesMap = [
         new PropertyMap({  
            name : QuantityProperty.constructor.name,
            property : QuantityProperty,
            onChangeFn : (template,value) => {  template.quantity = value; template.Rebuild(); },
            onInitFn : (template,value) => { template.quantity = value; },
            getCurValFn : (template) => { return template.quantity },
            min:1,
            max:7,
         }),
    ];

    get quantity(){ 
        return this._quantity;
    }
    set quantity(value) { 
        this._quantity = value;
    }
    Rebuild(){
        this.DestroyGroup();
        this.CreateGroup();
    }

    DestroyGroup(){
        console.log("Desgro:"+this.uuid.substr(0,5));
        this.entity.destroy();
    }

    gatherLooseRigidbodies(){
        console.log(this.spikeys);
        this.spikeys.forEach(x=>{
            x.entity.moveTo(this.randomSpikeyPos);
            if (x.entity.rigidbody){
                x.entity.rigidbody.linearVelocity=pc.Vec3.ZERO;
                x.entity.rigidbody.angularVelocity=pc.Vec3.ZERO;

            }
        });
        // if they fell away, reset them to be close to the center of the group
    }
    onBeginDragByEditor(){
        
        super.onBeginDragByEditor();
        this.freezeRigidbodies(); 
        this.gatherLooseRigidbodies();
    }
    onEndDragByEditor(){
        super.onEndDragByEditor();
        this.unfreezeRigidbodies(); 
    }

    CreateGroup(){
        console.log("Create group");
        this.spikeys=[];
        for (let i=0;i<this._quantity;i++){
            let p = this.randomSpikeyPos;
            let s = new Spikey({position:p});
            this.entity.addChild(s.entity);
            this.spikeys.push(s);
            //s.moveTo(p); // addchild changes local pos?
        } 
    }

    get randomSpikeyPos(){
        let p = this.entity.getPosition().clone().add(new pc.Vec3(0,10,0));
        p.add(pc.Vec3.onUnitSphere().clone().flat().mulScalar(this.range));
        return p;
    }

    freezeRigidbodies(){
        this.spikeys.forEach(x=>{
            x.entity.rigidbody.type = pc.RIGIDBODY_TYPE_STATIC;
        });
    }
    
    unfreezeRigidbodies(){
        console.log('unf');
        this.gatherLooseRigidbodies();
        this.spikeys.forEach(x=>{
            x.entity.rigidbody.type = pc.RIGIDBODY_TYPE_DYNAMIC;
            x.originPoint = x.entity.getPosition();
        });
    }

    constructor(args){
        super(args);
        console.log("created group? uuid:"+this.uuid.substr(0,5))
        this.CreateGroup();
        let visibleSpikey = new NumberSphereGfxOnly({position:this.entity.getPosition()});
        this.entity.addChild(visibleSpikey.entity);
        let spikeyClothes = assets.models.creatures.spikey.resource.instantiateRenderEntity();
        visibleSpikey.entity.addChild(spikeyClothes);
        let s = 3;
        visibleSpikey.entity.setLocalScale(s,s,s);
        visibleSpikey.entity.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(s/2,s/2,s/2)});
        visibleSpikey.entity.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_STATIC});
        visibleSpikey.entity.moveTo(this.entity.getPosition().clone().add(new pc.Vec3(0,3,0)));
        this.visibleSpikey=visibleSpikey;

        pc.app.on('update',this.update,this);
    }

    entityWasDestroyed(){
        super.entityWasDestroyed();
        this.spikeys.forEach(x=>{x.entity.destroy()});
        this.spikeys=[];
        pc.app.off('update',this.update);
    }

    tick=0;
    update(dt){
        this.tick++;
        if (this.tick > 105){
            this.tick=0;
            this.spikeys.forEach(x=>{
                if (pc.Vec3.distance(x.entity.getPosition(),this.entity.getPosition()) > this.range * 10){
                    x.entity.moveTo(this.randomSpikeyPos);
                    x.entity.rigidbody.linearVelocity=pc.Vec3.ZERO;
                    x.entity.rigidbody.angularVelocity=pc.Vec3.ZERO;

                }
            });
        }
    }
    
    onGameStateChange(state){
        super.onGameStateChange(state);
        switch(state){
        case GameState.RealmBuilder: this.visibleSpikey.entity.enabled=true; break;
        case GameState.Playing: this.visibleSpikey.entity.enabled=false; this.gatherLooseRigidbodies(); break;
        default:break;
        }

    }

}



window.templateNameMap = {
    "Template" : Template,
    "NumberSphere" : NumberSphere,
    "NumberSphereGfxOnly" : NumberSphereGfxOnly,
    "NumberCube" : NumberCube,
    "NumberFaucet" : NumberFaucet,
    "NumberHoop" : NumberHoop,
    "NumberWall" : NumberWall,
    "PlayerStart" : PlayerStart,
    "PlayerPortal" : PlayerPortal,
    "CastleTurret" : CastleTurret,
    "CastleWall" : CastleWall,
    "ConcretePad" : ConcretePad,
    "BigConcretePad" : BigConcretePad,
    "MultiblasterPickup" : MultiblasterPickup,
    "SwordPickup" : SwordPickup,
    "Tree1" : Tree1,
    "Group" : Group,
    "Spikey" : Spikey,
    "SpikeyGroup" : SpikeyGroup,
}

// Export all templates to global scope for use in rest of app
Object.entries(window.templateNameMap).forEach(([key,value])=>{window[key]=value});
