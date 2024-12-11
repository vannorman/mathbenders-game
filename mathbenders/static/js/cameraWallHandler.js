var CameraWallHandler = pc.createScript('cameraWallHandler');

CameraWallHandler.attributes.add('camera', { type: 'entity', title: 'Camera' });

CameraWallHandler.prototype.initialize = function () {
    this.originalPos = this.camera.getLocalPosition().clone();
    this.targetZ = this.originalPos.z;
    this.lerpSpeed = 300.0;
    this.margin = 0.25; // if this is zero, raycast will fail to hit obstructing object once camera is fully moved in front  
    //console.log('targetz:'+this.targetZ)
};


CameraWallHandler.prototype.postUpdate = function (dt) {
    // continuous physics raycastfirst 
    // starting from behind the player's head 
    //and raycasting to the length of the camera,
    // if hit anything then modify the camera's target z position by that much

    // configure positions and distances
    const localPos = Camera.main.entity.getLocalPosition().clone();
    const bufferAtPlayerHead = 0.5; // if this is zero, objects near the player head can obstruct the raycast unintentinoally
    const globalPos = Camera.main.entity.parent.getPosition().clone().add(new pc.Vec3(0,this.originalPos.y,0));
    var from = globalPos;//.clone().add(Camera.main.entity.forward.mulScalar(localPos.z-bufferAtPlayerHead));
    var to = globalPos.clone().add(Camera.main.entity.back.mulScalar(this.originalPos.z));

    // Raycast
    // Disfortunamente, I need to raycastall and check if it has a tag i want to ignore :(( like Portals
//    var mask = ~(1 << Constants.Layers.Portal); // this only works if rigidbody and then it doesn't
    var results = pc.app.systems.rigidbody.raycastAll(from, to);
    var closestResult = null;
    var closestHit = 99999999;
    var raycastMask = Constants.Tags.Portal;
    results.forEach(result=>{
        if (result && !result.entity.tags._list.includes(raycastMask)) {
            const hitDistance = pc.Vec3.distance(result.point,from);
//            console.log("D:"+hitDistance+", closestHit:"+closestHit+", entity;"+result.entity.name);
            if (hitDistance < closestHit){
                closestHit = hitDistance;
                closestResult = result;
            }
        }


    });

    if (closestResult){
        this.targetZ = closestHit + bufferAtPlayerHead;
    } else {
        this.targetZ = this.originalPos.z;

    }
            
//    Utils3.debugSphere({position:from,scale:0.24,color:pc.Color.BLACK})
//    Utils3.debugSphere({position:to,scale:0.2,color:pc.Color.RED})
   
    // Adjust camera if needed
    const currentZ = Math.lerp(localPos.z,this.targetZ,dt*this.lerpSpeed);
    const currentPos = new pc.Vec3(this.originalPos.x,this.originalPos.y,currentZ);
    Camera.main.entity.setLocalPosition(currentPos);

 
}; 

