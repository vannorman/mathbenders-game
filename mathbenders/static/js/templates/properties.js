class Property {
    constructor(args){
        const {entity}=args;
        this.entity = entity;
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

class FractionProperty extends Property {
    static icon = assets.textures.ui.icons.fraction; 

    constructor(args={}){
        super(args);
    }

    buildUi(onChangeFn,getCurValFn){
        const $this = this; 
        const panel = Property.panel();
       
        const fracText = Property.text({parent:panel});
       //panel.addChild(fracText);

        function setFracText(frac){
            fracText.element.text = frac.numerator + "/" + frac.denominator;
        }
        setFracText(getCurValFn($this.entity));
 
        const upBtn = Property.upBtn();
        upBtn.element.on('mousedown',function(){
            // Where is the fraction stored here ? Do we double store it (once for the UI) or do we dig deep for the frac every time?
            // Let's dig deep why not
            let curFrac = getCurValFn($this.entity);
            let newFrac = new Fraction(curFrac.numerator+1,curFrac.denominator);
            onChangeFn($this.entity,newFrac);
            setFracText(newFrac);
        });

        panel.addChild(upBtn);
 
       return panel;
    }
}

class SizeProperty extends Property {
    constructor(args){
        super(args);
    }

    buildUi(onChangeFn,getCurValFn){
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
        const size = getCurValFn(this.entity);
        setSizeText(size);

        const upBtn = Property.upBtn({anchor:[0.2,0.2,0.2,0.2]});
        upBtn.element.on('mousedown',function(){
            let size = getCurValFn($this.entity);
            size[0]++;
            onChangeFn($this.entity,size);
            setSizeText(size);
        });
        panel.addChild(upBtn);
 
        return panel;
    }
}
