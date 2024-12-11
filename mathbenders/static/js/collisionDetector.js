var CollisionDetector = pc.createScript('collisionDetector');
CollisionDetector.attributes.add('reportTo', {type:'object'});

CollisionDetector.prototype.initialize = function () {
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
}

CollisionDetector.prototype.onCollisionStart = function (collision) {
    this.reportTo.onCollisionReport(collision);
};


