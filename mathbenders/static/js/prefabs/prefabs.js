class Attribute {
    #editIcon;
    #editOptions;
    #editEffects;

    constructor(){}

    getAttributesFromItem(){}

    setAttributesFromUI(){}

    buildUi(){
        // get icon from subclass
        // populate ui pop up tray with that icon
        // create a pop-up attribute editing panel, bind its "x" to close that same panel
        // bind the click of the icon to the enable of the editing panel
    }
}

class FractionAttribute extends Attribute {
    #fraction = new Fraction(1,1);
    get value(){
        return this.#fraction; 
    }
    set value(value){
        this.#fraction = value;
    }
    get icon(){
        return assets.textures.ui.icons.hoop; 
    }

    get uiTray(){

    }
}


class Prefab {

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

class NumberHoop extends Prefab {
  
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
