var ExplodeOnImpact = pc.createScript('explodeOnImpact');
ExplodeOnImpact.attributes.add('force', { type: 'vec3', default: [0,-2000,0], title: 'Force' });

ExplodeOnImpact.prototype.initialize = function () {
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
}

ExplodeOnImpact.prototype.onCollisionStart = function (collision) {
    this.reportTo.onCollisionReport(collision.other);
};






