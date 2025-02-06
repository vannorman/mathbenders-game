import InventorySlot from './slot.js';

export default class Inventory {

    // New architecutre
    // class PlayerItemCollisionDetector which broadcasts item collision events (e..g player walks into a Multiblaster or Number)
    // Inventory subscribes to collision events to decide what to do with them

    /*
        subscribe(Player.collisionDetector.

    */


    beltSlots;
    backpackSlots;
    // backpackSlots = Array.from({ length: 1 }, (_, index) => new InventorySlot({index:index}));
    get allSlots() { return [ ...this.beltSlots, ...this.backpackSlots]; }
    get firstAvailableSlot() { return this.allSlots.find(x=> !x.isUsed) || null; }

    constructor(args={}){
        const {Player}=args;
        this.Player = Player;
        const group = InventoryGui.createLayoutGroup();
        
        // Create, then Add belt slots to gui group
        this.beltSlots = Array.from({ length: 9 }, (_, index) => new InventorySlot({index:index}));
        this.beltSlots.forEach(x=>{group.addChild(x.slotBackground.entity)});

        // Create, then Add backpack slots to gui group
        this.backpackSlots = Array.from({ length: 1 }, (_, index) => new InventorySlot({index:index}));


        this.Player.screen.addChild(group);
        this.setupScript(); // old script
    }

    setupScript() {
        // TODO : WE don't need a 'script' / entity here; since inventory "lives" on the player 
        // and has no physical manifestation it needs no entity script (Monobehaviour)

         this.script = this.Player.entity.script.create('inventory',{attributes:{
            pivot:this.Player.pivot,
            player:this.Player.entity,
            droppedPosition:this.Player.droppedPosition,
            getItemFn : (x)=>{AudioManager.play({source:assets.sounds.getItem});},
            placeItemFn : (x)=>{AudioManager.play({source:assets.sounds.placeItem});},
            throwSoundFn : (x)=>{AudioManager.play({source:assets.sounds.throwItem});},
            selectItemFn : (x)=>{AudioManager.play({source:assets.sounds.selectItem});},
    //        placeItemDownFn : (x)=>{AudioManager.play({source:assets.sounds.thud});},
        }});
    }


    collectEntity(entity){
        const template = entity._templateInstance;

        let availableSlot = this.firstAvailableSlot;
        if (availableSlot) {
            availableSlot.placeItem({template:template,properties:template.properties});
            entity.destroy();
            console.log("Pickup:"+template.name);
        } else {
            PlayerMessenger.Say("Inventory full!"); 
        }

        // Check if item can be collected or combined in one of these cases:
        // If yes, place the slot where item will be collected (or added to gadget)
        // If no, fail to collect item.
       
        // Cases 1: collectItem on Number
            // Case 1: Nothing held, Number picked up
            // Case 2: Number held, Number picked up
            // Case 3: Gadget held, Number picked up, Loaded as ammo
            // Case 4: Gadget held, Number picked up, Not loaded as ammo
            // Case 5: Gadget held, Not loaded, Inventory full
            // Case 6: Something else held, Number picked up
            // Case 7: Number held, inventory full
        // Cases 2: collectItem on Gadget
            // Case 1: Nothing held
            // Case 2: Number held
            // Case 3: Another gadget held
            // Case 4: Another item held
            // Case 5: Inventory full
    }


    beginDrag(){

    }

    endDrag(){
    
    }

    hide(){
        this.script.screen.enabled=false;
        this.script.enabled=false;
        this.enabled=false;
    }

    show(){
        this.script.screen.enabled=true;
        this.script.enabled=true;
        this.enabled=true;
    }


}

class InventoryGui {

    static numberIcons = {
            numberCubePos:assets.textures.ui.numberCubePos,
            numberCubeNeg:assets.textures.ui.numberCubeNeg,
            numberSpherePos:assets.textures.ui.numberSpherePos,
            numberSphereNeg:assets.textures.ui.numberSphereNeg,
    }


    // todo / duplicated in inventory_old.js
    constructor(args={}){
       this.guiParent = new pc.Entity();
       pc.app.root.addChild(this.guiParent);
    }

