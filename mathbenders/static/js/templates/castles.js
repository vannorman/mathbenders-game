import Template from './template.js'
import * as P from './properties.js';
import { Button } from './machines.js';

export class CastleTurret extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.turret1;
    static properties = [
        new P.Scale(),
        new P.BuildWallsTurrets(),
    ];
    scale=new pc.Vec3(1,1,1);
    setScale(value){
        this.scale=value;
        this.entity.setLocalScale(value); // is it okay to set the global parent entity scale or should we always have a parent of scale 1?
        let s = this.pillar.getScale();
        let scale = new pc.Vec2(s.x+s.y,s.z);
        this.updateTextureTiling({ent:this.pillar,scale:scale});
        s = this.head.getScale();
        scale = new pc.Vec2(s.x+s.y,s.z);
        this.updateTextureTiling({ent:this.head,scale:scale});
        // this.updateCollider({colEnt:this.head});
    }


    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        // Castle Pillar
        const pillarAsset = assets.models.castle_pillar;
        const pillarRender = pillarAsset.resource.instantiateRenderEntity();
        pillarRender.addComponent('collision',{type:'cylinder',radius:2,height:16,axis:2});
//        let pillarCollision = Utils.addMeshCollider({entity:pillarRender,meshAsset:pillarAsset.resource.renders[0]});

        pillarRender.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        ApplyTextureAssetToEntity({entity:pillarRender,textureAsset:assets.textures.stone90}); 
        
        // Castle Top
        const topAsset = assets.models.castle_top;
        const headRender = topAsset.resource.instantiateRenderEntity();
        headRender.addComponent('collision',{type:'mesh',renderAsset:headRender.render.asset});
        //let topCollision = Utils.addMeshCollider({entity:headRender,meshAsset:topAsset.resource.renders[0]});

        headRender.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        ApplyTextureAssetToEntity({entity:headRender,textureAsset:assets.textures.stone90}); 
        
        this.entity.addChild(headRender);
        this.entity.addChild(pillarRender);
        this.pillar = pillarRender;
        this.head = headRender;
        headRender.setLocalEulerAngles(-90,0,0);
        headRender.setLocalPosition(new pc.Vec3(0,3.4,0));
        
        pillarRender.setLocalEulerAngles(-90,0,0);
        pillarRender.setLocalScale(1,1,2);
        pillarRender.setLocalPosition(new pc.Vec3(0,-4,0));

        this.setScale(this.scale);
        this.updateColliderMap();
    }

}


export class Ramp extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.stairs1;

    static properties = [
         new P.Scale({  
            name : "Scale",
            // valueType : pc.Vec3,
            onInitFn : (template,value) => {  template.scale = value; },
            onChangeFn : (template,value) => {  template.setScale(value); },
            getCurValFn : (template) => { return template.scale },
            min:1,
            max:10,
            delta:.2,
            precision:2,
         }),
    ];

    getScale(){ 
        const s = this.ramp.getLocalScale(); 
        console.log(s);
        return s; 
    }
    setScale(value) {
        this.scale=value;
        this.ramp.setLocalScale(value); 
        this.updateTextureTiling({ent:this.rampC,scaleRef:this.ramp});
        this.updateCollider({colEnt:this.rampC});
    }




    scale = new pc.Vec3(4,2,2);
    constructor(args={}){
        super(args);
        const {properties}=args;

        this.setProperties2(properties);
        const rampM = assets.models.ramp.resource.instantiateRenderEntity();
        const rampC = rampM.children[0];
        const ramp = new pc.Entity();
        ramp.addChild(rampC);
        rampM.destroy();
        this.entity.addChild(ramp);
        rampC.setLocalScale(.05,.05,.05);
        rampC.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        rampC.addComponent('collision',{type:'mesh',renderAsset:rampC.render.asset});

        rampC.setLocalEulerAngles(-90,0,0);
        
        ApplyTextureAssetToEntity({entity:ramp,textureAsset:assets.textures.stone90}); 
        
        this.ramp=ramp;
        this.rampC=rampC;
        this.setScale(this.scale);

        this.updateColliderMap();
    }

}



export class CastleWall extends Template {
    static isStaticCollider = true;
    static _icon = assets.textures.ui.icons.wall;
    static properties = [
         new P.BuildWalls(),
    ];

