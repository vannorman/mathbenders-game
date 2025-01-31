/*
### PLAYER PICKUP
- lives on the Player instance and handles the collision/detection of picking up items
- handles "did the server give me permission to pick this item up?"
*/

var PlayerPickup = pc.createScript('playerPickup');

// Add an attribute for the hand entity
PlayerPickup.attributes.add('handEntity', { type: 'entity' }); // reference to Player.handEntity


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
    if (other.script && other.script.pickUpItem){
        this.collisionStay = false;
        this.collidedEntity = null;
    }

};
PlayerPickup.prototype.onCollisionStart = function(result) {
    // move to "tag" of "isPickUpItem"
    if (result.other.script && result.other.script.pickUpItem){
        this.collisionStay = true;
        this.collidedEntity = result.other;
    }
};

PlayerPickup.prototype.update = function(dt) {
    if (this.collisionStay){
        //if (this.hasOwnership(this.collidedEntity)){ // for network/multiplayer
            PlayerPickup.pickUpItem(this.collidedEntity);
            this.onCollisionEnd(this.collidedEntity);
        //}
    }
};

PlayerPickup.pickUpItem = function(obj){
    console.log("TODO: Add lsitener from inventory to pickupitem");
    console.log("TODO: consider how to implement pickup hierarchy e.g. dont pick up a number when multiblaster equipped.");
    console.log("TODO: consider the set of all triggers the player may touch that could affect inventory or items or amunition");
    console.log("TODO: consider the difference between 'pickupitem.heldPos/heldRot' which assumes Inventory will clone item exactly, strip it, then position it in the 'hand', vs. gadget.heldPos/heldRot and having a special case for other non-gadget pickup items which need their own 'way' to be held");



    if (obj.script && obj.script.pickUpItem)
        obj.script.pickUpItem.onPickup(obj); // fire event to picked up object in case there are effects
}