    static createLayoutGroup(){
        // Create Layout Group Entity
        const group = new pc.Entity();
        group.addComponent("element", {
            type: pc.ELEMENTTYPE_GROUP,
            layers:[pc.LAYERID_UI],
            anchor: [0.5, 0.05, 0.5, 0.05],
            pivot: [0.5, 0.5],
            width: 700,
            height: 70,
        });

        group.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_HORIZONTAL,
            spacing: new pc.Vec2(10, 10),
            widthFitting: pc.FITTING_BOTH,
            heightFitting: pc.FITTING_BOTH,
            wrap: true,
        });
        return group;
    }


    createBeltImages() { // old
        /*
        this.beltEntities = []
        this.selectedSlot = 0;
        this.beltItemImages = [];
        this.screen = new pc.Entity();
        this.screen.addComponent("screen", {
            referenceResolution: new pc.Vec2(Constants.Resolution.width,Constants.Resolution.height),
            scaleBlend: 0.5,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true,
        });

       this.guiParent.addChild(this.screen);

        // Create Layout Group Entity
        const group = new pc.Entity();
        this.inventoryGroup = group;
        group.addComponent("element", {
            // a Layout Group needs a 'group' element component
            type: pc.ELEMENTTYPE_GROUP,
            layers:[pc.LAYERID_UI],
            anchor: [0.5, 0.05, 0.5, 0.05],
            pivot: [0.5, 0.5],
            // the element's width and height dictate the group's bounds
            width: 700,
            height: 70,
        });

        group.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_HORIZONTAL,
            spacing: new pc.Vec2(10, 10),
            // fit_both for width and height, making all child elements take the entire space
            widthFitting: pc.FITTING_BOTH,
            heightFitting: pc.FITTING_BOTH,
            // wrap children
            wrap: true,
        });

        this.screen.addChild(group);

        // create 9 children to show off the layout group
        for (let i = 0; i < 9; ++i) {
            // create a random-colored panel
            const child = new pc.Entity("inv"+i);
            this.beltEntities.push(child);
            child.addComponent("element", {
                anchor: [0.5, 0.5, 0.5, 0.5],
                pivot: [0.5, 0.5],
                type: 'image',
                textureAsset: assets.quad,
            });

            child.addComponent("layoutchild", {
                excludeFromLayout: false,
            });

            group.addChild(child);

            // add a child image
            const childImage = new pc.Entity("invImg"+i);
            this.beltItemImages.push(childImage);
            childImage.addComponent("element", {
                anchor: [0.5, 0.5, 0.5, 0.5],
                pivot: [0.5, 0.5],
                width:64,
                height:64,
                type: 'image',
                textureAsset: null,
                useInput: true,
                layer: pc.LAYERID_UI
            });
            child.addChild(childImage);
            childImage.element.index = i;
        }
        */
    }
}

var Inventory_Old = pc.createScript('inventory');

// Initialize attributes
Inventory_Old.attributes.add('beltSlots', {    type: 'number',    default: 9, description: 'The number of slots in the belt' });
Inventory_Old.attributes.add('inventorySlots', {    type: 'vec2',    default: new pc.Vec2(5, 3),    description: 'The size'});
Inventory_Old.attributes.add('player', {    type: 'entity'});
Inventory_Old.attributes.add('pivot', {    type: 'entity'});
Inventory_Old.attributes.add('heldItem', {    type: 'entity'});
Inventory_Old.attributes.add('heldItemGfx', {    type: 'entity'});
Inventory_Old.attributes.add('getItemFn', {    type: 'object' });
Inventory_Old.attributes.add('throwSoundFn', {    type: 'object' });
Inventory_Old.attributes.add('placeItemFn', {    type: 'object' });
Inventory_Old.attributes.add('selectItemFn', {    type: 'object' });
Inventory_Old.attributes.add('placeItemDownFn', {    type: 'object' });

Inventory_Old.prototype.getThrownItemPosition= function(){
    let p = this.getDroppedPosition();
    return p.add(new pc.Vec3(0,1,0));
}

Inventory_Old.prototype.getDroppedPosition = function(){
    const dir = Utils3.flattenVec3(Camera.main.entity.forward).normalize();
    const throwStartDist = 0.79;
    const p = Player.entity.getPosition().clone().add(dir.mulScalar(throwStartDist));
    return p;
};


