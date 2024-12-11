class Gadget2 {
    // no constructor
   onPickup(){
        console.log('gad super pickup');
   }

   onSelect(){
        console.log('gad super select');
   }

   createHeldItemGfx(){
        console.log('gad super crt held item gfx');
   }

}


var Gadget = pc.createScript('gadget');
// Used for pickup detection and fx only

Gadget.attributes.add('onPickupFn', { type: 'object' });
Gadget.attributes.add('type', { type: 'string', default:'none' });
Gadget.attributes.add('subGadget', { type: 'object'});
Gadget.prototype.initialize = function(){
    this.subGadget.name = this.subGadget.entity.name + "script";
//    console.log("init gadget for:"+this.subGadget);
}
Gadget.prototype.onPickup = function(){
    if (this.subGadget.onPickupFn) this.subGadget.onPickupFn();
};

Gadget.prototype.onSelect = function(){
    this.subGadget.onSelectFn();
//    this.subGadget.onSelectSound();
}  

Gadget.prototype.createHeldItemGfx = function(context){ // i hate passing context. why cant this just be this
    let heldItemGfx = null;
    return this.subGadget.createHeldItemGfx(); // i hate this part of javascript, how can i use proper sublcass?
};

Gadget.prototype.onMouseDown = function(){
    this.subGadget.onMouseDown();
};

Gadget.prototype.mouseHeld = function(){
    this.subGadget.mouseHeld();
}

Gadget.prototype.silentUpdate = function(dt){
    this.subGadget.silentUpdate(dt);
}

Gadget.prototype.tryNumberPickup = function(entity){
    return this.subGadget.tryNumberPickup(entity);
}


Gadget.Sword = "Sword";
Gadget.Multiblaster = "Multiblaster";
Gadget.Zooka = "Zooka";
Gadget.Bow = "Bow";
