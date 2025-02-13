/*
place two portals facing same rotation
the "in" direction needs to be opposite the "out" direction, not in accordance with it
Therefore, look to the logic that dictates where the camera should be; that is where the inverse should happen?

*/

const Portal = pc.createScript("portal");
Portal.attributes.add('portalPlane', { type: 'entity' });
Portal.attributes.add('dest', { type: 'entity' });
Portal.attributes.add('pivot', { type: 'entity' });
Portal.attributes.add('camPivot', { type: 'entity' });
Portal.attributes.add('corners', { type: 'entity', array:true });
Portal.attributes.add('audioManager', { type: 'object' });
Portal.attributes.add('portalSound', { type: 'object' });
Portal.attributes.add('onPlayerEnter', { type: 'object' });

// initialize code called once per entity
Portal.prototype.initialize = function () {
    this.buildWalls();
    const portalPlane = new pc.Entity("PortalPlane");
    portalPlane.addComponent("render", {
          type: "plane",
           material: new pc.StandardMaterial(),
           layers: [pc.LAYERID_WORLD],
      });
    portalPlane.setLocalPosition(0, 1.14, -0.3);
    portalPlane.setLocalEulerAngles(90, 0, 0);
    portalPlane.setLocalScale(3.7,1.0,5.5);
    portalPlane.render.enabled=false;
    this.portalPlane = portalPlane;

    const pivot = new pc.Entity("PortalPlanePivot");
    this.entity.addChild(pivot);
    pivot.addChild(this.portalPlane);
    this.pivot = pivot;
   
    // target camera pivot needs to flip 180 since portals are unidirectional and "mirror" (no passthru, way in is way out)

    const camPivot = new pc.Entity("portalCameraPivot");
    pivot.addChild(camPivot);
    camPivot.setLocalEulerAngles(0,180,0);
    this.camPivot = camPivot;

    // Create the portal visual geometry
    const portalEntity = assets.portal.resource.instantiateRenderEntity();
    // Game.pe = portalEntity;

    portalEntity.getComponentsInChildren('render').forEach(r => {
        r.meshInstances[0].material = Materials.black;
    });

    portalEntity.setLocalPosition(0, -3, 0);
    portalEntity.setLocalScale(0.02, 0.02, 0.02);
    this.entity.addChild(portalEntity);

    // This is the actual entity that player triggers and crosses.
    const portalDoor = new pc.Entity("machinePortal");
    let s = new pc.Vec3(3,9,0.1);
    portalDoor.setLocalScale(s);
    portalDoor.addComponent("collision", { type: "box", halfExtents: new pc.Vec3(s.x/2, s.y/2, s.z/2),    });
    portalDoor.tags.add(Constants.Tags.Portal);
//    portalDoor.addComponent("rigidbody", { group : Constants.Layers.Portal });
    this.entity.addChild(portalDoor);
    portalDoor.addComponent('script');
    portalDoor.script.create('machinePortal',{attributes:{group:this.entity}});//,onCrossFn:onCrossFn}});
    //console.log("machine portal group:"+portalDoor.script.machinePortal.group);
    portalDoor.script.machinePortal.sourcePortal = this.entity;
    portalDoor.setLocalPosition(new pc.Vec3(0,2,0));
    pivot.addChild(portalDoor);
    // Game.hoop = portalDoor;
  
//    group.addComponent('rigidbody',{type:pc.BODYTYPE_KINEMATIC});
 //   group.rigidbody.group = Constants.Layers.Portal;


    
};

Portal.prototype.buildWalls = function(){
    let options = {position:pc.Vec3.ZERO,scale:new pc.Vec3(5,15,0.2),rigid:true,rbType:pc.RIGIDBODY_TYPE_KINEMATIC};
    let wall = Cube(options)
    wall.render.material = Materials.black; 
    this.entity.addChild(wall);
    wall.setLocalPosition(-4.15,0,0);
    
    options.scale = new pc.Vec3(5,15,0.2);
    wall = Cube(options);
    wall.render.material = Materials.black; 
    this.entity.addChild(wall);
    wall.setLocalPosition(4.15,0,0);

    options.scale = new pc.Vec3(3.3,3.2,0.2);
    wall = Cube(options);
    wall.render.material = Materials.black; 
    this.entity.addChild(wall);
    wall.setLocalPosition(0,5.9,0);


}

Portal.prototype.createLandingPlatform = function(textureAsset){
//    c = Game.Instantiate.gothicChurchCeiling({rotation:new pc.Vec3(-90,0,0),localOnly:true,network:false});
    
   // this.AddObjectToPortal(c,new pc.Vec3(0,-3,-20),true);

    const options = {position:new pc.Vec3(-50,2,10),scale:new pc.Vec3(15,1,15),rigid:true};
    a = Cube(options);
    a.name="chess";
    ApplyTextureAssetToEntity({entity:a,textureAsset:textureAsset});
//    ApplyTextureFromFileSource(a,'/static/img/chess.png');
    this.AddObjectToPortal(a,new pc.Vec3(0,-2,-7.5),true)

};

Portal.prototype.ConnectTo = function(portal2){
    this.dest = portal2.camPivot;
};

Portal.prototype.update = function(dt){
    let thresholdRadius = 200;
    let radius = pc.Vec3.distance(Player.entity.getPosition(),this.entity.getPosition);
    if (radius < thresholdRadius){
       Camera.portal.staticObjSource = this.entity;
       Camera.portal.staticObjTarget = this.dest;
    }
}

// This should be a static method, not callable per instance ..
Portal.CreatePortal = function(opts={}){
//    const { onCrossFn = null} = opts;//(()=>{})()} = opts;
     

    
        
}


Portal.prototype.AddObjectToPortal = function (obj,p,inside) { // the complex one
//    console.log("adding:"+obj.name+", inside:"+inside);
    obj.reparent(this.entity);
    obj.rigidbody ? obj.rigidbody.teleport(this.entity.localToWorldPos(p)) : obj.setLocalPosition(p);
    obj.addComponent('script'); 
    obj.script.create('portalGeometry',{attributes:{inside :inside,}});
//    if (inside) obj.getComponentsInChildren("render").forEach(x => x.layers = [pc.LAYERID_WORLD, Game.portalLayer.id]);
}