// Initialize
Inventory_Old.prototype.initialize = function() {
    Object.defineProperty(Inventory_Old.prototype, "heldItemTemplateName", {
       get : function() { return this.heldItemProperties?.templateName }, 
       set : function(value) { this.heldItemProperties = {templateName:value}}
    });
    Object.defineProperty(Inventory_Old.prototype, "heldItemProperties", {
       get  : () => { return this.beltItems[this.selectedSlot];  } ,
       set : function(value) { this.heldItemProperties = value }
    });
    this.thrownItems = {};
    this.beltItems = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, null])); // object with 10 null enties 0-9

    this.inventory = new Array(this.inventorySlots.x * this.inventorySlots.y).fill(null);
    this.beltIndex = 0;
    this.inventoryGroup = null;
    this.inventoryGroupAnimating = false;
    this.inventoryGroupYTarget = 0;

    this.itemBeingDragged = false;
    this.throwSpeed = 10;

    // Bind event handlers
    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    this.mouseHeld = false;
    this.inventoryShown = false;
    this.mouse = {x:0,y:0}
    this.hoveredItemIndex = null;
    this.createBeltGui();
};
Inventory_Old.prototype.onMouseMove = function(event){
    this.hoveredItemIndex = null;
    this.mouse.y = Mouse.y;
    this.mouse.x = Mouse.x;
    this.beltItemImages.forEach(x=>{
        const sc = x.element.screenCorners;
        if (this.mouse.x > sc[0].x && this.mouse.x < sc[2].x && this.mouse.y > sc[0].y && this.mouse.y < sc[2].y){
            this.hoveredItemIndex = this.beltItemImages.indexOf(x);
//            x.element.color = pc.Color.GREEN;
        }
    }); 
};

Inventory_Old.prototype.pickUpItem = function(entity){

    // Pick up gadget, number, or "other random item"
    // pickUpItem script should hold "helditemrot, helditempos" ?
    // pickUpItem script should contain "onpickup" method, gadget pickup can have Player.inventory.collectGadget(gadgetName)?

    if (!Player.inventory.enabled) return;
    // Make sure not to pick up items weve just thrown.
    if (Object.keys(this.thrownItems).includes(entity.getGuid())) {
    //    console.log("ignoring item we just threw:"+entity.getGuid());
        return;
    }

    // get first available belt slot
    // if no available belt slots put in inventory
    // if no available inventory slots don't allow player to pick up and broadcast message that inventory is full

    let pickup = entity.script.pickUpItem;

    if (!entity.script.objectProperties) console.log("%c Player couldn't interact with "+entity.name+" as it lacked ObjectProperties","Color:red");
    const properties = entity.script.objectProperties.getObjectProperties();
    properties.ancestors = undefined; // dislike, but not sure best way to trim ancestors on pickup 
        

    const gadget = this.heldItem?.script?.gadget;

    // Held item was gadget, picked up number -> LOAD NUMBER
    if (gadget && gadget.tryNumberPickup(entity)){
        // console.log("loaded number: "+entity.name);
        return;
    } else {
//        console.log("Fail pickup w gadget:"+gadget?.entity.name);
    }

    // Belt full -> SKIP
    var emptyBeltSlotIndex = -1;
    for(var i=0;i<10;i++){
        if (this.beltItems[i] == null) {
            emptyBeltSlotIndex = i;
            break;
        }
    }
    if (emptyBeltSlotIndex == -1){ 
        console.log("inventory full");
        return;
    }

    // Duplicate gadget -> SKIP
    if (entity.script.gadget && this.hasGadget(properties.templateName)){
    //    console.log("Won't grab duplicate gadget: "+noi.objectProperties.templateName)
        return;
    }


    if (entity.script.gadget){
        entity.script.gadget.onPickup(); // soundfx - any other fx? Can this live 100% on pickupitem? dislike
    }

    entity.remove();
    entity.destroy();

     if (this.getItemFn) this.getItemFn(); // Inventory_Old's get item function (pickup sound?)
    this.placeInventory_OldItem(emptyBeltSlotIndex,properties);
    this.selectSlot({slotIndex:emptyBeltSlotIndex,force:true,pickup:true});
};


Inventory_Old.prototype.hasGadget = function(templateName){
    var hasThisGadgetAlready = false;
    Object.keys(this.beltItems).forEach(i => {
        if (this.beltItems[i]?.templateName == templateName){
//            console.log("Match:"+templateName);
            hasThisGadgetAlready = true;
            return;
        }
    });
    return hasThisGadgetAlready;
};

