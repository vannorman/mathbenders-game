import Template from './template.js';
import { Gadget } from './gadgets/base.js';
import { Sword } from './gadgets/sword.js';
import { Multiblaster } from './gadgets/multiblaster.js';
import {PropertyMap,Property,GenericDataProperty,BuildWallsProperty,BuildWallsTurretsProperty,CopyProperty,QuantityProperty,GroupProperty,MoveProperty,SizeProperty,FractionProperty,ScaleProperty,BasicProperties} from './properties.js';
import {Tree1} from './trees.js';
import {Group} from './groups.js';
import HeldItem from './gadgets/heldItem.js';
const globalProperties = [Property,QuantityProperty,MoveProperty,CopyProperty,SizeProperty,FractionProperty,ScaleProperty,BasicProperties]; 
globalProperties.forEach(x=>{window[x.name]=x});

class NumberHoop extends Template {
    static isStaticCollider = true;
    static propertiesMap = [
         new PropertyMap({  
            name : "NumberHoop",
            property : FractionProperty, 
            onChangeFn : (template,value) => {  template.fraction=value; },
            getCurValFn : (template) => { console.log("getcurfrachoop"); console.trace(); stackTrace();  return template.fraction },
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
            min : new Fraction(-5,1),
            max : new Fraction(5,1),
         }),

         new PropertyMap({  
            name : "Fraction2",
            property : FractionProperty, 
            onChangeFn : (template,value) => { template.fraction2 = value; }, 
            getCurValFn : (template) => { return template.fraction2; }, 
            min : new Fraction(-5,1),
            max : new Fraction(5,1),
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

    constructor(args={}){
        super(args);
        // Castle Pillar
        const pillarAsset = assets.models.castle_pillar;
        const pillarRender = pillarAsset.resource.instantiateRenderEntity();
        pillarRender.addComponent('collision',{type:'cylinder',radius:2,height:16,axis:2});
//        let pillarCollision = Utils.addMeshCollider({entity:pillarRender,meshAsset:pillarAsset.resource.renders[0]});

        pillarRender.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        ApplyTextureAssetToEntity({entity:pillarRender,textureAsset:assets.textures.stone90}); 
        
        // Castle Top
        const topAsset = assets.models.castle_top;
        const topRender = topAsset.resource.instantiateRenderEntity();
        let topCollision = Utils.addMeshCollider({entity:topRender,meshAsset:topAsset.resource.renders[0]});

        topRender.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        ApplyTextureAssetToEntity({entity:topRender,textureAsset:assets.textures.stone90}); 
        
        this.entity.addChild(topRender);
        this.entity.addChild(pillarRender);
        topRender.setLocalEulerAngles(-90,0,0);
        topRender.setLocalPosition(new pc.Vec3(0,3.4,0));
        
        pillarRender.setLocalEulerAngles(-90,0,0);
        pillarRender.setLocalScale(1,1,2);
        pillarRender.setLocalPosition(new pc.Vec3(0,-4,0));

        this.updateColliderMap();
    }

}



class CastleWall extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.wall;
    static propertiesMap = [
        // This is awkward because these are NOT properties for this template.
        // Rather, this is the best method for adding *additional editing options* to the UI for this template.
        // It might be better to divorce the UI the user sees (what is populated in editItemTray) vs what properties are there, 
        // And link or map them separately.
         new PropertyMap({  
            property : BuildWallsProperty,
         }),
         new PropertyMap({  
            property : BuildWallsTurretsProperty,
         }),
    ];

    startConnectingWalls(value){
        // Should we handle it here or in realmeditor?
    }
     

    constructor(args={}){ 
        super(args);
        
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
        this.updateColliderMap();
    }
}

class CastleWallFormed extends Template {
    static isStaticCollider = true;
    // static _icon = assets.textures.ui.icons.wall;

    static propertiesMap = [
         new PropertyMap({  
            name : "CastleWallFormed",
            property : GenericDataProperty,
            // valueType : pc.Vec3,
            onChangeFn : (template,value) => {  },//template.setMeshData(value); },
            onInitFn : (template, value) => { template.meshData=value; },
            getCurValFn : (template) => { return template.meshData },
            min:0.5,
            max:100,
         }),
    ];

    setMeshData(value){
        console.log("this meshdata");
       this.meshData = value; 
    }
    constructor(args={}){
        super(args);
        
        const asset = assets.models.castle_wall;
        const render = asset.resource.instantiateRenderEntity();
        const clone = render.cloneWithMesh();
        render.destroy();

        // Utils.createMeshFromDataAndApply({mesh:this.mesh, })

        let mat = ApplyTextureAssetToEntity({entity:clone,textureAsset:assets.textures.stone}); 
        mat.diffuseMapTiling=new pc.Vec2(3,3); 
        mat.update();
 
        this.entity.addChild(clone);
        this.wall = clone;

        

        const col = new pc.Entity("castlewall collider");
        col.addComponent('rigidbody', {type:pc.RIGIDBODY_TYPE_KINEMATIC});
        col.addComponent('render',{type:'box'});
        const scale = new pc.Vec3(1,1.75,1);
        col.setLocalScale(scale);
        col.addComponent('collision',{type:'box',halfExtents:scale.mulScalar(0.5)});
        col.setLocalPosition(0,0,0);
        this.col=col; 
        this.entity.addChild(col);
        clone.setLocalPosition(new pc.Vec3(-2.75,-1,0.75));
        if (this.meshData){
            this.updateWallMesh(this.meshData);
        }
        // console.log("Find previous wall and connect them");
        this.updateColliderMap();
    }

    updateWallMesh(meshData){
        const {xScale,verts,midpoint,slope}=meshData;
        let mesh = this.wall.render.meshInstances[0].mesh;
        mesh.setPositions(verts);
        mesh.update(pc.PRIMITIVE_TRIANGLES);
        this.wall.setLocalScale(xScale,1,1);

         this.col.moveTo(midpoint);
         this.col.rotation = Quaternion.LookRotation(slope);
        this.col.setLocalScale(xScale*8,8,0.5);
        this.col.collision.halfExtents = this.col.getLocalScale().mulScalar(0.5);
        this.updateColliderMap();
        
    }

    formToTerrain(args={}){
        const {xScale=1}=args;
        //this.entity.moveTo(this.entity.getPosition().add(new pc.Vec3(0,10,0)));
        const result = Utils.adjustMeshToGround({entity:this.wall}); 
        const {verts,slope,midpoint} = result;
       this.meshData = { verts: verts, xScale:xScale, midpoint:midpoint, slope:slope };
        this.updateWallMesh(this.meshData);
    }
}

class ConcretePad extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.builder.concretePad;
    static propertiesMap = [
         new PropertyMap({  
            name : ScaleProperty.name,
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
    constructor(args={}){
        super(args);
        this.pad.tags._list.push(Constants.Tags.Terrain);
    }
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
            name : this.name, // if this changes, data will break 
            property : FractionProperty, 
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

class NumberSphereGfxOnly extends Template {
    static propertiesMap = [
         new PropertyMap({  
            name : this.name, // if this changes, data will break // Should be Fraction1?
            property : FractionProperty, 
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
         new PropertyMap({  
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

class CastleGate extends Template {
    static _icon = assets.textures.ui.icons.castleDoor;

    constructor(args={}){
        super(args);

        
        const gate = assets.models.castle_gate.resource.instantiateRenderEntity().children[0];
        ApplyTextureAssetToEntity({entity:gate,textureAsset:assets.textures.wood}); 
        const doorCol = new pc.Entity();
        doorCol.setLocalScale(0.5,2.5,3.5);
        doorCol.setLocalPosition(0,0,1.5)
        doorCol.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(0.5,3.25,3.75)});
        doorCol.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        gate.addChild(doorCol);
        gate.setLocalScale(2,2,2);

        const doorwayAsset = assets.models.castle_doorway;
        const doorway = doorwayAsset.resource.instantiateRenderEntity().children[0];
        doorway.setLocalScale(2,2,2);
        ApplyTextureAssetToEntity({entity:doorway,textureAsset:assets.textures.stone90}); 
        Utils.addMeshCollider({entity:doorway,meshAsset:doorway.render.asset});

        const cover = new pc.Entity();
        cover.addComponent('render',{type:'box'});
        const scale = new pc.Vec3(4.5,1,7.9);
        cover.addComponent('collision',{type:'box',halfExtents:scale.clone().mulScalar(0.5)});
        cover.addComponent('rigidbody',{type:'kinematic'});
        cover.setLocalScale(scale);

        ApplyTextureAssetToEntity({entity:cover,textureAsset:assets.textures.stone90});


        this.entity.addChild(gate);
        this.entity.addChild(doorway);
        this.entity.addChild(cover);
    
        doorway.setLocalEulerAngles(-90,0,0); 
        gate.setLocalEulerAngles(-90,0,0); 

        doorway.setLocalPosition(0,0,0);
        gate.setLocalPosition(0,0,0);
        cover.setLocalPosition(0,8,0);



        this.gate=gate;
        this.doorway=doorway;
        this.cover=cover;
        this.updateColliderMap();
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
    "CastleWallFormed" : CastleWallFormed,
    "CastleGate" : CastleGate,
    "ConcretePad" : ConcretePad,
    "BigConcretePad" : BigConcretePad,
    "MultiblasterPickup" : MultiblasterPickup,
    "SwordPickup" : SwordPickup,
    "Tree1" : Tree1,
    "Group" : Group,
    // "Spikey" : Spikey,
}

// Export all templates to global scope for use in rest of app
Object.entries(window.templateNameMap).forEach(([key,value])=>{window[key]=value});
