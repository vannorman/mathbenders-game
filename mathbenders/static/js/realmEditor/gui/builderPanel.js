export default class BuilderPanel {

    // The left-hand UI of the RealmBuilder has a panel selection for different categories.
    constructor(args = {}) {
        var { 
            name = "Unnamed", 
            items = [],
            panel = null, 
            navButton = null,
            logoPanelWidth = 80,
            realmEditor,
            gui
        } = args;

        this.name = name;
        this.gui = gui; // Needed for first "select()" call, called in base.js line 300, since this is all kicked off by the constructor of realmeditor, so a global realmeditor has not resolved yet.. awkward 
        panel = this.CreateBuilderPanel(name);
        items.forEach(item => {
            const itemIcon = this.CreateBuilderObjectIcon({ItemTemplate:item.ItemTemplate});
            panel.addChild(itemIcon);
        });
        navButton = this.AddNav({text:name,width:logoPanelWidth});

        const _this = this;
        navButton.element.on('click',function(){
            _this.select();
        });
        this.panel = panel;
        this.navButton = navButton;
        this.items = items;
        
   }

    disable() { 

        this.panel.enabled=false;
    }

    enable(){ 
        this.panel.enabled=true;
    }

    select(){
        this.gui.builderPanels.forEach(x=>{x.disable()});
        this.gui.navList.children.forEach(x=>{
           if (x.element) {
               x.element.useInput=true;
               x.element.opacity=0;
               x.element.isSelected=false;
               x.children[1].element.color = pc.Color.WHITE; // awkward text element ref
           }
       })

        this.enable();
        const button = this.navButton;  
        button.element.useInput=false;
        button.element.isSelected=true;
        button.children[1].element.color = pc.Color.BLACK; // awkward text element ref
        button.element.opacity=1;

    }

    CreateBuilderPanel(name){
        const builderObjectLayout = new pc.Entity(name);
        builderObjectLayout.addComponent("element", {
            type: "image",
            anchor: [0,0,1,1],//0.025,0.9,1,0.1],
            pivot: [0.5, 0.5],       
            margin: [0, 0, 0, 0],
        });
        builderObjectLayout.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_HORIZONTAL,
            spacing: new pc.Vec2(10, 10),
            // fit_both for width and height, making all child elements take the entire space
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
            // wrap children
            wrap: true,
        });
        // RealmBuilder.builderObjectIconsPanel.addChild(builderObjectLayout);// move to where builderpanel instance is created 
        return builderObjectLayout;
    }


    CreateBuilderObjectIcon(options){
        // UI Helper Method
        // const {realmEditor, textureAsset, templateName, text} = options;
        const {ItemTemplate=NumberHoop} = options;

        // create a ui square
        const child = new pc.Entity("childe");
        child.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            opacity:0.4,
            width:70,
            height:70,
            useInput:true,
        });

        child.addComponent("layoutchild", {
            excludeFromLayout: false,
        });

        // add a child image with the texture asset for this icon
        const childImage = new pc.Entity("ui child");
        let i=0;
        childImage.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width:64,
            height:64,
            type: 'image',
            textureAsset: ItemTemplate.icon(),
            useInput: true,
            layer: pc.LAYERID_UI,
        });
        child.addChild(childImage);
        UI.HoverColor({element:childImage.element});

        
        childImage.element.on('mousedown',function(){
            realmEditor.BeginDraggingNewObject({ItemTemplate:ItemTemplate});//,iconTextureAsset:textureAsset});

        }); 
        // childImage.name = "child image:"+templateName;

        return child; 
    }

    AddNav(options={}){
        const { text, width } = options;
        const navA = new pc.Entity("nava"); // button
        navA.addComponent('element', {
            type:'image',
            anchor:[0,0,0,0], // dislike; this SHOULD be centered, 
            height:18,
            useInput:true,
            color:new pc.Color(1,1,1),
            opacity:0,
            alignment:[0.5,0.5],

        });
        Game.n=navA.element;
        const textA = new pc.Entity('Text'); // text
        textA.addComponent('element', {
            type: 'text',
            text: text,
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : 12,
            color:pc.Color.WHITE,
            alignment:[0.5,0.5],
            anchor:[0.5,0.5,0.5,0.5],
        });
//        setTimeout(function(){textA.element.pivot=[0.5,0.5]},3000);
        Game.t=textA.element;
        UI.HoverColor({element:navA.element,opacityOn:1,opacityOff:0,cursor:'pointer',useSelectedState:true});
        navA.element.on('mouseenter',function(){if (!navA.element.isSelected) textA.element.color=pc.Color.BLACK;})
        navA.element.on('mouseleave',function(){if (!navA.element.isSelected) textA.element.color=pc.Color.WHITE;})
        navA.addChild(textA); 
        textA.element.pivot=[0.5,0.5];
        return navA;
 
    }

//    get name() { return this._name; }
//    set name(value) { this._name = value; }
//    get items() { return this._items; }
//    set items(newItems) { this._items = newItems; }
//    // addItem(templateName, textureAsset) { this._items.push({ templateName, textureAsset }); }
//    get panel() { return this._panel; }
//    set panel(value) { this._panel = value; }
//    get navButton() { return this._navButton; }
//    set navButton(value) { this._navButton = value; }
}