Inventory_Old.prototype.placeInventory_OldItem = function(i, props){
    this.beltItems[i] = props;
    const templateName = props.templateName; 
    // Clear existing text if any.
    const text = this.beltItemImages[i]?.findByName("text"); // dislike that we're hardcoding text as a reference to find this child text element
    if (text) text.destroy();

    const nip = props.numberInfo;
    let icon = null;

    if (nip){
        // Object was a number, so let's add number text, icon
        if (props.templateName == "NumberCube" && nip.fraction.numerator > 0) icon = InventoryGui.numberIcons.numberCubePos;
        else if (props.templateName == "NumberCube" && nip.fraction.numerator < 0) icon = InventoryGui.numberIcons.numberCubeNeg;
        else if (props.templateName == "NumberSphere" && nip.fraction.numerator > 0) icon = InventoryGui.numberIcons.numberSpherePos;
        else if (props.templateName == "NumberSphere" && nip.fraction.numerator < 0) { icon = InventoryGui.numberIcons.numberSphereNeg; }
        if (icon) {
            this.beltItemImages[i].element.textureAsset = icon;
            const color = nip.fraction.numerator > 0 ? pc.Color.BLACK : pc.Color.WHITE;
            const text =  Fraction.getFractionAsString(nip.fraction);
            this.addTextToEntity({entity:this.beltItemImages[i],color:color,text:text});
        }
   } else{
        icon = Game.templateIcons[templateName];

    }
    this.beltItemImages[i].element.textureAsset = icon; 

};

Inventory_Old.prototype.addTextToEntity = function(options){

    const { color = pc.Color.BLACK, entity, text } = options;
    const textEnt = entity.findByName("text"); // dislike that we're hardcoding text as a reference to find this child text element
    if (textEnt) textEnt.destroy();
    const c = new pc.Entity("text");
         c.addComponent("element", {
        // center-position and attach to the borders of parent
        // meaning this text element will scale along with parent
        anchor: [0, 0, 1, 1],
        margin: [0, 0, 0, 0],
        pivot: [0.5, 0.5],
        layers:[pc.LAYERID_UI],
        color: color,
        fontAsset: assets.font,
        text: text,
        type: pc.ELEMENTTYPE_TEXT,
        // auto font size
        autoWidth: false,
        autoHeight: false,
        autoFitWidth: true,
        autoFitHeight: true,
    });
    entity.addChild(c);

};
Inventory_Old.prototype.toggleInventory_Old = function() {
    this.inventoryShown = !this.inventoryShown;
    if (!this.inventoryShown){
        this.stopDraggingItem();
    }
 
     // Disable other scripts on this entity.
    for(let i=0;i<this.entity.script.scripts.length;i++){
        let s = this.entity.script.scripts[i];
        if (s == this) continue;
        else {
            s.enabled = !this.inventoryShown;
        }
    }
    this.inventoryGroupYTarget = this.inventoryShown ? 350 : 0;
    this.inventoryGroupAnimating = true;
    if (this.inventoryShown){
        Player.freeze();
        Mouse.UnlockCursor();
    } else {
        Player.unfreeze();
        Mouse.LockCursor(); 
    }
    // Logic for opening and closing inventory goes here
    // This may involve showing or hiding UI elements and changing the mouse lock state
};
Inventory_Old.prototype.onMouseDown = function(event) {
    if (!Player.inventory.enabled) return;
    
    this.mouseHeld = true;
    if (this.inventoryShown){
        if (this.hoveredItemIndex != null && this.beltItems[this.hoveredItemIndex] != null){
            this.itemMouseDown(this.hoveredItemIndex);
        }
        // handle click drag swap
    }  else {
        if (this.heldItem && this.heldItem.script && this.heldItem.script.gadget){
            this.heldItem.script.gadget.onMouseDown();
       } else {
            this.throwSelectedItem(); // or use selected gadget
        }
    }
};
Inventory_Old.prototype.removeTextIfExists = function(i) {
    const text = this.beltItemImages[i].findByName("text");
    if (text) text.destroy();
};

Inventory_Old.prototype.getThrownItemVelocity = function(){
    return Camera.main.entity.forward.clone().mulScalar(this.throwSpeed).add(new pc.Vec3(0,Game.tf,0));
};

