pc.CameraComponent.prototype.screenPointToWorldDir = function(x,y){
    let from = new pc.Vec3();
    let to = new pc.Vec3();
    this.screenToWorld(x,pc.app.graphicsDevice.height - y,4,from);
    this.screenToWorld(x,pc.app.graphicsDevice.height - y,1400,to);
    let dir = to.clone().sub(from).normalize();
    return dir;
 
}
pc.CameraComponent.prototype.screenPointToRay = function(x,y){
    //let to = new pc.Vec3();
    let from = new pc.Vec3();
    let to = new pc.Vec3();
    this.screenToWorld(x,pc.app.graphicsDevice.height - y,4,from);
    this.screenToWorld(x,pc.app.graphicsDevice.height - y,100000,to);
    let raycastResult = pc.app.systems.rigidbody.raycastFirst(from,to);
    return raycastResult;
}

pc.Color.ORANGE = new pc.Color(1,0.5,0);
pc.Color.INDIGO = new pc.Color(0.25,0,0.5);
pc.Color.VIOLET = new pc.Color(1,0,1);
Object.defineProperty(pc.ElementComponent.prototype, "screenCornersCenter", {
    get: function screenCornersCenter() {
        return this.screenCorners[0].clone().add(this.screenCorners[2]).mulScalar(0.5)
        // code
    }
});
setTimeout(function(){pc.Vec3.prototype.toJSON = function() {
    return { Vec3: { x: this.x, y: this.y, z: this.z } };
};},1000); // I hate this but if i don't settimeout it doesn't write it properly.
pc.Vec3.prototype.distanceToSquared = function(b) {
	var dx = b.x - this.x;
	var dy = b.y - this.y;
	var dz = b.z - this.z;
	return dx * dx + dy * dy + dz * dz;
}

Object.defineProperty(pc.Vec3.prototype, "data", {
    get: function data(){
        return [this.x,this.y,this.z];
    }
});



// https://www.npmjs.com/package/playcanvas-vector-math?activeTab=code?
// Extend playcanvas vec3
pc.Vec3.onUnitSphere = function(){
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    var x = Math.sin(phi) * Math.cos(theta);
    var y = Math.sin(phi) * Math.sin(theta);
    var z = Math.cos(phi);
    return new pc.Vec3(x, y, z);
}

pc.Vec3.lerp = function(v2,b){
    let x = Math.lerp(this.x,v2.x,b);
    let y = Math.lerp(this.y,v2.y,b);
    let z = Math.lerp(this.z,v2.z,b);
    return new pc.Vec3(x,y,z);
}
pc.Vec3.distance = function(a,b){return a.clone().sub(b).length()}
pc.Vec2.prototype.trunc = function(){return new pc.Vec2(parseFloat(this.x.toFixed(2)),parseFloat(this.y.toFixed(2)));}
pc.Vec3.prototype.trunc = function(){return new pc.Vec3(parseFloat(this.x.toFixed(3)),parseFloat(this.y.toFixed(3)),parseFloat(this.z.toFixed(3)));}
pc.Quat.prototype.trunc = function(){return new pc.Quat(parseFloat(this.x.toFixed(3)),parseFloat(this.y.toFixed(3)),parseFloat(this.z.toFixed(3)),parseFloat(this.w.toFixed(3)));}
pc.Vec3.prototype.flat = function(){ return new pc.Vec3(this.x,0,this.z)};
pc.Vec3.prototype.angle = function(vector1,vector2){
  var dotProduct = vector1.dot(vector2);
  var magnitude1 = vector1.length();
  var magnitude2 = vector2.length();
  var angleInRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));
  return angleInRadians * pc.math.RAD_TO_DEG;
}
pc.Vec3.prototype.getYawAngle = function(a,b){
  const angleA = Math.atan2(a.z, a.x);
  const angleB = Math.atan2(b.z, b.x);
  const yawAngle = angleB - angleA;

  return yawAngle * pc.math.RAD_TO_DEG;
}
pc.Quat.delta = function(q1,q2){
    const dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    return 1 - Math.abs(dot);
}
var _transformedForward = new pc.Vec3();
pc.Quat.prototype.getYaw = function(){
    var transformedForward = _transformedForward;
    this.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;    
}
pc.Quat.prototype.rotateAround = function(v,deg){ 
        const rad = pc.math.DEG_TO_RAD * deg;
        const axis = new pc.Vec3().copy(v).normalize();
        const rotationQ = new pc.Quat().setFromAxisAngle(axis, rad);// Create a new quaternion representing the rotation around the axis
        // Multiply the original quaternion by the rotation quaternion
        // This effectively applies the rotation to the original quaternion
        const resultQ = new pc.Quat().mul2(rotationQ, this);
        return resultQ.normalize();
    }