    constructor(args={}){ 
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        
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

    static properties= [
         new P.GenericData({
            name : "CastleWallFormed",
            onInitFn : (template, value) => { template.meshData=value; },
            getCurValFn : (template) => { return template.meshData },
         }),
    ];

    setMeshData(value){
        console.log("this meshdata");
       this.meshData = value; 
    }
    offset = new pc.Vec3(-2.75,-1,0.75);
    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        
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
        // if debug colliders
        // col.addComponent('render',{type:'box'});
        const scale = new pc.Vec3(1,1.75,1);
        col.setLocalScale(scale);
        col.addComponent('collision',{type:'box',halfExtents:scale.mulScalar(0.5)});
        col.setLocalPosition(0,0,0);
        this.col=col; 
        this.entity.addChild(col);
        clone.setLocalPosition(this.offset);
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
        this.col.moveTo(this.entity.getPosition().clone().add(new pc.Vec3(0,midpoint.y,0)));//midpoint));
        this.col.rotation = Quaternion.LookRotation(slope);
        this.col.setLocalScale(xScale*11,10,0.5);
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
    static properties = [
         new P.Scale({
            name : "Scale",
            onInitFn : (template,value) => {  template.scale = value; },
            onChangeFn : (template,value) => {  template.setScale(value); },
            getCurValFn : (template) => { return template.scale },
            min:0.5,
            max:100,
            delta:1,
         }),
    ];

    scale = new pc.Vec3(1,1,1);
    setScale(value) { 
        this.scale=value;
        this.pad.setLocalScale(value); 
        this.updateHalfExtents(); 
        this.updateTextureTiling({ent:this.pad});
    }

    updateHalfExtents(){
        this.pad.collision.halfExtents = this.pad.getLocalScale().clone().mulScalar(0.5);
    }

    scale = new pc.Vec3(10,10,10);
    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);

        const pad = new pc.Entity("concrete pad");
        pad.addComponent("render", {  type: "box" }); 
        pad.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_KINEMATIC, restitution: 0.5, });
        pad.addComponent("collision", { type: "box"});
        let mat = ApplyTextureAssetToEntity({entity:pad,textureAsset:assets.textures.terrain.concrete1});
        this.pad = pad;
        this.setScale(this.scale);

        this.entity.addChild(pad);
        this.updateColliderMap();
    }

}

export class BigConcretePad extends ConcretePad { 
    static _icon = assets.textures.ui.builder.concretePadBig;
    static properties = [
         new P.Scale({
            name : "Scale",
            onInitFn : (template,value) => {  template.scale = value; },
            onChangeFn : (template,value) => {  template.setScale(value); },
            getCurValFn : (template) => { return template.scale },
            min:0.5,
            max:100,
            delta:5,
         }),
    ];

    scale = new pc.Vec3(50,20,50);
    constructor(args={}){
        super(args);
        const {properties}=args;
        this.setProperties2(properties);
        this.setScale(this.scale);
        this.pad.tags._list.push(Constants.Tags.Terrain);
    }
}

export class CastleGate extends Template {
    static _icon = assets.textures.ui.icons.castleDoor;

    constructor(args={}){
        const {setProperties=true} = args; // a class that extends me doesn't want me to set properties yet
        super(args);
        const {properties}=args;
        if (setProperties) {
            this.setProperties2(properties);
        }

        
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


        const $this=this;
        const button = new Button({onTouchedFn:()=>$this.toggleGate()});
        this.button=button;
        this.button.entity.setLocalPosition(2,0,2);
        this.entity.addChild(button.entity);
        this.state = 'closed';
        this.closedPos = this.gate.getLocalPosition().clone();
        this.openPos = this.gate.getLocalPosition().clone().add(new pc.Vec3(0,5,0));
        pc.app.on('update',$this.update,this);
        this.updateColliderMap();
    }

    toggleGate(){
        if (this.state === 'closed') {
            this.state = 'opening';
            this.t = 0;
        } else if (this.state === 'open'){
            this.state = 'closing';
            this.t = 0;
        
        }
    }

    t;
    update(dt) {
        this.t += dt;
        if (this.state === 'opening') {
            const dist = this.gate.getLocalPosition().distance(this.openPos);
            if (dist > 0.01) {
                const pushDuration = 1.5;
                let lt = this.t / pushDuration; 
                let p = new pc.Vec3().lerp(this.gate.getLocalPosition(),this.openPos,lt);
                this.gate.setLocalPosition(p);
            } else {
                this.gate.setLocalPosition(this.openPos);
                this.state = 'open';
            }
        } else if (this.state === 'closing') {
            const dist = this.gate.getLocalPosition().distance(this.closedPos);
            if (dist > 0.01) {
                const pushDuration = 0.8;
                let lt = this.t / pushDuration; 
                let p = new pc.Vec3().lerp(this.gate.getLocalPosition(),this.closedPos,lt);
                this.gate.setLocalPosition(p);
            } else {
                this.gate.setLocalPosition(this.closedPos);
                this.state = 'closed';
            }
        }
    }

        
    entityWasDestroyed(){
        pc.app.off('update',this.update);
        super.entityWasDestroyed();
    }



}