Inventory_Old.prototype.throwSelectedItem = function(event) {

    // Handle picking up items when the mouse button is pressed
    if (this.beltItems[this.selectedSlot] != null){
        this.removeTextIfExists(this.selectedSlot);
        this.heldItemGfx.destroy();
        this.heldItemGfx = null;
        const templateName = this.beltItems[this.selectedSlot].templateName;
        var properties = this.beltItems[this.selectedSlot]; // dislike, still contains ancestors..
        // !Important! TODO : This "properties" was a JSON friendly Vec3 with nested numberInfo, etc. but now we're setting position and rotation manually, since Game.Instantaite() expects PlayCanvas style vec3 for these values.
        // TODO: Unify the data model for ObjectProperties so that it's always the same format, not "sometimes Playcanvas vec3 sometimes JSON vec3".
        properties.position = this.getThrownItemPosition();
        properties.rotation = pc.Vec3.ZERO; 
        properties.rigidbodyVelocity = this.getThrownItemVelocity();
        const forceMultiplier = templateName == "NumberSphere" ? 1.6 : 1;
        properties.rigidbodyVelocity.mulScalar(forceMultiplier);
        properties.enabled = true;
        let thrownItem = Game.Instantiate[templateName](properties);  // this only works in client side prediction mode. .
        //let thrownItem = Game.Instantiate[templateName](properties);  // this only works in client side prediction mode. .
        thrownItem.enabled=true;
       if (!thrownItem){
            console.log("nothrow?");
            return;
        }
        this.thrownItems[thrownItem.getGuid()] = { thrownTime : Date.now()};

        thrownItem.script.pickUpItem.onThrow(); //fire("throw",thrownItem); 
        this.throwSoundFn();
        this.clearBeltItem(this.selectedSlot);
        this.heldItem.destroy();
        this.heldItem.remove();
        this.heldItem = null;
       Game.t = thrownItem;

       // TODO - somehow the properties.position and properties.rotation is NaN, NaN after this, which makes no sense
       // because we're manually setting properties.positiona nd properties.rotation here ...
    }
};

Inventory_Old.prototype.clearBeltItem = function(i){
    this.beltItems[i] = null;

    if (this.beltItemImages[i]?.element) this.beltItemImages[i].element.textureAsset = null;
    const text = this.beltItemImages[i]?.findByName("text"); // dislike that we're hardcoding text as a reference to find this child text element
    if (text) text.destroy();
 
};

Inventory_Old.prototype.onMouseUp = function(event) {
    this.mouseHeld = false;
    $('#application').css('cursor','auto');
    if (this.inventoryShown){
        if (this.hoveredItemIndex != null) {
            this.itemMouseUp(this.hoveredItemIndex);
        } else if (this.itemBeingDragged) {
            this.returningDraggedItem = true;
        }
    }
    // Handle releasing items when the mouse button is released
};


// Swap method
Inventory_Old.prototype.swap = function(sourceIndex, destinationIndex) {
    this.placeItemFn();
    if (this.beltItems[destinationIndex]) {
        // Drop one item onto another item
        const frac1 = this.draggedItemProperties.numberInfo?.fraction 
        const frac2 = this.beltItems[destinationIndex].numberInfo?.fraction;
        if (frac1 && frac2){
            // Drop one item onto another item, both numbers
            console.log("adding "+frac1.numerator+", "+frac2.numerator);
            this.modifyInventoryNumber(destinationIndex,(x) => { return Fraction.Add(frac1,x) });
        } else {
            // Swap
            this.placeInventory_OldItem(sourceIndex,this.beltItems[destinationIndex]);
            this.placeInventory_OldItem(destinationIndex,this.draggedItemProperties);
            this.updateSelectedGfx();
        }
    } else {
        console.log("%c this shouldn't happen.","color:red");
        // we dropped one item onto nothing. Place it.
        this.placeInventory_OldItem(destinationIndex,this.beltItems[sourceIndex]);
        console.log("Place:"+destinationIndex+", wW:"+JSON.stringify(this.beltItems[sourceIndex])+", " +JSON.stringify(this.beltItems[destinationIndex]));
    }
};

Inventory_Old.prototype.updateSelectedGfx = function(){
    this.selectSlot({slotIndex:this.selectedSlot,force:true});
}



