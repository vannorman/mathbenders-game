class Attribute {
    icon;
    tray;
    #editOptions;
    #editEffects;

    constructor(template){}

    getAttributesFromItem(){}

    setAttributesFromUI(){}

    buildUi(){
        // Pass in the Editor Pop Up Item Tray as ui parent?
        const p = realmEditor.gui.popUpEditItemTray;
        const $this = this;
        UI.SetUpItemButton({
            parentEl:p,
            width:30,height:30,
            textureAsset:this.icon,
            anchor:[.5,.2,.5,.2],
            mouseDown:function(){   $this.show();   },
            cursor:'pointer',
        });

        // get icon from subclass
        // populate ui pop up tray with that icon
        // create a pop-up attribute editing panel, bind its "x" to close that same panel
        // bind the click of the icon to the enable of the editing panel
    }

    show(){
        this.tray.enable();
    }
}

class FractionAttribute extends Attribute {
    #numberInfo;
    get #fraction() {return this.#numberInfo.fraction } 
    constructor(template){
        super(template);
        this.#numberInfo = this.template.entity.getComponentsInChildren('numberInfo')[0]; // weak, awkward
        this.icon = assets.textures.ui.icons.fraction; 

        this.tray = this.buildUiTray();
        this.tray.disable()
    }
    get value(){
        return this.#fraction; 
    }
    set value(value){
        this.#fraction = value;
    }

    // Don't want this to be carried in memory everywhere until needed!
    // But, NumberFaucet *does* need an SavedAttributeValues.forEach(x=>{this.modifier[x].setValue(x.value)}){}
    buildUiTray(){
        const tray = new pc.Entity();
        tray.addComponent("element", {
            type: "image",
            anchor: [0.5, .5, .5, .5],   
            pivot: [0.5,0.5],
            width: 70,
            height: 120,
            opacity:1,
            useInput:true
        });
        const $this = this;
        UI.SetUpItemButton({
            parentEl:tray,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemLeft,
            anchor:[.5,.2,.5,.2],
            mouseDown:function(){   $this.modifyNumerator(1);   },
            cursor:'pointer',
        });
        return tray;
    }

    modifyNumerator(amount){
        const numberInfo = this.#numberInfo; // correct this, since its called from outside (onmousedown)?
        numberInfo.setFraction(new Fraction(numberInfo.fraction.numerator+1,numberInfo.denominator));;
    }
}


class Template {

    name;
    icon;
    entity; // stores scale, position, and rotation;

    constructor(i) {
        // Container entity
        this.entity = new pc.Entity();
    }

    get properties() {}

    set properties(properties) {}

    #attributes = new Map();

    // Add an attribute dynamically
    addAttribute(name, attributeInstance) {
        if (attributeInstance instanceof Attribute) {
            this.#attributes.set(name, attributeInstance);
        } else {
            throw new Error("Attribute must be an instance of Attribute.");
        }
    }

    // Get an attribute
    getAttribute(name) {
        return this.#attributes.get(name)?.value;
    }

    // Set an attribute value
    setAttribute(name, value) {
        if (this.#attributes.has(name)) {
            this.#attributes.get(name).value = value;
        } else {
            throw new Error(`Attribute "${name}" does not exist.`);
        }
    }


}

class NumberHoop extends Template {
  
    // I don't need Instance of NumberHoop to know about the templateName?

    #name = "NumberHoop";
    #scale=1.5;
    #asset = assets.numberHoop;
    #icon = assets.textures.ui.icons.hoop;
    #childOffset = new pc.Vec3(0,0,2);

    constructor(args={}){
        super();
        this.entity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(this.#scale));
        this.name = this.#name; // defined here but referenced in super? Overwritten super?
        this.icon = this.#icon;
        this.renderEntity = this.#asset.resource.instantiateRenderEntity();
        this.entity.addChild(this.renderEntity);
        this.renderEntity.setLocalPosition(this.#childOffset);
        this.setup(); 
        pc.app.root.addChild(this.entity);
        const {position=pc.Vec3.ZERO,rotation=pc.Vec3.ZERO}=args;
        this.entity.moveTo(position,rotation);
    }

    setup(){
        const hoop = this.renderEntity; // specific to architecture of NumberHoop
        hoop.addComponent('script');
            hoop.script.create('machineHoop',{
                attributes:{
                    onCrossFn : (pos)=>{ 
                        AudioManager.play({source:assets.sounds.popHoop,position:pos});
                        Fx.Shatter({position:pos});
                    },
                    hoopMeshRenderAsset : assets.numberHoop.resource.renders[1],
                    hoopTextureAsset : assets.textures.hoop,

                    }});
            hoop.setEulerAngles(new pc.Vec3(-90,0,0));                        
            hoop.script.machineHoop.init();

    }

    get properties() {
//        return new PropertiesGroup(){
//            new FractionProperty(this),
//
//        }
    }
    set properties(properties) {}
    toJSON(){}
}
