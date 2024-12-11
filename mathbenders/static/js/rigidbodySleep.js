var RigidbodySleep = pc.createScript('rigidbodySleep');
RigidbodySleep.attributes.add('radius', {type:'number',default:12});


RigidbodySleep.prototype.initialize = function(){
    this.frames = 0;
    this.cachedCamPos = Camera.main.entity.getPosition();
    this.rigidbodyType = this.entity.rigidbody.type;
    this.timer = 0.4;
}
RigidbodySleep.prototype.update = function(dt){
    this.frames --;
    if (this.frames > 0) return;
    this.frames = math.random(5,10);
    if (this.entity.rigidbody.type == this.rigidbodyType){
        let d = pc.Vec3.distance(this.entity.getPosition(),Game.player.getPosition())
        if (d > this.radius){
            this.timer -= dt;
            if (this.timer < 0){
                this.entity.rigidbody.type = pc.RIGIDBODY_TYPE_KINEMATIC;
            }
        }
    } else if (pc.Vec3.distance(this.entity.getPosition(),Game.player.getPosition()) < this.radius) {
        this.timer = 0.4;
        this.entity.rigidbody.type = this.rigidbodyType;
    }
};

