var AlwaysFaceCamera = pc.createScript('alwaysFaceCamera');
AlwaysFaceCamera.attributes.add('reverse', {type:'bool',default:false});
AlwaysFaceCamera.attributes.add('useRadius', {type:'bool',default:false});
AlwaysFaceCamera.attributes.add('radius', {type:'number',default:12});


AlwaysFaceCamera.prototype.initialize = function(){
    this.frames = 0;
    if (Camera && Camera.main) this.cachedCamPos = Camera.main.entity.getPosition();
    else this.cachedCamPos = pc.Vec3.ZERO;
}
AlwaysFaceCamera.prototype.update = function(dt){
    // TODO: For NumberInfo make this a floater follower, not a child, because if its a child it responds to the rotation of the parent
    // If player was behind a portal, then face the nearest portal instead.
//    if (this.entity.getPosition()

    if (this.useRadius && pc.Vec3.distance(this.entity.getPosition(),this.cachedCamPos) > this.radius) return;
    if (this.reverse){
        const q = Quaternion.LookRotation(this.entity.getPosition().clone().sub(this.cachedCamPos));
        this.entity.setRotation(q);
    } else {
        const q = Quaternion.LookRotation(this.cachedCamPos.clone().sub(this.entity.getPosition()));
        this.entity.setRotation(q);
    
    }
};

AlwaysFaceCamera.prototype.camPos = function(){
    return this.cachedCamPos; // this func is way too slow with hundreds of objs. lol  need optimize plz
    // don't seek it every frame
    this.frames--;
    if (this.frames < 1) {
        this.frames = 30;
        this.cachedCamPos = this.entity.getNearestObjectOfType('camera').entity.getPosition();
    } else {
    }
    return this.cachedCamPos;

}


