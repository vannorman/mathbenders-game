var RecordPosition = pc.createScript('recordPosition');

RecordPosition.prototype.initialize = function () {
    this.lastPosition = this.entity.getPosition().clone();
    this.nowPosition = this.entity.getPosition().clone();
};

RecordPosition.prototype.update = function () {
    this.lastPosition.copy(this.nowPosition);
    this.nowPosition.copy(this.entity.getPosition());
};
