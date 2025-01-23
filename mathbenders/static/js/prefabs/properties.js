class Property {
    constructor(args){
        const {entity}=args;
        this.entity = entity;
    }
}

class FractionProperty extends Property {
    static icon = assets.textures.ui.icons.fraction; 

    constructor(args={}){
        super(args);
        // Need to create a ui with a text field which is modified by buttons
        // or multiple text fields in the case of size (x y z)
        // whenever any of these text fields are changed, take their values and propagate value out
        // e.g. "onChangeFn"
        // so when new FracitonProperty({onChangeFn:someTemplateInstanceChangeFn}}
    }

    buildUi(onChangeFn,getCurValFn){
        console.log("this entity:");
        console.log(this.entity)
        console.log(this.entity.getComponentsInChildren('machineNumberFaucet'));
        const $this = this; 
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


        const fracText = new pc.Entity();
        fracText.addComponent('element',{
            type: 'text',
            anchor:[0.5,0.5,0.5,0.5],
            pivot:[0.5,0.5],
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : 18,
            width:80,
           color:pc.Color.BLACK,
        });
        Game.ft=fracText;
        panel.addChild(fracText);

        function setFracText(frac){
            fracText.element.text = frac.numerator + "/" + frac.denominator;
        }
        setFracText(getCurValFn($this.entity));
 
        const upBtn = new pc.Entity("up");
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
        upBtn.element.on('mousedown',function(){
            console.log('mousdown on '+$this.entity.name+" with fn :"+onChangeFn);
            // Where is the fraction stored here ? Do we double store it (once for the UI) or do we dig deep for the frac every time?
            // Let's dig deep why not
            let curFrac = getCurValFn($this.entity);
            let newFrac = new Fraction(curFrac.numerator+1,curFrac.denominator);
            onChangeFn($this.entity,newFrac);
            setFracText(newFrac);
        });

        UI.HoverColor({
            element:upBtn.element,
            colorOn:new pc.Color(1,0.5,0),
            colorOff:new pc.Color(1,0.4,0),
            opacityOn:1,
            opacityOff:0.9,
            cursor:'pointer',});

        panel.addChild(upBtn);
 
        UI.AddCloseWindowButton({
            parentEl:panel,
            onClickFn:function(){panel.enabled=false},
        });
        return panel;
    }
}