pc.Entity.prototype.stripBehaviors = function(){ 
    this.getComponentsInChildren('script').forEach(x => x.entity.removeComponent('script'));
    this.getComponentsInChildren('collision').forEach(x => x.entity.removeComponent('collision'));
    this.getComponentsInChildren('rigidbody').forEach(x => x.entity.removeComponent('rigidbody'));
    this.getComponentsInChildren('camera').forEach(x => x.entity.destroy());
};
pc.Entity.prototype.cloneWithMesh = function(){
    const r = this.getComponentsInChildren('render')[0];
    const m = r.meshInstances[0].mesh;
    const positions =[];
    const uvs = [];
    const indexArray = [];
    const normals = [];
    m.getPositions(positions);
    m.getUvs(0,uvs);
    m.getIndices(indexArray);
    m.getNormals(normals);
    function updateMesh(mesh, initAll) {
        mesh.setPositions(positions);
        mesh.setIndices(indexArray);
        mesh.setNormals(normals);
        mesh.setUvs(0,uvs);
        //if (initAll) { mesh.setUvs(0, uvs); mesh.setIndices(indexArray); }
        mesh.update(pc.PRIMITIVE_TRIANGLES);
    }
    const mesh = new pc.Mesh(pc.app.graphicsDevice);
    mesh.clear(true,false);
    updateMesh(mesh,true);
    const material = r.meshInstances[0].material.clone();
    const meshInstance = new pc.MeshInstance(mesh, material);

    const cloneWithNewMesh = this.clone();
    pc.app.root.addChild(cloneWithNewMesh);
    cloneWithNewMesh.getComponentsInChildren('render')[0].meshInstances = [meshInstance]; // awkward
    return cloneWithNewMesh;
}

pc.Vec3.prototype.max = function(){ return Math.max(this.x,this.y,this.z);} // is this really necessary??!

pc.Entity.prototype.moveTo = function(p,r){
    if (this.rigidbody){
        if (r) this.rigidbody.teleport(p,r);
        else this.rigidbody.teleport(p);
        this.rigidbody.linearVelocity = pc.Vec3.ZERO;
    } else {
        this.setPosition(p);
        if (r) this.setEulerAngles(r);
    }
}

pc.Entity.prototype.stripAllAttributes  = function() {
    // using blacklist.. should use whitelist and strip other things..oh well
    this.getComponentsInChildren('script').forEach(x=>{ // remove all scripts
        Object.keys(x._scriptsIndex).forEach(y => { x.destroy(y); });
    });
//    this.getComponentsInChildren('rigidbody')
    
}
pc.Entity.prototype.getNearestObjectOfType = function(component) {
    return pc.app.root.getComponentsInChildren(component).sort((a,b) => (
        pc.Vec3.distance(this.getPosition(),a.entity.getPosition()) - 
        pc.Vec3.distance(this.getPosition(),b.entity.getPosition())))[0]
}

pc.Entity.prototype.rotate = function(deg) {
    const rotation = this.getRotation(); // Get the current rotation
    const additionalRotation = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, deg); // Rotate 180 degrees around the global y-axis
    const finalRotation = additionalRotation.mul(rotation);
    this.setRotation(finalRotation);
}

pc.Entity.prototype.instantiate = function(pos=pc.Vec3.ZERO,rot=pc.Vec3.ZERO){ 
    let c = this.clone(); 
    pc.app.root.addChild(c); 
    c.enabled=true; 
    c.rigidbody ? c.rigidbody.teleport(pos,rot) : (() => { c.setPosition(pos); c.setEulerAngles(rot);})() ; 
    return c;
}

//pc.Vec3.prototype.rotate = function(angleDegrees) {
//  // Convert the angle from degrees to radians
//  var angleRadians = pc.math.DEG_TO_RAD * angleDegrees;
//
//  // Create a quaternion for the rotation around the y-axis
//  var rotation = new pc.Quat();
//  rotation.setFromAxisAngle(pc.Vec3.UP, angleRadians);
//
//  // Create a quaternion representing the original vector
//  var originalQuat = new pc.Quat(this.x, this.y, this.z);
//  // Rotate the original quaternion by the rotation quaternion
//  var rotatedQuat = new rotation.mul(originalQuat);
//    console.log("RQ:"+rotatedQuat.trunc());
//    this.x = rotatedQuat.x; this.y = rotatedQuat.y; this.z = rotatedQuat.z;
//    return this;
//}
pc.RigidBodyComponent.prototype.translate = function(x,y,z){
    p = this.entity.getPosition();
    this.teleport(p.x+x,p.y+y,p.z+z);
}

