export default class InventorySlot {
   
    templateName = null;
    properties = null;
    index; // for debugging
    slotBackground;

    constructor(args={}){
        const {index=-1}=args;
        this.index=index;
        this.createGui();
        // Always empty args, always create inv slot as empty before populating.
        // Unless it has properties??
        // Utility of create then populate properties vs. just create and pass props if it is full? Complexity
    }

    placeItem(args={}){
        const {template,properties} = args;
        this.template = template;
        this.properties = properties;
        this.itemImage.textureAsset = template.constructor.icon;
        console.log("placed "+template.name+" in slot "+this.index);
    }

    clearItem(){
        this.templateName = null;
        this.properties = null;
    }

    createGui(){
        const slotBackground = new pc.Entity("inv"+i);
        slotBackground.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            textureAsset: assets.quad,
        });

        slotBackground.addComponent("layoutchild", { excludeFromLayout: false, });

        // add a child image
        const itemImage = new pc.Entity("invImg"+i);
        itemImage.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width:64,
            height:64,
            type: 'image',
            textureAsset: null,
            useInput: true,
            layer: pc.LAYERID_UI
        });
        slotBackground.addChild(itemImage);
        UI.HoverColor({element:slotBackground.element})

// slock
        
        this.slotBackground = slotBackground.element;
        this.itemImage = itemImage.element;
    }

    get isUsed() { return this.template != null; }
}


