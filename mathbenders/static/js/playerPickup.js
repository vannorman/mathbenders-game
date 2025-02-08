/*
### PLAYER PICKUP
- lives on the Player instance and handles the collision/detection of picking up items
- handles "did the server give me permission to pick this item up?"
*/

var PlayerPickup = pc.createScript('playerPickup');

// Add an attribute for the hand entity
// PlayerPickup.attributes.add('handEntity', { type: 'entity' }); // reference to Player.handEntity


PlayerPickup.prototype.initialize = function() {
    // Add trigger component to player entity
    this.collisionStay= false;
    this.collidedEntity = null;
    // this.entity.collision.on('triggerenter', this.onTriggerEnter, this); // playcanvas uses collision only?
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
    this.entity.collision.on('collisionend', this.onCollisionEnd, this);
};

PlayerPickup.prototype.hasOwnership = function(obj){
    const ownerId = obj.script?.networkObjectInfo?.ownerId;
    return ownerId == clientId;
};

PlayerPickup.prototype.onCollisionEnd = function(other) {
    // move to "tag" of "isPickUpItem"
    this.collisionStay = false;
    if (other.script && other.script.pickUpItem){
        this.collidedEntity = null;
    }

};
PlayerPickup.prototype.onCollisionStart = function(result) {
    // move to "tag" of "isPickUpItem"
    if (result.other.script && result.other.script.pickUpItem){  // legacy
        this.collisionStay = true;
        this.collidedEntity = result.other;
    }
    if (result.other.tags.list().includes(Constants.Tags.PlayerCanPickUp)){  // new way
        if (result.other.script?.numberInfo) {
            Player.interactWithNumber({entity:result.other});
        } else {
            Player.interactWithObject({entity:result.other});
        }
        this.collidedEntity = result.other;
    }

};

PlayerPickup.prototype.update = function(dt) {
    if (this.collisionStay){
        //if (this.hasOwnership(this.collidedEntity)){ // for network/multiplayer
          //  PlayerPickup.pickUpItem(this.collidedEntity);
            this.onCollisionEnd(this.collidedEntity);
        //}
    }
};