pc.RigidBodyComponent.prototype.rotate = function(x,y,z){
    p = this.entity.getPosition();

    r = this.entity.getEulerAngles();
    r2 = r.y+y;
    //console.log("r.y:"+r.y+", plus :"+y+" equals:"+r2);
    //console.log("o:"+p.trunc());
    this.teleport(p,new pc.Vec3(r.x+x,r2,r.z+z));
    //console.log("after:"+this.entity.getEulerAngles().y);
}

pc.Vec3.prototype.rotate = function(angle) { 
  // Create a quaternion representing the rotation
  const quaternion = new pc.Quat().setFromEulerAngles(0,angle,0);
  // Rotate the vector using the quaternion
  const rotatedVector = quaternion.transformVector(this);
    this.x=rotatedVector.x; this.y=rotatedVector.y; this.z=rotatedVector.z;
  return rotatedVector;
}

pc.RigidBodyComponent.prototype.stop = function(){
    this.applyImpulse(this.linearVelocity.mulScalar(-1))
}

pc.Entity.prototype.getComponent = function(componentName) {
    if (this[componentName]) return [this[componentName]];
    else if (this.script && this.script[componentName]) return [this.script[componentName]];
    else return [];
}

pc.Entity.prototype.getScriptsWithAttribute  = function(attribute) {
    var scripts = [];
    this.getComponentsInChildren('script').forEach(x=>{
        x.scripts.forEach(y => {
            if (y[attribute]){
                scripts.push(y);
            }
         });
     }); 
    return scripts;
}

pc.Entity.prototype.getComponentInParent = function(componentName,depth=20) {
    if (depth <= 0) return null;
    if (this.parent){
        const c = this.parent.getComponent(componentName)     
        if (c.length > 0) return c[0];
        else return this.parent.getComponentInParent(componentName,--depth);
    }
}
function FindObjectsWithTag(tag){
    let ret = [];
    pc.app.root.getComponentsInChildren('entity').forEach(x=>{
        if (x.tags.list().includes(tag)) ret.push(x);
    });
    return ret;
}
pc.Entity.prototype.getComponentsInChildren = function(componentName) {
    // checks for scripts (user defined) and components (like 'render', 'meshInstances')
    var components = [];
    var nodes = this.find(
        function(node){ 
            return node[componentName];
        }
    );
    for(var i=0;i<nodes.length; i++){
        var  n = nodes[i];
        components.push(n[componentName]);
    }

    nodes = this.find(
        function(node){ 
            return node.script && node.script[componentName];
        }
    );
    for(var i=0;i<nodes.length; i++){
        var  n = nodes[i];
        components.push(n.script[componentName]);
    }
    return components;
}



// https://forum.playcanvas.com/t/solved-is-there-any-way-to-get-the-points-local-position-when-using-raycast/3680/3 ?
pc.Entity.prototype.worldToLocalPos = function (worldPosition) {
    var mat = this.getWorldTransform().clone().invert(); 
    var localPosition = new pc.Vec3(); 
    mat.transformPoint(worldPosition, localPosition);
    return localPosition;
}

pc.Entity.prototype.localToWorldPos = function (worldPosition) {
    var mat = this.getWorldTransform().clone(); 
    var localPosition = new pc.Vec3(); 
    mat.transformPoint(worldPosition, localPosition);
    return localPosition;
}


pc.Quat.prototype.lerp = function(a,b,t){
    // i'm going to try converting a quat to a vec4 and do linear interpolation between the two, it probably won't work
    // lol it works
    let aa = new pc.Vec4(a.x,a.y,a.z,a.w);
    let bb = new pc.Vec4(b.x,b.y,b.z,b.w);
    let l = new pc.Vec4().lerp(aa,bb,t);
    let quat = new pc.Quat(l.x,l.y,l.z,l.w);
    return quat;
}

pc.Quat.prototype.delta = function(a,b){
    let aa = new pc.Vec4(a.x,a.y,a.z,a.w);
    let bb = new pc.Vec4(b.x,b.y,b.z,b.w);
    return new pc.Vec4().sub2(aa,bb).length();
}
Object.defineProperty(pc.Entity.prototype, 'left', { get: function() { return this.right.clone().mulScalar(-1); } });
Object.defineProperty(pc.Entity.prototype, 'back', { get: function() { return this.forward.clone().mulScalar(-1); } });
Object.defineProperty(pc.Entity.prototype, 'down', { get: function() { return this.up.clone().mulScalar(-1); } });

// JSON stringify / save ops
pc.Vec3.prototype.toJSON = function(){ 
    return [this.x,this.y,this.z];
}

pc.Quat.prototype.toJSON = function(){
    const r = this.getEulerAngles();
    return [r.x,r.y,r.z];
}
