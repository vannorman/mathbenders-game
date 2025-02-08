
var Gadget_Old = pc.createScript('gadget');
// Used for pickup detection and fx only

Gadget_Old.attributes.add('onPickupFn', { type: 'object' });
Gadget_Old.attributes.add('type', { type: 'string', default:'none' });
Gadget_Old.attributes.add('subGadget', { type: 'object'});
Gadget_Old.prototype.initialize = function(){
    this.subGadget.name = this.subGadget.entity.name + "script";
//    console.log("init gadget for:"+this.subGadget);
}
Gadget_Old.prototype.onPickup = function(){
    if (this.subGadget.onPickupFn) this.subGadget.onPickupFn();
};

Gadget_Old.prototype.onSelect = function(){
    this.subGadget.onSelectFn();
//    this.subGadget.onSelectSound();
}  

Gadget_Old.prototype.createHeldItemGfx = function(context){ // i hate passing context. why cant this just be this
    let heldItemGfx = null;
    return this.subGadget.createHeldItemGfx(); // i hate this part of javascript, how can i use proper sublcass?
};

Gadget_Old.prototype.onMouseDown = function(){
    this.subGadget.onMouseDown();
};

Gadget_Old.prototype.mouseHeld = function(){
    this.subGadget.mouseHeld();
}

Gadget_Old.prototype.silentUpdate = function(dt){
    this.subGadget.silentUpdate(dt);
}

Gadget_Old.prototype.tryNumberPickup = function(entity){
    return this.subGadget.tryNumberPickup(entity);
}


Gadget_Old.Sword = "Sword";
Gadget_Old.Multiblaster = "Multiblaster";
Gadget_Old.Zooka = "Zooka";
Gadget_Old.Bow = "Bow";