class TerrainModifier  {
    constructor(args={}){
        const {
            width=15,
            length=15,
            depth=4,
            rampDir=new pc.Vec3(0,0,1), 
        } =args;
        this.width=width;
        this.length=length;
        this.depth=depth;
        this.rampDir=rampDir;

    }

}




export class CastleGateDungeon extends CastleGate {
    static _icon = assets.textures.ui.icons.castleDoorDungeon;
    static properties= [     
        new P.Quantity({  
            onChangeFn : (template,value) => {  template.terrainModifier.depth = -value; template.RecalculateTerrain();  },
            onInitFn : (template,value) => { template.terrainModifier.depth = -value; },
            getCurValFn : (template) => { return -template.terrainModifier.depth },
            min:-15,
            max:15,
         }),
    ]
    isTerrainModifier = true;
    level;
    constructor(args={}){
        args.setProperties = false;
        super(args);
        const {properties,level}=args;
        this.terrainModifier = new TerrainModifier({})
        console.log("this ter mod:"+this.terrainModifier);
        this.setProperties2(properties);
        this.level=level;
        
       
        // Update texture assets from castle stone to grid fine
        ApplyTextureAssetToEntity({entity:this.doorway,textureAsset:assets.textures.terrain.grid_fine}); 
        ApplyTextureAssetToEntity({entity:this.cover,textureAsset:assets.textures.terrain.grid_fine});
        const rampM = assets.models.ramp.resource.instantiateRenderEntity();
        const rampC = rampM.children[0];
        const ramp = new pc.Entity();
        ramp.addChild(rampC);
        rampM.destroy();
        this.entity.addChild(ramp);
        rampC.setLocalScale(.05,.05,.05);
        rampC.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
        rampC.addComponent('collision',{type:'mesh',renderAsset:rampC.render.asset});

        rampC.setLocalEulerAngles(-90,0,0);
        
        ApplyTextureAssetToEntity({entity:ramp,textureAsset:assets.textures.terrain.grid_fine}); 
        ramp.setLocalEulerAngles(0,180,0);
        ramp.setLocalPosition(-6,0,0);
        ramp.setLocalScale(3,3,3);
        
        this.ramp=ramp;
        this.rampC=rampC;
        ApplyTextureAssetToEntity({entity:this.ramp,textureAsset:assets.textures.terrain.grid_fine}); 
        
       //  this.updateTextureTiling({ent:this.rampC,scaleRef:this.ramp});
        this.updateCollider({colEnt:this.rampC});

         

    }

    RecalculateTerrain(){
        this.level.terrain.Regenerate();
    }

    onEndDragByEditor(args){
        super.onEndDragByEditor();
        this.RecalculateTerrain();
    }
    onDragByEditor(){
        super.onDragByEditor();

        this.RecalculateTerrain();
    }

    onDeleteByEditor(){
        super.onEndDragByEditor();
        realmEditor.currentLevel.terrain.Regenerate();
    }

    onInflated(){
        this.level.terrain.RegenerateWithDelay();
    }


    timeoutFn = null;
    dropToTerrain(){
        if (this.timeoutFn){
            clearTimeout(this.timeoutFn);

         }
         const $this=this;
        this.timeoutFn=setTimeout(function(){
            const from = $this.entity.getPosition().clone().add(new pc.Vec3(0,10,0));
            const to = from.clone().add(new pc.Vec3(0,-50,0));
            const results = pc.app.systems.rigidbody.raycastAll(from, to);
            results.forEach(result=>{
                if (result.entity.tags.list().includes(Constants.Tags.Terrain)){
                    $this.entity.moveTo(result.point); 
                }
            },500);


        })
    }

    get data(){
        return {
            width:this.terrainModifier.width,
            length:this.terrainModifier.length,
            depth:this.terrainModifier.depth,
            position:this.entity.getPosition(),
            templateUuid:this.uuid, // prevent double additions.
            callback:this.dropToTerrain.bind(this),
        }
    }
}





