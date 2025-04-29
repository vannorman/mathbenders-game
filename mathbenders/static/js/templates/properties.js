export class PropertyMap {
    constructor(args){
        const  {template,name,property,onInitFn,onChangeFn,getCurValFn,min=1,max=10} = args;
        this.template = template;
        this.name = name;
        this.property = property;
        this.onChangeFn = onChangeFn;
        this.onInitFn = onInitFn ?? onChangeFn;
        this.getCurValFn = getCurValFn;
        this.min = min;
        this.max = max;
    }

}
export class Property {
    static icon = assets.textures.ui.trash; // should always be overwritten.

    constructor(args){
        const {name,template,onInitFn,onChangeFn,getCurValFn,buttonIndex,valueType,min=1,max=10}=args;
        this.name=name;
        this.template = template;
        this.onChangeFn2  = onChangeFn; // using onChangeFn2 so we can insert a check before executing.. awkward
        this.onInitFn = onInitFn ?? onChangeFn;
        this.getCurValFn = getCurValFn;
        this.buttonIndex = buttonIndex;
        this.valueType=valueType; // vec3, string, array?
        this.min = min;
        this.max = max;
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
 
            return false;
        }
     
    }

    onChangeFn(template,value){
        if (this.allowChange(value)){
            this.onChangeFn2(template,value);
        }
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

export class GroupProperty extends Property {
    static icon = assets.textures.ui.trash;

    buildUiButton(){
        const groupButton = UI.SetUpItemButton({
            parentEl:realmEditor.gui.editItemTray.buttonContainers[this.buttonIndex],
            width:30,height:30,textureAsset:assets.textures.ui.builder.moveItem,
            mouseDown:function(){
                realmEditor.BeginDraggingEditedObject();
                } 
        });
        return moveButton;
    }
}




export class ScaleProperty extends Property {
    static icon = assets.textures.ui.builder.scaleItem;

    buildUi(){
        // TODO: Combine this with SizeProperty UI (they're the same almost);
        const $this = this;
        const panel = Property.panel();


        var y=0;
        const rowDim = 3;
        const colDim = 5;
        const elementGrid = UI.createElementGrid({rowDim:rowDim, colDim:colDim, spacing:[10,40],defaultSize:[20,20]});

        var text0;
        var text1;
        var text2;

        function setSizeText(size){
            text0.text = size.x.toFixed(1);
            text1.text = size.y.toFixed(1);
            text2.text = size.z.toFixed(1);
        }
        
        function modScale(scale){
            let size = $this.getCurValFn($this.template).clone();
            let newSize = size.clone().add(scale);
            $this.onChangeFn($this.template,newSize);
            size = $this.getCurValFn($this.template).clone();
            setSizeText(size);
        }

        function text(el){
            return Property.text({parent:el,pivot:[0.5,-0.5]}).element;
        }
        
        const deltaScale = 0.5; // should have a "big adjust" and "fine adjust" button so add 2 new buttons per entry here.

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
        setSizeText(size);

        this.ui=panel;
 
    }

}

export class CopyProperty extends Property {
    static icon = assets.textures.ui.builder.moveItem;

    buildUiButton({parentEl:parentEl}){
        const $this = this; 
        const copyBtn = UI.SetUpItemButton({
            parentEl:parentEl,
            width:30,height:30,textureAsset:assets.textures.ui.builder.copy,
            mouseDown:function(){$this.duplicateTemplate();}, //.CopyEditedObject();},
            text:"Copy",
            textAnchor:[0.5,1.5,0.5,1.5],
        });
        return copyBtn;
    }

    duplicateTemplate(){
        let duplicate = this.template.duplicate(); //itemTemplate.duplicate();
        const copyDelta = realmEditor.camera.entity.forward.flat().normalize().mulScalar(20); // copy "north" from Camera view
        let copiedEntities = [];
        duplicate.copies.forEach(copy => {
            let p = copy.data.position.clone().add(copyDelta);
            p = Utils.getGroundPosFromPos(p);
            let c = realmEditor.InstantiateTemplate({
                ItemTemplate:copy.Template,
                position:p,
                rotation:copy.data.rotation,
                properties:copy.data.properties,
            });
            copiedEntities.push(c.entity);
       });
        if (duplicate.postCopyFn) {
            duplicate.postCopyFn(copiedEntities);
        } else {
            realmEditor.editItem({entity:copiedEntities[0]});
        }
        
    }
}

export class MoveProperty extends Property {
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

export class QuantityProperty extends Property {
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
        }
       
        
        Rotate({texture:assets.textures.ui.builder.curved_arrow,amt:5,anchor:[.39,.45,.39,.45],size:18});
        Rotate({texture:assets.textures.ui.builder.curved_arrow,amt:45,anchor:[0.4,.65,0.4,.65],size:30});

        Rotate({texture:assets.textures.ui.builder.curved_arrow2,amt:-45,anchor:[.6,.65,.6,.65],size:30});
        Rotate({texture:assets.textures.ui.builder.curved_arrow2,amt:-5,anchor:[.61,.45,.61,.45],size:18});

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

        // enable copy
        let copyBtnContainer = new pc.Entity();
        copyBtnContainer.addComponent('element',{
            type: 'image',
            color:pc.Color.GRAY,
            anchor:[0.75,0,1,1],
            margin:[0,0,0,0],
        })

        const copyProperty = new CopyProperty({template:this.template});
        const copyBtn = copyProperty.buildUiButton({parentEl:copyBtnContainer});
        container.addChild(copyBtnContainer); 

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

export class FractionProperty extends Property {
    static icon = assets.textures.ui.icons.fraction; 

    buildUi(){
        console.log("bui");
        const $this = this; 
        const panel = Property.panel();
       
        const fracText = Property.text({parent:panel});
       //panel.addChild(fracText);

        function setFracText(frac){
            fracText.element.text = frac.numerator + "/" + frac.denominator;
        }
        setFracText(this.getCurValFn($this.template));
 
        const upBtn = Property.upBtn();
        upBtn.element.on('mousedown',function(){
            // Where is the fraction stored here ? Do we double store it (once for the UI) or do we dig deep for the frac every time?
            // Let's dig deep why not
            let curFrac = $this.getCurValFn($this.template);
            let newFrac = new Fraction(curFrac.numerator+1,curFrac.denominator);
            $this.onChangeFn($this.template,newFrac);
            setFracText(newFrac);
        });

        panel.addChild(upBtn);
 
        this.ui=panel;
    }
}

export class SizeProperty extends Property {
    
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

export class BuildWallsProperty extends Property {
    
    static icon = assets.textures.ui.icons.wall;
    buildUiButton(){
        const template = this.template;
        const moveButton = UI.SetUpItemButton({
            parentEl:realmEditor.gui.editItemTray.buttonContainers[this.buttonIndex],
            width:30,height:30,
            textureAsset:this.constructor.icon,
            mouseDown:function(){
                realmEditor.toggle('buildWalls'); // BeginDraggingEditedObject();
                realmEditor.mode.setData(template.entity.getPosition());
            } 
        });
        return moveButton;
    }

}

export class CastleWallFormedMeshData extends Property {
    // Doesn't need any interaction ui setup;
    // Simply a container for the meshdata which is saved/loaded by the template CaslteWallFormed
}
