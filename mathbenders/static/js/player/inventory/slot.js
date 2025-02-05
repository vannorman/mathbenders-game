export default class InventorySlot {
   
    templateName = null;
    properties = null;
    index; // for debugging

    constructor(args={}){
        const {index=-1}=args;
        this.index=index;
        // Always empty args, always create inv slot as empty before populating.
        // Unless it has properties??
        // Utility of create then populate properties vs. just create and pass props if it is full? Complexity
    }

    placeItem(args={}){
        const {templateName,properties} = args;
        this.templateName = templateName;
        this.properties = properties;
        console.log("placed "+templateName+" in slot "+this.index);
    }

    clearItem(){
        this.templateName = null;
        this.properties = null;
    }

    get isUsed() { return this.templateName != null; }
}


