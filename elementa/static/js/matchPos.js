var matchPos = pc.createScript('matchPos');

// TODO: Adjust nearClip when we are farther from the portal.

matchPos.attributes.add('targetObject', { type: 'entity' }); // portal we are standing in front of

matchPos.prototype.postUpdate = function(dt){
    this.entity.moveTo(this.targetObject.getPosition());
}
