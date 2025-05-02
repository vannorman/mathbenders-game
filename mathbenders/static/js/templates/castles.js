import Template from './template.js'
import * as P from './properties.js';
export class CastleTurret extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.turret1;

    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties(properties);
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


export class Ramp extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.stairs1;

    static propertiesMap = [
         new P.Scale({  
            name : "Scale",
            property : P.Scale,
            // valueType : pc.Vec3,
            onChangeFn : (template,value) => {  template.scale = value; },
            getCurValFn : (template) => { return template.scale },
            min:0.1,
            max:3,
         }),
    ];

    get scale(){ 
        const s = this.ramp.getLocalScale().mulScalar(10); 
        console.log(s);
        return s; 
    }
    set scale(value) {
        console.log("V:"+value.trunc()); 
        this.ramp.setLocalScale(value); 
        this.updateTextureTiling();
    }

    updateTextureTiling(){
        const mat = this.ramp.render.meshInstances[0].material;
        const x = this.ramp.getLocalScale().x / 3;
        const y = this.ramp.getLocalScale().z / 3;
        mat.diffuseMapTiling = new pc.Vec2(x,y);
        mat.update();
    }



    rampScale = new pc.Vec3(0.3,0.3,0.3);
    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties(properties);
        // Castle Pillar
        const rampP = assets.models.ramp.resource.instantiateRenderEntity();
        const ramp = rampP.children[0];
        
        this.entity.addChild(ramp);
        ramp.setLocalScale(this.rampScale);
        ramp.setLocalEulerAngles(-90,0,0);
        rampP.destroy();
        ramp.addComponent('collision',{type:'mesh',renderAsset:ramp.render.asset});
        ramp.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        ApplyTextureAssetToEntity({entity:ramp,textureAsset:assets.textures.stone90}); 
        
        this.ramp=ramp;

        this.updateColliderMap();
    }

}



export class CastleWall extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.wall;
    static propertiesMap = [
        // This is awkward because these are NOT properties for this template.
        // Rather, this is the best method for adding *additional editing options* to the UI for this template.
        // It might be better to divorce the UI the user sees (what is populated in editItemTray) vs what properties are there, 
        // And link or map them separately.
         new P.PropertyMap({  
            property : P.BuildWalls,
         }),
         new P.PropertyMap({  
            property : P.BuildWallsTurrets,
         }),
    ];

    startConnectingWalls(value){
        // Should we handle it here or in realmeditor?
    }
     

    constructor(args={}){ 
        super(args);
        const {properties}=args;
        this.setProperties(properties);
        
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

export class CastleWallFormed extends Template {
    static isStaticCollider = true;
    // static _icon = assets.textures.ui.icons.wall;

    static propertiesMap = [
         new P.PropertyMap({  
            name : "CastleWallFormed",
            property : P.GenericData,
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
        const {properties}=args;
        this.setProperties(properties);
        
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

export class ConcretePad extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.builder.concretePad;
    static propertiesMap = [
         new P.PropertyMap({  
            name : "Scale",
            property : P.Scale,
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
    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties(properties);

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

export class BigConcretePad extends ConcretePad { 
    static _icon = assets.textures.ui.builder.concretePadBig;
    static defaultScale = new pc.Vec3(50,20,50);
    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties(properties);
        this.pad.tags._list.push(Constants.Tags.Terrain);
    }
}

export class CastleGate extends Template {
    static _icon = assets.textures.ui.icons.castleDoor;

    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties(properties);

        
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