Inventory_Old.prototype.createBeltGui = function(){
    return;
    this.beltEntities = []
    this.selectedSlot = 0;
// Create a 2D screen
    this.beltItemImages = [];
    this.screen = new pc.Entity();

    this.screen.addComponent("screen", {
        referenceResolution: new pc.Vec2(1280, 720),
        scaleBlend: 0.5,
        scaleMode: pc.SCALEMODE_BLEND,
        screenSpace: true,
    });

   this.entity.addChild(this.screen);

    // Create Layout Group Entity
    const group = new pc.Entity();
    this.inventoryGroup = group;
    group.addComponent("element", {
        // a Layout Group needs a 'group' element component
        type: pc.ELEMENTTYPE_GROUP,
        layers:[pc.LAYERID_UI],
        anchor: [0.5, 0.05, 0.5, 0.05],
        pivot: [0.5, 0.5],
        // the element's width and height dictate the group's bounds
        width: 700,
        height: 70,
    });

    group.addComponent("layoutgroup", {
        orientation: pc.ORIENTATION_HORIZONTAL,
        spacing: new pc.Vec2(10, 10),
        // fit_both for width and height, making all child elements take the entire space
        widthFitting: pc.FITTING_BOTH,
        heightFitting: pc.FITTING_BOTH,
        // wrap children
        wrap: true,
    });

    this.screen.addChild(group);

    // create 9 children to show off the layout group
    for (let i = 0; i < 9; ++i) {
        const child = new pc.Entity("inv"+i);
        this.beltEntities.push(child);
        child.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            textureAsset: assets.quad,
        });

        child.addComponent("layoutchild", {
            excludeFromLayout: false,
        });

        group.addChild(child);

        // add a child image
        const childImage = new pc.Entity("invImg"+i);
        this.beltItemImages.push(childImage);
        childImage.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width:64,
            height:64,
            type: 'image',
            textureAsset: null,
            useInput: true,
            layer: pc.LAYERID_UI
        });
        child.addChild(childImage);
        childImage.element.index = i;
    }
};


Inventory_Old.prototype.itemMouseDown = function(i) {
    if (this.inventoryShown && this.beltItems[i] != null){
        // we mouse click on something. Begin dragging.
        $('#application').css('cursor','none');
        this.itemBeingDragged = true;
        this.draggedItemGfx = this.beltItemImages[i].clone();
        this.draggedItemGfx.name="DraggedItemGfx";
        this.draggedItemProperties = { ... this.beltItems[i]};
        this.draggedItemIndex = i;
        this.screen.addChild(this.draggedItemGfx);
        this.clearBeltItem(i);
        this.updateSelectedGfx();
    }
};

Inventory_Old.prototype.stopDraggingItem = function(){
    if (this.draggedItemGfx && this.itemBeingDragged){
        this.returningDraggedItem = true;
    }
}

Inventory_Old.prototype.clearDraggedItem = function(){
    this.itemBeingDragged = false;
    this.draggedItemProperties = null;
    this.draggedItemGfx.destroy();
    this.draggingItem = false;
    this.returningDraggedItem = false;
}

Inventory_Old.prototype.itemMouseUp = function(i) {
    if (this.itemBeingDragged && this.inventoryShown){
        const itemBeingDragged = this.beltItems[this.draggedItemIndex];
        const itemDroppedOnto = this.beltItems[i];

        if (itemDroppedOnto != null){
            this.swap(this.draggedItemIndex,i);
            
        } else if (itemDroppedOnto == null) {
            this.placeInventory_OldItem(i,this.draggedItemProperties);
            this.draggedItemIndex = null;
            this.updateSelectedGfx();
        }

        this.clearDraggedItem();

        
                // add
//                
                
    }
};

Inventory_Old.prototype.postUpdate = function(dt){
    if (this.itemBeingDragged && !this.returningDraggedItem){
        const canvas = pc.app.graphicsDevice.canvas;
        const x = this.mouse.x/canvas.width;
        const y = this.mouse.y/canvas.height;
        this.draggedItemGfx.element.anchor = new pc.Vec4(x, y, x, y);
        this.draggedItemGfx.element.pivot = new pc.Vec2(0.5, 0.5);
    }
};



