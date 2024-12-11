var FollowTarget = pc.createScript('followTarget');
FollowTarget.attributes.add('target', { type: 'entity' });

FollowTarget.prototype.initialize = function () {
}

FollowTarget.prototype.update = function (dt) {
    if (!this.target) this.destroy();
    else this.entity.moveTo(this.target.getPosition());
};







