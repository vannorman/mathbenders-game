/*
### PICK UP ITEM
- attached to any instance that a player could pick up like numbers, gadgets
- canPickup may be "false" if the number is in a wall (though .. maybe it's better to simply remove this behavior)
*/
var PickUpItem = pc.createScript('pickUpItem');
PickUpItem.attributes.add('gadget', {type:'boolean',default:false});
PickUpItem.attributes.add('name', { type:'string',default:"Unnamed"});
PickUpItem.attributes.add('limitToOne', {type:'boolean',default:false});
PickUpItem.attributes.add('heldScale', {type:'number',default:1});
PickUpItem.attributes.add('priority', {type:'number',default:1});
PickUpItem.attributes.add('heldRot', {type:'quat',default:new pc.Quat()}); 
PickUpItem.attributes.add('heldPos', {type:'vec3',default:new pc.Vec3(0.7,0.3,-1.2)}); 
PickUpItem.attributes.add('canPickup', {type:'boolean',default:true});
PickUpItem.attributes.add('lastThrownTime', {type:'number',default:0}); // dislike that any behaviors rely on this, eg serverValidation / numberInfo collision


PickUpItem.prototype.onPickup = function(obj){
    //console.log('try');
    if (this.canPickup) Game.player.script.inventory.pickUpItem(obj); 
    // this.fire("PlayerTouchedObject",obj); // request authority from server
}
PickUpItem.prototype.getProperties = function(properties){
    properties.pickUpItem = {
        priority : this.priority,
        canPickup : this.canPickup,
    }
    return properties;
}

PickUpItem.prototype.onThrow = function(){
    this.lastThrownTime = Date.now();
}

PickUpItem.prototype.setProperties = function(properties){
    if (properties.pickUpItem){
        this.priority = properties.pickUpItem.priority;
        this.canPickup = properties.pickUpItem.canPickup;
    } else {
//        console.log("FAIL setprops on pui:"+JSON.stringify(properties));
    }
    return properties;
}