Inventory_Old.prototype.onKeyDown = function(event) {
    // Handle number keys for belt slots
    if (event.key >= pc.KEY_1 && event.key <= pc.KEY_9) {
        var slotIndex = event.key - pc.KEY_1;
        this.selectSlot({slotIndex:slotIndex});
    }
    if (event.key === pc.KEY_I) {
        this.toggleInventory_Old();
    }
    if (event.key === pc.KEY_W || event.key === pc.KEY_Q || event.key === pc.KEY_E || event.key === pc.KEY_D){
        if (this.inventoryShown) {
            this.toggleInventory_Old();
        }
    }
};

Inventory_Old.prototype.selectSlot = function(options){
    const { slotIndex,force=false,pickup=false } = options;
    if (this.selectedSlot != slotIndex ||  force){
        if (this.heldItemGfx != null){
            this.heldItemGfx.destroy();
            this.heldItemGfx = null;
        }
        // Change the background to "highlight" the selected slot.    
        if (this.beltEntities[this.selectedSlot]){
            this.beltEntities[this.selectedSlot].element.textureAsset = assets.quad; 
        }
        // bltEntities vs beltItem - one is the slot itself one is the held item

        if (this.beltEntities[slotIndex]){
            this.beltEntities[slotIndex].element.textureAsset = assets.chess;
        }
        this.selectedSlot = slotIndex;
        this.heldItemTemplateName = "None"; 
        if (this.heldItemProperties){ // dislike .. we're using null as this value if we're not holding anything
            if(this.heldItem){ this.heldItem.destroy();  }
            if (this.heldItemProperties){
                this.heldItem = Game.Instantiate[this.heldItemTemplateName](this.heldItemProperties);
                this.heldItem.enabled = false;
            }
            // because we're using game instantiate and skipping network it doesn't have networkobjectinfo which enables setproperties
            // dislike but we hack around this by checking numberinfo in props and manually set
             
            if (this.heldItem?.script?.gadget) {
                // Each gadget may have different gfx, for example Sword requires SwordCollider on HeldItemGfx, whereas Multiblaster has none
                this.heldItemGfx = this.heldItem.script.gadget.createHeldItemGfx(this.heldItem.script.gadget); 
                // dislike special case for gadgets but not for regular items??
                if(!pickup) this.heldItem.script.gadget.onSelect();
            } else if (this.heldItem.script?.numberInfo) {
                const props = { ...this.heldItemProperties};
                props.gfxOnly = true;
                props.enabled = true; 
                this.heldItemGfx = Game.Instantiate[this.heldItemTemplateName](props);
                // this.heldItemGfx.script.numberInfo.setProperties(props);
                
            } else {
                this.heldItemGfx = Game.Instantiate[this.heldItemTemplateName]({gfxOnly:true});
                if (this.selectItemFn && !pickup) this.selectItemFn(); // duplicated sound between "select" and "pickup" .. when pickup it also selects.
            }
            
            let s = this.heldItem.script?.pickUpItem.heldScale;
            if (s){
                this.heldItemGfx.setLocalScale(s,s,s); // dislike this not being as a part of helditem
                this.heldItemGfx.setLocalRotation(this.heldItem.script.pickUpItem.heldRot); // dislike this being in pickupitem and gadget / gadgetX 
                this.pivot.addChild(this.heldItemGfx);
                this.heldItemGfx.setLocalPosition(this.heldItem.script.pickUpItem.heldPos);
            }
        }  else {
            if(this.heldItem){
                this.heldItem.destroy();
                this.heldItem = null;
            }
        }

    }
};

Inventory_Old.prototype.getProperties = function () {
    var props = {
        beltItems : this.beltItems,
        selectedSlot : this.selectedSlot,
        heldItem : {
            templateName : this.heldItemGfx ? this.heldItemTemplateName : "None", // ahhhh dislike "None" freaking everywhere WTH??
            position : this.heldItemGfx ? this.heldItemGfx.getPosition() : pc.Vec3.ZERO,
            rotation : this.heldItemGfx ? this.heldItemGfx.getEulerAngles() : pc.Vec3.ZERO,
            numberInfo : this.heldItemProperties?.numberInfo, // relies on null value when consumed by network.js to display helditem for other players
        }
    }
    return props;
    
}

