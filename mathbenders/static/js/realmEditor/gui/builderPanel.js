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
            const itemIcon = this.CreateBuilderObjectIcon({realmEditor:gui.realmEditor,templateName:item.templateName,textureAsset:item.textureAsset})
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
            anchor: [0.025,0.9,1,0.1],
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
        const {realmEditor, textureAsset, templateName, text} = options;

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
        const r = Math.sin(i * 0.6) * 0.5 + 0.5;
        const g = Math.sin(i * 0.6 + 2.094) * 0.5 + 0.5;
        const b =  Math.sin(i * 0.6 + 4.188) * 0.5 + 0.5;
        childImage.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width:64,
            height:64,
            type: 'image',
            textureAsset: textureAsset,
            useInput: true,
            layer: pc.LAYERID_UI,
        });
        child.addChild(childImage);
        UI.HoverColor({element:childImage.element});

        // add a text element
        const textElement = new pc.Entity('Text');
        textElement.addComponent('element', {
            type: 'text',
            text: text,
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            autoFitWidth:true, // not work
            autoFitHeight:true, // not work
            fontSize : 12,
            color: new pc.Color(0,0,0), // 
            width: 50,
            height: 100,
            pivot: new pc.Vec2(0.5, 2.0), // Center pivot
            anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5), // Center anchor
        });
        childImage.addChild(textElement);
        
        childImage.element.on('mousedown',function(){
            realmEditor.BeginDraggingNewObject({templateName:templateName,iconTextureAsset:textureAsset});
            // pass in realmeditor as instance 
        }); 
        childImage.name = "child image:"+templateName;

        // save it for later
        const guiItemProperties = {entity:childImage,textElement:textElement,templateName:templateName,textureAsset:textureAsset};
//        realmEditor.gui.guiButtons.push(guiItemProperties); // why?

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


