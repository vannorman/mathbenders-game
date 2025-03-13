import InventorySlot from './slot.js';

export default class Inventory {

    beltSlots;
    backpackSlots;
    get allSlots() { return [ ...this.beltSlots, ...this.backpackSlots]; }
    get firstAvailableSlot() { return this.allSlots.find(x=> x.isEmpty) || null; }

    constructor(args={}){
        const {Player}=args;
        this.Player = Player;
        const group = InventoryGui.createLayoutGroup();
        this.ui = group;
        
        // Create, then Add belt slots to gui group
        this.beltSlots = Array.from({ length: 9 }, (_, index) => new InventorySlot({index:index}));
        this.beltSlots.forEach(x=>{group.addChild(x.slotBackground.entity)});

        // Create, then Add backpack slots to gui group
        this.backpackSlots = Array.from({ length: 1 }, (_, index) => new InventorySlot({index:index}));


        this.Player.screen.addChild(group);
        pc.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);

        this.selectSlot(this.beltSlots[0]);

    }
    

    getSelectedItem(){
        // return null if no Template
        return this.selectedSlot.Template;
    }

    collectGadget(Template){
        if (!this.hasGadget(Template)){
            this.collectTemplate(Template);
            return true;
        } else {
            PlayerMessenger.Say(`You already have a ${Template.name}!`);
            return false;
        }
    }

    hasGadget(Template){
        // console.log(template.name);
        const gadget = this.allSlots
            .filter(x=>x.Template != null && x.Template.isGadget)
            .find(x=>x.Template.name == Template.name);
        const hasGadget = gadget != null;
        return hasGadget;
    }


    collectTemplate(Template,properties={}){

        let availableSlot = this.firstAvailableSlot;
        if (availableSlot) {
            // A slot was available, so collect the item.
            availableSlot.placeItem({Template:Template,properties:properties});
            if (this.beltSlots.find(x=>x==availableSlot)){
                // The available slot was a belt slot, so select it.
                // IF the newly picked up item has a higher priority than the previously held item.
                // No current way to check whether NumberSphere priority is higher than heldGadget
                this.selectSlot(availableSlot);
            }
            return true;
        } else {
            PlayerMessenger.Say("Inventory full!"); 
            return false;
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

    selectSlot(slot){
        this.heldGadget=null;
        this.beltSlots.forEach(x=>{
            if (x != slot) {
                x.deSelect();
            }
        });
        slot.onSelect();
        this.selectedSlot = slot;
        if (this.selectedSlot.Template?.isGadget){
            const gadget = new this.selectedSlot.Template();
            gadget.properties = this.selectedSlot.itemProperties; // awkward; we're conflating and confusing setProperties for 
                // for placable realmEditor proeprties vs. held inventory item properties
            this.heldGadget = gadget; //bind fire here?
            this.updateHeldItem(); // awkward back and forth here, but ..
            this.heldGadget.updateAmmoGfx(); // awkward .. for this to be here i think
            this.heldGadget.popFxAmmo();
        } else {

            this.updateHeldItem();
        }

    }

    loadNumberIntoGadget(frac){

        if (this.heldGadget.loadNumber({fraction:frac})){
            //this.updateHeldItem();
            // this.heldGadget.updateAmmoGfx(); // awkward .. for this to be here i think
            this.selectedSlot.itemProperties = this.heldGadget.properties; // ahh I hate how this is everyhwere? awkward
            return true;
        } else {
            return false;
        }
    }
    

    updateHeldItem(){
        if (this.heldItem) {
            this.heldItem.entity.destroy();
            this.heldItem = null;
        }
         
        if (this.selectedSlot?.Template){
            // createheldItem is a static method because from Inventory we do not have "instances" of each item, only data
            this.heldItem = this.selectedSlot.Template.createHeldItem(this.selectedSlot.itemProperties);
            Player.pivot.addChild(this.heldItem.entity);
            this.heldItem.onHeld();
        } else {
        }

        // At this point, "selected" item is created visibly to the user (no collision or interaction.)
        // If the selected item is a number, 
            // we need the onMouseDown listener bound to "create this number at throwPos, 
            // then remove the heldItem from slot.
        // if the selected item is a gadget,
            // we need a new gadgetInstance to be created based on slot.itemproperties and listening for events
            // we need the onMouseDown listener bound to "gadgetInstance.mouseDown()"
        
    }


    onMouseDown(){
        const item = this.getSelectedItem();
        if (item && item.isThrowable) {
            Player.throwItem(item,this.selectedSlot.itemProperties);
            this.selectedSlot.clear();
            this.updateHeldItem();
       } else if (this.heldGadget){
            this.heldGadget.onMouseDown();
            this.selectedSlot.itemProperties = this.heldGadget.properties;
        }

    }

    onKeyDown(event){
        // Handle number keys for belt slots
        if (event.key >= pc.KEY_1 && event.key <= pc.KEY_9) {
            const slotIndex = event.key - pc.KEY_1;
            const slot = this.beltSlots.find(x=>x.index==slotIndex);
            this.selectSlot(slot);
        }
        if (event.key === pc.KEY_I) {
            this.toggleBackpack();
        }
        if (event.key === pc.KEY_W || event.key === pc.KEY_Q || event.key === pc.KEY_E || event.key === pc.KEY_D){
            if (this.backpackShown) {
                this.hideBackpack();
            }
        }
    }

    hideBackpack(){ console.log("hide bk"); }
    showBackpack(){ console.log("showbk"); }
    toggleBackpack(){
        if (this.backpackShown) this.hideBackpack();
        else this.showBackpack();
    }

    beginDrag(){

    }

    endDrag(){
    
    }

    dropItemOntoSlot(){

    }

    swapTwoSlots(slot1,slot2){
        // if 
    }

    hide(){
        this.ui.enabled=false;
        this.enabled=false;
    }

    show(){
        this.ui.enabled=true;
        this.enabled=true;
        this.updateHeldItem();
        this.heldGadget?.updateAmmoGfx(); // awkward .. for this to be here i think
        this.heldGadget?.popFxAmmo();
    }

    modifyInventoryNumbers(modifyOp){
        this.allSlots.filter(x => !x.isEmpty).forEach(slot => {

            Object.entries(slot.itemProperties).forEach(([key,value]) => {
                if (value instanceof Fraction){
                    const result = modifyOp(value);
                    slot.itemProperties[key] = result; // this is awkward af lol
                    slot.popFx();
                    if (this.selectedSlot == slot){
                        this.heldItemPopFx();
                    }
                }
            })
                
        });

    }

    heldItemPopFx(){
        this.heldItem.entity.addComponent('script');
        this.heldItem.entity.script.create('sinePop');
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


}