Inventory_Old.prototype.setProperties = function (props={}) {

    // populate inventory from server
    if (props != null && props.beltItems){ // will be null when player first joins, dislike
        Object.keys(props.beltItems).forEach(i => {
            const beltItemProps = props.beltItems[i];
            if (beltItemProps) {
                this.placeInventory_OldItem(i,beltItemProps);
            }
                
        });
        this.selectSlot({slotIndex:props.selectedSlot,force:true,pickup:true});
    }
}

Inventory_Old.prototype.animateReturningDraggedItemGfx = function(dt){
    console.log("anmate");
    const sc = this.draggedItemGfx.element.screenCornersCenter;
    const pos = new pc.Vec2(sc.x,sc.y);
    const targetSc = this.beltItemImages[this.draggedItemIndex].element.screenCornersCenter;
    const target = new pc.Vec2(targetSc.x,targetSc.y);// - targetSize.x/2,targetSc.y-targetSize.y/2);
    const delta = target.clone().sub(pos);
    const dir = delta.clone().normalize();
    const returnSpeed = 500;
    const newPos = pos.clone().add(dir.clone().mulScalar(dt*returnSpeed));
    
    const canvas = pc.app.graphicsDevice.canvas;

    let x = newPos.x/canvas.width;
    let y = newPos.y/canvas.height;
    this.draggedItemGfx.element.anchor = new pc.Vec4(x, y, x, y);
    const threshold = 10;
    if (delta.length() < threshold) {
        this.placeInventory_OldItem(this.draggedItemIndex,this.draggedItemProperties);
        this.clearDraggedItem();
        // todo: disallow pickup into this slot or it will overwrite.
    }
};

Inventory_Old.prototype.update = function (dt) {

    if (this.returningDraggedItem) {
        this.animateReturningDraggedItemGfx(dt);
    }

    var toRemove = [];
    Object.keys(this.thrownItems).forEach(key => {
        const timeSinceThrown = Date.now() - this.thrownItems[key].thrownTime;
        const removeFromThrownAfterSeconds = 0.2;
        if (timeSinceThrown > removeFromThrownAfterSeconds * 1000) {
            toRemove.push(key);
        }
    });
    toRemove.forEach(x => {
        delete(this.thrownItems[x]);
    })

    if (this.heldItem && this.heldItem.script && this.heldItem.script.gadget){
        this.heldItem.script.gadget.silentUpdate(dt);
        if (this.mouseHeld) this.heldItem.script.gadget.mouseHeld();

    }
    if (this.inventoryGroupAnimating){
        let p = this.inventoryGroup.getLocalPosition();
        let speed = 12;
        let fudge = this.inventoryShown ? 20 : -20; // lerp "past" the target so end of lerp isn't so slow
        this.inventoryGroup.setLocalPosition(p.x,Math.lerp(p.y,this.inventoryGroupYTarget+fudge,speed),p.z);
        let d = this.inventoryShown ? this.inventoryGroupYTarget-p.y : p.y - this.inventoryGroupYTarget;
        if (d <= 0) {
            this.inventoryGroupAnimating= false;
        }
    }

       
};

Inventory_Old.prototype.killAll = function(){
    Object.keys(this.beltItems).forEach(key =>{
        this.clearBeltItem(key);
    });
    this.selectSlot({slotIndex:0,force:true});

};

Inventory_Old.prototype.modifyInventoryNumber = function(key,modifyOp){
    // dislike this is jenky af, passing functions, fractions, and indexes around. clean it up!
    const x = this.beltItems[key];
    const f = x?.numberInfo?.fraction;
    if (f == undefined) {
        //    console.log("you messed it up! :"+JSON.stringify(x));
        // gadget or empty - not a number
    }else{
        result = modifyOp(f);
        if (result) {
            x.numberInfo.fraction = result;
            this.placeInventory_OldItem(key,x);
            this.beltItemImages[key].addComponent('script');
            this.beltItemImages[key].script.create('sinePop');
       } else {
            console.log("you messed up buddy. no modifyop result for what should have been a fraction");
        }
    }

   if (key == this.selectedSlot && this.beltItems[this.selectedSlot]?.numberInfo){
        this.selectSlot({slotIndex:this.selectedSlot, force:true});
        this.heldItemGfx.addComponent('script');
        this.heldItemGfx.script.create('sinePop');
    }
};

Inventory_Old.prototype.modifyInventoryNumbers = function(fn){
    Object.keys(this.beltItems).forEach(key =>{
        this.modifyInventoryNumber(key,fn);
    });
};


