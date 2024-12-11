/*
### PLAYER PICKUP
- lives on the Player instance and handles the collision/detection of picking up items
- handles "did the server give me permission to pick this item up?"
*/

var PlayerPickup = pc.createScript('playerPickup');

// Add an attribute for the hand entity
PlayerPickup.attributes.add('handEntity', { type: 'entity' });

PlayerPickup.prototype.initialize = function() {
    // Add trigger component to player entity
    this.collisionStay= false;
    this.collidedEntity = null;
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
    this.entity.collision.on('collisionend', this.onCollisionEnd, this);
};

PlayerPickup.prototype.hasOwnership = function(obj){
    const ownerId = obj.script?.networkObjectInfo?.ownerId;
    return ownerId == clientId;
};

PlayerPickup.prototype.onCollisionEnd = function(other) {
    if (other.script && other.script.pickUpItem){
        this.collisionStay = false;
        this.collidedEntity = null;
    }

};
PlayerPickup.prototype.onCollisionStart = function(result) {
    if (result.other.script && result.other.script.pickUpItem){
        this.collisionStay = true;
        this.collidedEntity = result.other;
    }
};

PlayerPickup.prototype.update = function(dt) {
    if (this.collisionStay){
        // network verwsion

        //if (this.hasOwnership(this.collidedEntity)){
            PlayerPickup.pickUpItem(this.collidedEntity);
            this.onCollisionEnd(this.collidedEntity);
        //}
    }
};

PlayerPickup.pickUpItem = function(obj){
    if (obj.script && obj.script.pickUpItem)
        obj.script.pickUpItem.onPickup(obj);
}



