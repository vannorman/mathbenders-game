var CollisionDetector = pc.createScript('collisionDetector');
CollisionDetector.attributes.add('reportTo', {type:'object'});

CollisionDetector.prototype.initialize = function () {
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
}

CollisionDetector.prototype.onCollisionStart = function (collision) {
    // Todo: Instead of reportTo, which requires an object reference, simply pass the function we are calling 
    this.reportTo.onCollisionReport(collision);
};


