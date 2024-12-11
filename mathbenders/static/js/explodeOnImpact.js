
var ExplodeOnImpact = pc.createScript('explodeOnImpact');
ExplodeOnImpact.attributes.add('smokeTrailParticleEntity', {    type: 'entity' });
ExplodeOnImpact.attributes.add('radius', {    type: 'number', default: 3.5 });


ExplodeOnImpact.prototype.initialize = function(){
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
}

ExplodeOnImpact.prototype.onCollisionStart = function (result) {
    if (!this.entity.script?.numberInfo) {
        console.log("Error, can't explode without ni numberinfo");
        this.entity.destroy();
        return;
    }

    const frac = this.entity.script.numberInfo.fraction;
    let bodyAndDistSqrTuples = Physics.OverlapSphere({point:this.entity.getPosition(),radius:this.radius})

    bodyAndDistSqrTuples.forEach(tuple=>{
        const entity = tuple[0].entity;
        const distSqr = tuple[1];
        if (entity.getGuid() == this.entity.getGuid()) return;
        if (entity.script && entity.script.numberInfo) {
            const oldDamp = entity.rigidbody.linearDamping;
            entity.rigidbody.linearDamping = 100; 
            const ni = entity.script.numberInfo;
            let result = Fraction.Add(frac, ni.fraction);
            ni.setFractionAfterSeconds(result,distSqr*20);
        }
    });

    const fxSpher = Fx.Explosion({
        position: this.entity.getPosition(),
        startScale: 1.5,
        endScale:this.radius*2,
        duration:0.25
    })

    this.entity.destroy(); 
    this.smokeTrailParticleEntity.destroy();

    
}

