class Property {
    static icon = assets.textures.ui.trash; // should always be overwritten.

    constructor(args){
        const {entity,onChangeFn,getCurValFn,buttonIndex,valueType}=args;
        this.entity = entity;
        this.onChangeFn = onChangeFn;
        this.getCurValFn = getCurValFn;
        this.buttonIndex = buttonIndex;
        this.valueType=valueType; // vec3, string, array?
        // What of setting Scale .. a type that isn't easily serializable/deserializable on json to and fro?
    }

    buildUiButton(args={}){
        const btn = UI.SetUpItemButton({
            width:30,height:30,
            textureAsset:this.constructor.icon,
        });
        this.btn = btn;
        return btn;
    }

    buildUi(){

    }
    showUi(){
        if (this.ui) this.ui.enabled=true;
    }
    hideUi(){
        if (this.ui) this.ui.enabled=false;

    }

    destroy(){
        if (this.ui) this.ui.destroy();
    }



    static panel(){
        const panel = new pc.Entity("panel");
        panel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            color:pc.Color.YELLOW,
            opacity:1,
            width:170,
            height:170,
            useInput:true,
        });
        panel.addComponent('script');
        panel.script.create('sinePopIn');
        UI.AddCloseWindowButton({
            parentEl:panel,
            onClickFn:function(){panel.enabled=false},
        });
 
        return panel;
    }

    static upBtn(){
        const upBtn =  new pc.Entity("up");
        upBtn.addComponent("element", {
            anchor: [0.3, 0.5, 0.3, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            color:pc.Color.WHITE,
            opacity:0.9,
            width:17,
            height:17,
            useInput:true,
        });
        UI.HoverColor({
            element:upBtn.element,
            colorOn:new pc.Color(1,0.5,0),
            colorOff:new pc.Color(1,0.4,0),
            opacityOn:1,
            opacityOff:0.9,
            cursor:'pointer',});

        return upBtn;
    }

    static text(args){
        const text = new pc.Entity();
        const {
            anchor = [0.5,0.5,0.5,0.5],
            pivot = [0.5,0.5],
            parent = null,
        }= args;
        text.addComponent('element',{
            type: 'text',
            anchor:anchor,
            pivot:pivot,
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : 18,
            width:80,
           color:pc.Color.BLACK,
        });
        parent?.addChild(text);
        return text; 
    }
}

class ScaleProperty extends Property {
    static icon = assets.textures.ui.builder.scaleItem;

    buildUi(){
        // TODO: Combine this with SizeProperty UI (they're the same almost);
        const $this = this;
        const panel = Property.panel();


        var y=0;
        const elementGrid = UI.createElementGrid({rowDim:3, colDim:5});
        elementGrid.elements.forEach(x=>{
            console.log("x;"+x);
            x.element.useInput = true;
            UI.HoverColor({element:x.element});
            x.on('mousedown',function(){console.log('click:'+y);});
            y++;
        });

        panel.addChild(elementGrid.group);

        const text0 = Property.text({anchor:[0.5,0.2,0.5,0.2],parent:panel});
        const text1 = Property.text({anchor:[0.5,0.5,0.5,0.5],parent:panel});
        const text2 = Property.text({anchor:[0.5,0.8,0.5,0.8],parent:panel});
        function setSizeText(size){
            text0.element.text = size[0];
            text1.element.text = size[1];
            text2.element.text = size[2];
        }
        const size = this.getCurValFn(this.entity);
        setSizeText(size);

        const upBtn = Property.upBtn({anchor:[0.2,0.2,0.2,0.2]});
        const deltaScale = 0.5; // should have a "big adjust" and "fine adjust" button so add 2 new buttons per entry here.
        upBtn.element.on('mousedown',function(){
            let size = $this.getCurValFn($this.entity).clone();
            size.x += deltaScale;
            $this.onChangeFn($this.entity,size);
            setSizeText(size);
        });
        panel.addChild(upBtn);
        this.ui=panel;
 
    }

}

class MoveProperty extends Property {
    static icon = assets.textures.ui.builder.moveItem;
    constructor(args){
        super(args);
    }

    buildUiButton(){
        const moveButton = UI.SetUpItemButton({
            parentEl:realmEditor.gui.editItemTray.buttonContainers[this.buttonIndex],
            width:30,height:30,textureAsset:assets.textures.ui.builder.moveItem,
            mouseDown:function(){realmEditor.BeginDraggingEditedObject();} // pass entity instead?
        });
        return moveButton;
    }
}

class RotateProperty extends Property {
    static icon = null; // blank. Special property where 2 buttons exist on the ring instead of a signle button which pops up a ui.
    constructor(args){
        super(args);
    }

    buildUiButton(){
        const $this = this;
        const container = new pc.Entity();
        container.addComponent('element');
        const rotateLeft = UI.SetUpItemButton({
            parentEl:container,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemLeft,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){   $this.entity.rotate(45);    }
        });

        // Set up Rotate Right button
        const rotateRight = UI.SetUpItemButton({
            parentEl:container,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemRight,
            anchor:[.8,.5,.8,.5],
            mouseDown:function(){   $this.entity.rotate(-45);    }
        });

        return container;
    }
}

class FractionProperty extends Property {
    static icon = assets.textures.ui.icons.fraction; 

    constructor(args={}){
        super(args);
    }

    buildUi(){
        const $this = this; 
        const panel = Property.panel();
       
        const fracText = Property.text({parent:panel});
       //panel.addChild(fracText);

        function setFracText(frac){
            fracText.element.text = frac.numerator + "/" + frac.denominator;
        }
        setFracText(this.getCurValFn($this.entity));
 
        const upBtn = Property.upBtn();
        upBtn.element.on('mousedown',function(){
            // Where is the fraction stored here ? Do we double store it (once for the UI) or do we dig deep for the frac every time?
            // Let's dig deep why not
            let curFrac = $this.getCurValFn($this.entity);
            let newFrac = new Fraction(curFrac.numerator+1,curFrac.denominator);
            $this.onChangeFn($this.entity,newFrac);
            setFracText(newFrac);
        });

        panel.addChild(upBtn);
 
        this.ui=panel;
    }
}

class SizeProperty extends Property {
    constructor(args){
        super(args);
    }

    buildUi(){

        // TODO: Move this to super.buildGridOf3x3()
        const $this = this;
        const panel = Property.panel();

        const text0 = Property.text({anchor:[0.5,0.2,0.5,0.2],parent:panel});
        const text1 = Property.text({anchor:[0.5,0.5,0.5,0.5],parent:panel});
        const text2 = Property.text({anchor:[0.5,0.8,0.5,0.8],parent:panel});
        function setSizeText(size){
            text0.element.text = size[0];
            text1.element.text = size[1];
            text2.element.text = size[2];
        }
        const size = this.getCurValFn(this.entity);
        setSizeText(size);

        const upBtn = Property.upBtn({anchor:[0.2,0.2,0.2,0.2]});
        upBtn.element.on('mousedown',function(){
            let size = $this.getCurValFn($this.entity);
            size[0]++;
            $this.onChangeFn($this.entity,size);
            setSizeText(size);
        });
        panel.addChild(upBtn);
        this.ui=panel;
    }

}

