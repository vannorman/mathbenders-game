export class Property {
    static icon = assets.textures.ui.trash; // should always be overwritten.

    constructor(args={}){
        const {
            name=this.constructor.name,
            template=null,
            onInitFn=null,
            onChangeFn,
            getCurValFn,
            buttonIndex,
            valueType,
            min=1,
            max=10,
            delta=1,
            precision=0
        }=args;
        this.name=name ?? this.constructor.name;
        this.template = template;
        this.onChangeFn2  = onChangeFn; // using onChangeFn2 so we can insert a check before executing.. awkward
        this.onInitFn = onInitFn ?? onChangeFn;
        this.getCurValFn = getCurValFn;
        this.buttonIndex = buttonIndex;
        this.valueType=valueType; // vec3, string, array?
        this.min = min;
        this.max = max;
        this.delta = delta;
        this.precision = precision;
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

    allowChange(value){
        var result = null;
        const min = this.min;
        const max = this.max;
        if (value instanceof pc.Vec3){
            // We're attemptting to mod a Vec3, was each x y z within min max bounds?
            if (value.x < min || value.x > max || value.y < min || value.y > max || value.z < min || value.z > max){
                return false;
            } else {
                return true;
            }
             

        } else if (value instanceof Array){
            // We're attemptting to mod an array, was each element result within min max bounds?
            result = true;
            for(let i=0;i<value.length;i++){
                if (value[i] < min || value[i] > max){
                    result = false;
                    return;
                }
            }
            return result;
        } else if (typeof(value) == 'number') {
            // We're modding a number, was it within min max bounds?
            if (value < min || value > max) {
                return false;
            } else{
                return true;
            }
        } else if (Object.getPrototypeOf(value).constructor.name == 'Fraction'){
            let v = value.numerator * min.denominator * max.denominator;
            let minV = min.numerator * value.denominator * max.denominator;
            let maxV = max.numerator * value.denominator * min.denominator;
            let ret = v >= minV && v <= maxV;
            return ret
        } else {
            console.log("Could not validate:");
            console.log(value);
            Game.v = value;
            return false;
        }
     
    }

    onChangeFn(template,value){
        if (this.allowChange(value)){
            this.onChangeFn2(template,value);
        }
    }


    static panel(args={}){
        const{width=120,height=120,opacity=1}=args;
        console.log("H:"+height);
        const panel = new pc.Entity("panel");
        panel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            color:pc.Color.YELLOW,
            opacity:opacity,
            width:width,
            height:height,
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
            anchor: [0.7, 0.5, 0.7, 0.5],
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

    static downBtn(){
        const downBtn = Property.upBtn();
        downBtn.element.color = new pc.Color(0.2,0.2,0.8);
        downBtn.element.anchor = [0.3, 0.5, 0.3, 0.5];
        return downBtn;
    }

    static text(args){
        const text = new pc.Entity();
        const {
            anchor = [0.5,0.5,0.5,0.5],
            pivot = [0.5,0.5],
            parent = null,
            height = 60,
            width = 80,
            fontSize = 18,
        }= args;
        text.addComponent('element',{
            type: 'text',
            anchor:anchor,
            pivot:pivot,
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : fontSize,
            width:width,
            height:height,
           color:pc.Color.BLACK,
        });
        parent.addChild(text);
        return text; 
    }
}




export class Scale extends Property {
    static icon = assets.textures.ui.builder.scaleItem;
    constructor(args={}){
        args.onInitFn ??= (template,value) => {  template.scale = value; },
        args.onChangeFn ??= (template,value) => {  template.setScale(value); },
        args.getCurValFn ??= (template) => { return template.scale },
        args.min ??=1,
        args.max ??=10,
        args.delta ??=.2,
        args.precision ??=1,
        super(args);

    }
    buildUi(){
        // TODO: Combine this with Size UI (they're the same almost);
        const $this = this;
        const panel = Property.panel();// {width:140,height:140});


        var y=0;
        const rowDim = 3;
        const colDim = 5;
        const elementGrid = UI.createElementGrid({rowDim:rowDim, colDim:colDim, spacing:[10,20],defaultSize:[14,14]});

        var text0;
        var text1;
        var text2;
        const precision = this.precision;
        function setSizeText(size){
            text0.text = size.x.toFixed(precision);
            text1.text = size.y.toFixed(precision);
            text2.text = size.z.toFixed(precision);
        }
        
        function modScale(scale){
            let size = $this.getCurValFn($this.template).clone();
            let newSize = size.clone().add(scale);
            if ($this.allowChange(newSize)){
                $this.onChangeFn($this.template,newSize);
                // size = $this.getCurValFn($this.template).clone();
                setSizeText(newSize);
            } else {
                console.log('caint');
            }
        }

        function text(el){
            return Property.text({parent:el,pivot:[0.5,-0.5]}).element;
        }
        
        const deltaScale = this.delta; // 0.5; // should have a "big adjust" and "fine adjust" button so add 2 new buttons per entry here.

        for(let i=0;i<colDim;i++){
            for(let j=0;j<rowDim;j++){
                const index = (j * colDim) + i;
                const el = elementGrid.elements[index];
                UI.HoverColor({element:el.element});
                el.element.useInput = true;
                // text(({parent:el}).element.text=index;
               // const text2 = text(({anchor:[0.5,0.8,0.5,0.8],parent:panel});
                switch(i){
                case 0: text(el).text = "<<";break;
                case 1: text(el).text = "<";break;
                case 2: break;
                case 3: text(el).text = ">";break;
                case 4: text(el).text = ">>";break;
                }

                switch(index){
                case 0: el.element.on('mousedown',function(){modScale(new pc.Vec3(-deltaScale*5,0,0))}); break;
                case 1: el.element.on('mousedown',function(){modScale(new pc.Vec3(-deltaScale,0,0))}); break;
                case 2: text0 = text(el); text0.text="?";break; 
                case 3: el.element.on('mousedown',function(){modScale(new pc.Vec3(+deltaScale,0,0))}); break;
                case 4: el.element.on('mousedown',function(){modScale(new pc.Vec3(+deltaScale*5,0,0))}); break;
                
                case 5: el.element.on('mousedown',function(){modScale(new pc.Vec3(0,-deltaScale*5,0))}); break;
                case 6: el.element.on('mousedown',function(){modScale(new pc.Vec3(0,-deltaScale,0))}); break;
                case 7: text1 = text(el); text1.text="?";break; 
                case 8: el.element.on('mousedown',function(){modScale(new pc.Vec3(0,+deltaScale,0))}); break;
                case 9: el.element.on('mousedown',function(){modScale(new pc.Vec3(0,+deltaScale*5,0))}); break;

                case 10: el.element.on('mousedown',function(){modScale(new pc.Vec3(0,0,-deltaScale*5))}); break;
                case 11: el.element.on('mousedown',function(){modScale(new pc.Vec3(0,0,-deltaScale))}); break;
                case 12: text2 = text(el); text2.text="2";break;
                case 13: el.element.on('mousedown',function(){modScale(new pc.Vec3(0,0,+deltaScale))}); break;
                case 14: el.element.on('mousedown',function(){modScale(new pc.Vec3(0,0,+deltaScale*5))}); break;


                }
            }
        }

        panel.addChild(elementGrid.group);
        
        const size = this.getCurValFn(this.template);
//        console.log("get cur val fn:");
//        console.log(this.getCurValFn);
//        console.log("on:"+this.template.name);
//        console.log("size:"+size);
        setSizeText(size);

        this.ui=panel;
 
    }

}

export class Delete extends Property {

    buildUiButton({parentEl:parentEl}){
        const $this = this; 
        const copyBtn = UI.SetUpItemButton({
            parentEl:parentEl,
            width:30,height:30,textureAsset:assets.textures.ui.trash,
            anchor:[0.66,0.5,0.66,0.5],
            mouseDown:function(){
                Fx.Poof({position:$this.template.entity.getPosition(),positionalAudio:false,scale:5,})
                $this.template.onDeleteByEditor();
                $this.template.entity.destroy();
                realmEditor.toggle('normal');
            },//duplicateTemplate();}, //.CopyEditedObject();},
            text:"Delete",
            textColor:pc.Color.YELLOW,
            textAnchor:[0.5,-.3,.5,-.3],
        });
        return copyBtn;
    }

    duplicateTemplate(){
        // Shouldn't this exist on the template?
        let duplicate = this.template.duplicate(); //itemTemplate.duplicate();
       
    }
}

export class Copy extends Property {

    buildUiButton({parentEl:parentEl}){
        const $this = this; 
        const copyBtn = UI.SetUpItemButton({
            parentEl:parentEl,
            width:30,height:30,textureAsset:assets.textures.ui.builder.copy,
            anchor:[0.33,0.5,0.33,0.5],
            mouseDown:function(){$this.template.duplicate();},//duplicateTemplate();}, //.CopyEditedObject();},
            text:"Copy",
            textColor:pc.Color.YELLOW,
            textAnchor:[0.5,-.3,.5,-.3],
        });
        return copyBtn;
    }

    duplicateTemplate(){
        // Shouldn't this exist on the template?
        let duplicate = this.template.duplicate(); //itemTemplate.duplicate();
       
    }
}

export class Move extends Property {
    static icon = assets.textures.ui.builder.moveItem;

    buildUiButton(){
        const moveButton = UI.SetUpItemButton({
            parentEl:realmEditor.gui.editItemTray.buttonContainers[this.buttonIndex],
            width:30,height:30,
            textureAsset:this.constructor.icon,
            mouseDown:function(){
                realmEditor.BeginDraggingEditedObject();
            } 
        });
        return moveButton;
    }
}

export class Quantity extends Property {
    static icon = assets.textures.ui.builder.quantity;

    buildUi(){
        const $this = this;
        const panel = Property.panel();
        const qtyText = Property.text({parent:panel});

        function setQtyText(qty){
            qtyText.element.text = qty.toString();
        }
        setQtyText(this.getCurValFn($this.template));
 
        const upBtn = Property.upBtn(); // why don't i use the "new" keyword .. can this be another class?
        upBtn.element.on('mousedown',function(){
            let curQty = this.getCurValFn(this.template);
            let newQty = curQty+1;
            if(this.allowChange(newQty)) {
                this.onChangeFn(this.template,newQty);
                setQtyText(newQty);
            } else {
                upBtn.addComponent('script');
                upBtn.script.create('sinePop');

            }
        },this);

        const downBtn = Property.downBtn(); // why don't i use the "new" keyword .. can this be another class?
        downBtn.element.on('mousedown',function(){
            let curQty = this.getCurValFn(this.template);
            let newQty = curQty-1;
            if(this.allowChange(newQty)) {
                this.onChangeFn(this.template,newQty);
                setQtyText(newQty);
            } else {
                downBtn.addComponent('script');
                downBtn.script.create('sinePop');
            }
        },this);

        panel.addChild(upBtn);
        panel.addChild(downBtn);
 
        this.ui=panel;
    }
}

export class BasicProperties extends Property {
    static icon = null; // blank. Special property where 2 buttons exist on the ring instead of a signle button which pops up a ui.

    buildUiButton(){
        const $this = this;
        const container = new pc.Entity();

        // Take up the bottom 20% of the "editItemTray"
        container.addComponent('element',{type:'image',anchor:[0,0,1,0.2],color:pc.Color.RED,opacity:0.2,margin:[0,0,0,0]});

        // Enable rotate left and right for selected item
        function Rotate(args){
            const {texture,amt,anchor,size}=args;
            const rotateLeft = UI.SetUpItemButton({
                parentEl:container,
                width:size,height:size,textureAsset:texture,
                anchor:anchor,
                mouseDown:function(){   $this.template.entity.rotate(amt);    }
            });
            if (amt < 0){
                rotateLeft.setLocalEulerAngles(0,0,90);
            }else {
                rotateLeft.setLocalEulerAngles(0,0,-90);

            }
        }
       
        

        Rotate({texture:assets.textures.ui.builder.curved_arrow2,amt:-5,anchor:[.39,.45,.39,.45],size:18});
        Rotate({texture:assets.textures.ui.builder.curved_arrow2,amt:-45,anchor:[.4,.65,.4,.65],size:30});
        
        Rotate({texture:assets.textures.ui.builder.curved_arrow,amt:45,anchor:[0.6,.65,0.6,.65],size:30});
        Rotate({texture:assets.textures.ui.builder.curved_arrow,amt:5,anchor:[.61,.45,.61,.45],size:18});
       /////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ///// 

        // Enable nudge move left right up down for selected item 
        const moveIconsParent = new pc.Entity();
        moveIconsParent.addComponent('element',{type:'image',anchor:[0,0,0.2,1],margin:[0,0,0,0],opacity:0.2,color:pc.Color.BLUE});

        function MoveIcons(args){
            const {amt,size} = args;
            const moveCirclePoints = Utils.GetCircleOfPoints({count:8,degreesToComplete:360,radius:size*.3,scale:size*.13});
            let moveIcons = [];
            let rot = 0;
            let index = 0;
            moveCirclePoints.forEach(p=>{
                // const item = new pc.Entity();
                // item.addComponent('element',{useInput:true,type:'image',anchor:[0.5,0.5,0.5,0.5],pivot:[0.5,0.5],textureAsset:assets.textures.ui.builder.moveUp,width:20,height:20});
                let anchor=[0.5+p.x,0.5+p.y,0.5+p.x,0.5+p.y];
                const a=index;
                const item = UI.SetUpItemButton({
                    parentEl:moveIconsParent,
                    width:size*15,height:size*15,textureAsset:assets.textures.ui.builder.moveUp,
                    anchor:anchor,
                    mouseDown:function(){   
                        var p = $this.template.entity.getPosition().clone();

                        // move item in one of 8 cardinal xz directions, depending on the index
    //                    let xDir = Math.sin(Math.PI/4 * index);
    //                    let zDir = Math.sin(Math.PI/4 * (index % 2));
                        let xDir = Math.sin(Math.PI/4 * a);
                        let zDir = Math.sin(Math.PI/4 * (a + 2));
                        console.log("X:"+xDir+", Z:"+zDir+", index;"+a);
                        let dir = new pc.Vec3();
                        dir.add(realmEditor.camera.entity.forward.flat().normalize().mulScalar(zDir));
                        dir.add(realmEditor.camera.entity.right.flat().normalize().mulScalar(xDir));
                        p.add(dir.mulScalar(amt));
                        $this.template.entity.moveTo(p);
                        realmEditor.editItem({entity:$this.template.entity,pop:false});

                    }
                });
                index++;

     

                item.setLocalEulerAngles(0,0,rot);
                rot -= 45;

            //    moveIcons.push(item);
            })
            container.addChild(moveIconsParent);
            moveIconsParent.setLocalPosition(-0.5,0,0);
        } 
        
        MoveIcons({amt:5,size:1.2});
        MoveIcons({amt:0.5,size:0.7});

        let bottomRight = new pc.Entity();
        bottomRight .addComponent('element',{
            type: 'image',
            color:pc.Color.GRAY,
            anchor:[0.75,0,1,1],
            margin:[0,0,0,0],
        })
        container.addChild(bottomRight); 

        const copyProperty = new Copy({template:this.template});
        const copyBtn = copyProperty.buildUiButton({parentEl:bottomRight});

        const deleteProperty = new Delete({template:this.template});
        const deleteBtn = deleteProperty.buildUiButton({parentEl:bottomRight});


        // Enable move up and down.
        let moveUpDownContainer = new pc.Entity();
        function Move(args){
            const { anchor, texture, amt, size=30, rotate=false } = args;

            const moveUpDown = UI.SetUpItemButton({
                parentEl:container,
                width:size,height:size*.62,textureAsset:texture,
                anchor:anchor,
                mouseDown:function(){   
                    let e = $this.template.entity;
                    let p = e.getPosition();
                    p.add(new pc.Vec3(0,amt,0));
                    e.moveTo(p);
                    realmEditor.editItem({entity:e,pop:false});
                }
            });
            if (rotate) {
                moveUpDown.setLocalEulerAngles(0,0,180);
            }

        }
        container.addChild(moveUpDownContainer);
        let moveX = 0.5;
        Move({texture:assets.textures.ui.builder.arrow,anchor:[moveX,0.85,moveX,0.85],size:15,amt:1,rotate:true});
        Move({texture:assets.textures.ui.builder.arrow,anchor:[moveX,0.65,moveX,0.65],size:30,amt:20,rotate:true});
        Move({texture:assets.textures.ui.builder.arrow,anchor:[moveX,0.35,moveX,0.35],size:30,amt:-20});
        Move({texture:assets.textures.ui.builder.arrow,anchor:[moveX,0.15,moveX,0.15],size:15,amt:-1});
        return container;
    }
}

export class FractionModifier extends Property {
    static icon = assets.textures.ui.icons.fraction; 

    buildUi(){
        const $this = this; 
        const panel = Property.panel();
       
        const fracText = Property.text({
            parent:panel,
            height:200,
            fontSize:25,
            });

        const lineText =  Property.text({
            parent:panel,
            height:10,
            pivot:[0.5,0.1],
            fontSize:25,

        });

        lineText.element.text = "_";

        function modFrac(numeratorAmt=0,denominatorAmt=0){
            let curFrac = $this.getCurValFn($this.template);
            let newNumerator = curFrac.numerator + numeratorAmt;
            let newDenominator = curFrac.denominator + denominatorAmt;
            if (newNumerator == 0) newNumerator += numeratorAmt;
            if (newDenominator == 0) newDenominator += denominatorAmt;
            let newFrac = new Fraction( newNumerator,newDenominator);
            if ($this.allowChange(newFrac)){
                $this.onChangeFn($this.template,newFrac);
                setFracText(newFrac);
            }
        }
        
        function setFracText(frac){
            fracText.element.text = frac.numerator + "\n" + frac.denominator;
        }


        function text(el){
            return Property.text({parent:el,pivot:[0.5,0.5]}).element;
        }
 

        const rowDim = 2;
        const colDim = 2;
        const elementGrid = UI.createElementGrid({
            rowDim:rowDim, 
            colDim:colDim, 
            spacing:[15,40],
            defaultSize:[20,20]
        });

        for(let i=0;i<colDim;i++){
            for(let j=0;j<rowDim;j++){
                const index = (i * colDim) + j;
                const el = elementGrid.elements[index];
                UI.HoverColor({element:el.element});
                el.element.useInput = true;
                switch(index){
                case 0: text(el).text = "-"; el.element.on('mousedown',function(){modFrac(-1,0)}); break;
                case 1: text(el).text = "+"; el.element.on('mousedown',function(){modFrac(1,0)}); break;
                case 2: text(el).text = "-"; el.element.on('mousedown',function(){modFrac(0,-1)}); break;
                case 3: text(el).text = "+"; el.element.on('mousedown',function(){modFrac(0,1)}); break;


                }
            }
        }

        panel.addChild(elementGrid.group);
        

        setFracText(this.getCurValFn($this.template));
 
        this.ui=panel;
    }
}

export class Size extends Property {
    
    buildUi(){
        // TODO: Combine this with SizeProperty UI (they're the same almost);
        const $this = this;
        const panel = Property.panel();


        var y=0;
        const rowDim = 3;
        const colDim = 3;
        const elementGrid = UI.createElementGrid({
            rowDim:rowDim, 
            colDim:colDim, 
            spacing:[15,40],
            defaultSize:[20,20]
        });

        var text0;
        var text1;
        var text2;

        function setSizeText(size){
            text0.text = size[0];
            text1.text = size[1];
            text2.text = size[2];
        }
        
        function modSize(m){
            let size = $this.getCurValFn($this.template);
            let newSize = Array.from(size);
            for(let i=0;i<newSize.length;i++){
                newSize[i] += m[i];
            }
            $this.onChangeFn($this.template,newSize);
            size = $this.getCurValFn($this.template);
            setSizeText(size);
        }

        function text(el){
            return Property.text({parent:el,pivot:[0.5,-0.5]}).element;
        }
        
        const deltaSize = 1;

        for(let i=0;i<colDim;i++){
            for(let j=0;j<rowDim;j++){
                const index = (j * colDim) + i;
                const el = elementGrid.elements[index];
                UI.HoverColor({element:el.element});
                el.element.useInput = true;
                switch(i){
                case 0: text(el).text = "<";break;
                case 1: break;
                case 2: text(el).text = ">";break;
                }

                switch(index){
                case 0: el.element.on('mousedown',function(){modSize([-deltaSize,0,0])}); break;
                case 1: text0 = text(el); text0.text="?";break; 
                case 2: el.element.on('mousedown',function(){modSize([+deltaSize,0,0])}); break;
                
                case 3: el.element.on('mousedown',function(){modSize([0,-deltaSize,0])}); break;
                case 4: text1 = text(el); text1.text="?";break; 
                case 5: el.element.on('mousedown',function(){modSize([0,+deltaSize,0])}); break;

                case 6: el.element.on('mousedown',function(){modSize([0,0,-deltaSize])}); break;
                case 7: text2 = text(el); text2.text="2";break;
                case 8: el.element.on('mousedown',function(){modSize([0,0,+deltaSize])}); break;


                }
            }
        }

        panel.addChild(elementGrid.group);
        
        const size = this.getCurValFn(this.template);
        setSizeText(size);

        this.ui=panel;
 
    }
}

export class BuildWallsTurrets extends Property {
    
    static icon = assets.textures.ui.icons.wallBuilderTurret;
    buildUiButton(){
        const template = this.template;
        const buildWallsButton = UI.SetUpItemButton({
            parentEl:realmEditor.gui.editItemTray.buttonContainers[this.buttonIndex],
            width:30,height:30,
            textureAsset:this.constructor.icon,
            mouseDown:function(){
                realmEditor.toggle('buildWalls'); // BeginDraggingEditedObject();
                realmEditor.mode.setData({originalEntity:template.entity,turrets:true});
            } 
        });
        return buildWallsButton;
    }

}

export class BuildWalls extends Property {
    
    static icon = assets.textures.ui.icons.wallBuilder;
    buildUiButton(){
        const template = this.template;
        const buildWallsButton = UI.SetUpItemButton({
            parentEl:realmEditor.gui.editItemTray.buttonContainers[this.buttonIndex],
            width:30,height:30,
            textureAsset:this.constructor.icon,
            mouseDown:function(){
                realmEditor.toggle('buildWalls'); // BeginDraggingEditedObject();
                realmEditor.mode.setData({originalEntity:template.entity,turrets:false});
            } 
        });
        return buildWallsButton;
    }

}

export class GenericData extends Property {
    // Doesn't need any interaction ui setup;
    // Its existence is an artifact of how we define, iterate, and inflate templates by "properties"
    // This placeholder enables the saving and loading of arbitrary data inside any template.
    // For example, it is Simply a container for the meshdata which is saved/loaded by the template CaslteWallFormed
}

export class PortalConnector extends Property {
    static icon = assets.textures.ui.builder.portal;
    
    buildUi(){
        let portals = PlayerPortal.portals.values().toArray();
        portals = portals.filter(x=>{return x.uuid != this.template.uuid});

        const $this = this; 
        const portalIconHeight=50;
        console.log("l:"+portals.length);
        const panel = Property.panel({height:70 + portals.length/3 * portalIconHeight});

        
        if (portals.length > 0){ 
            const textEntity = Property.text({fontSize:16,parent:panel,anchor:[0,1,0,1],pivot:[0,1],alignment:[0,0]});
            Game.tt = textEntity.element;
            const template = this.template;
            function UpdateText(){
                let tt = "Portal "+template.number.toString();
                let num = template.connectedTo;
                if (num != undefined){
                    let s = "\n Linked to "+ num; 
                    tt += s;
                    console.log(s);

                } else {
                    tt += "\n not linked."

                }
                tt += "\n Click to link:";
                textEntity.element.text = tt;
            }
            UpdateText();
           
           

            function text(el){
                return Property.text({parent:el,pivot:[0.5,0.5]}).element;
            } 


            const bottomTextHeight = 30;
            const bottomMargin = -1/portals.length;
            const bottomText = Property.text({parent:panel,anchor:[0.5,0,0.5,0],pivot:[0.5,0.05]});

            const elementGrid = UI.createElementGrid({
                rowDim:Math.ceil(portals.length/3), 
                anchor:[0.5,0,0.5,0],
                pivot:[0.5,-0.05],
                colDim:3, 
                spacing:[10,10],
                defaultSize:[30,30]
            });

            for(let i=0;i<portals.length;i++){
                const el = elementGrid.elements[i];
                UI.HoverColor({element:el.element});
                el.element.useInput = true;
                text(el).text = portals[i].number;
                el.element.on('mousedown',function(){ 
                    $this.template.ConnectTo(portals[i].number); 
                    bottomText.text = "Connected! ("+portals[i].number+")";
                    UpdateText();
                });
            }
            panel.addChild(elementGrid.group);
        } else {
            const text = Property.text({parent:panel});
            text.element.text ="No portals \n to connect";
        }
 
        this.ui=panel;
    }
    
}
