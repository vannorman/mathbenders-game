export default class InventorySlot {
   
    Template;
    itemProperties;
    index; // for debugging
    slotBackground;
    itemImageEntity;

    constructor(args={}){
        const {index=-1}=args;
        this.index=index;
        this.createGui();
        this.createText();
        this.selected=false;
        // Always empty args, always create inv slot as empty before populating.
        // Unless it has properties??
        // Utility of create then populate properties vs. just create and pass props if it is full? Complexity
    }

    placeItem(args={}){
        const {Template,properties} = args;
        if (this.textEl) this.textEl.entity.destroy();
        this.Template = Template;
        this.itemProperties = properties;
        this.itemImageEntity.element.textureAsset = Template.icon;
        // console.log("placed "+Template.name+" in slot "+this.index);
        this.updateText();
   }

    clear(){
        this.Template = null;
        this.itemProperties = null;
        this.itemImageEntity.element.texture = null;
        this.clearText();
        
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
        this.itemImageEntity = itemImage;
        UI.HoverColor({element:slotBackground.element})

// slock
        
        this.slotBackground = slotBackground.element;
    }

    clearText(){
        this.textEl?.entity.destroy();
    }

    createText(){
        this.clearText();
        const c = new pc.Entity("text");
        c.addComponent("element", {
            anchor: [0, 0, 1, 1],
            margin: [0, 0, 0, 0],
            pivot: [0.5, 0.5],
            layers:[pc.LAYERID_UI],
            color: pc.Color.RED,
            fontAsset: assets.font,
            text: "C",
            type: pc.ELEMENTTYPE_TEXT,
            autoFitWidth: true,
            autoFitHeight: true,
        });
        this.itemImageEntity.addChild(c);
        this.textEl = c.element;

    }

    updateText(){
        if (this.itemProperties) {
            console.log(this.itemProperties);
        } 
        // call this after modifyOp.
        const frac = Object.values(this.itemProperties).find(x=>x instanceof Fraction);
        if (frac){
            const color = frac.numerator > 0 ? pc.Color.BLACK : pc.Color.WHITE;
            this.createText();
            this.setText(frac.toString(),color)
        }
 
    }

    setText(text,color=pc.Color.BLACK) {
        this.textEl.text = text;
        this.textEl.color = color;
    }

    onSelect(){
        this.itemImageEntity.addComponent('script');
        this.itemImageEntity.script.create('sinePop');
        this.selected = true;
    }
    deSelect(){
        this.selected = false;
    }

    get isUsed() { return this.Template != null; }
}


