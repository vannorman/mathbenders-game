class Property {}

class FractionProperty extends Property {
    static icon = assets.textures.ui.icons.fraction; 

    constructor(){
        // Need to create a ui with a text field which is modified by buttons
        // or multiple text fields in the case of size (x y z)
        // whenever any of these text fields are changed, take their values and propagate value out
        // e.g. "onChangeFn"
        // so when new FracitonProperty({onChangeFn:someTemplateInstanceChangeFn}}
    }

    static buildUi(){
        const panel = new pc.Entity("panel");
        panel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            color:pc.Color.YELLOW,
            opacity:0.9,
            width:170,
            height:170,
            useInput:true,
        });
        panel.addComponent('script');
        panel.script.create('sinePopIn');


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
        panel.addChild(upBtn);
 
        UI.AddCloseWindowButton({
            parentEl:panel,
            onClickFn:function(){panel.enabled=false},
        });
        return panel;
    }
}
