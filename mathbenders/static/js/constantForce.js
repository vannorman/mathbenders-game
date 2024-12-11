var ConstantForce = pc.createScript('constantForce');
ConstantForce.attributes.add('force', { type: 'vec3', default: [0,-2000,0], title: 'Force' });

ConstantForce.prototype.update = function(dt){
    // applyForce automatically does dt do no need to reduce per frame.
    //this.entity.rigidbody.applyForce(this.force.clone().mulScalar(dt));
    this.entity.rigidbody.applyForce(this.force);
}

