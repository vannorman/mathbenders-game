var NoGravity = pc.createScript('nogravity');
NoGravity.attributes.add('force', { type: 'vec3', default: [0,-2000,0], title: 'Force' });

NoGravity.prototype.update = function(dt){
    // applyForce automatically does dt do no need to reduce per frame.
    //this.entity.rigidbody.applyForce(this.force.clone().mulScalar(dt));
    this.entity.rigidbody.applyForce(pc.app.systems.rigidbody.gravity.clone().mulScalar(-1).mulScalar(this.entity.rigidbody.mass));
}


