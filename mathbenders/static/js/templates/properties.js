export class PropertyMap {
    constructor(args){
        const  {template,name,property,onChangeFn,getCurValFn,min=1,max=10} = args;
        this.template = template;
        this.name = name;
        this.property = property;
        this.onChangeFn = onChangeFn;
        this.getCurValFn = getCurValFn;
        this.min = min;
        this.max = max;
    }

}
export class Property {
    static icon = assets.textures.ui.trash; // should always be overwritten.


    constructor(args){
        const {template,onChangeFn,getCurValFn,buttonIndex,valueType,min=1,max=10}=args;
        this.template = template;
        this.onChangeFn2  = onChangeFn; // using onChangeFn2 so we can insert a check before executing.. awkward
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
            result = true;
            if (value < min || value > max) {
                result = false;
            }
            return result;
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
        });
        return copyBtn;
    }

    duplicateTemplate(){
        let duplicate = this.template.duplicate(); //itemTemplate.duplicate();
        const copyDelta = realmEditor.camera.entity.forward.flat().normalize().mulScalar(20); // copy "north" from Camera view
        let copiedEntities = [];
        duplicate.copies.forEach(copy => {
            let c = realmEditor.InstantiateTemplate({
                ItemTemplate:copy.Template,
                position:copy.data.position.clone().add(copyDelta),
                rotation:copy.data.rotation,
                properties:copy.data.properties,
            });
            copiedEntities.push(c.entity);
       });
        if (duplicate.postCopyFn) {
            duplicate.postCopyFn(copiedEntities);
        } else {
            realmEditor.editItem(copiedEntities[0]);
        }
        
    }
}

export class MoveProperty extends Property {
    static icon = assets.textures.ui.builder.moveItem;

    buildUiButton(){
        const moveButton = UI.SetUpItemButton({
            parentEl:realmEditor.gui.editItemTray.buttonContainers[this.buttonIndex],
            width:30,height:30,textureAsset:assets.textures.ui.builder.moveItem,
            mouseDown:function(){realmEditor.BeginDraggingEditedObject();} 
        });
        return moveButton;
    }
}

export class NudgeProperty extends Property {
    static icon = null; // blank. Special property where 2 buttons exist on the ring instead of a signle button which pops up a ui.

    buildUiButton(){
        const $this = this;
        const container = new pc.Entity();
        container.addComponent('element');
        const rotateLeft = UI.SetUpItemButton({
            parentEl:container,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemLeft,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){   $this.template.entity.rotate(45);    }
        });

        // Set up Rotate Right button
        const rotateRight = UI.SetUpItemButton({
            parentEl:container,
            width:30,height:30,textureAsset:assets.textures.ui.builder.rotateItemRight,
            anchor:[.8,.5,.8,.5],
            mouseDown:function(){   $this.template.entity.rotate(-45);    }
        });

        const moveUp = UI.SetUpItemButton({
            parentEl:container,
            width:18,height:18,textureAsset:assets.textures.ui.builder.moveUp,
            anchor:[-1,.8,-1,.8],
            mouseDown:function(){   
                var p = $this.template.entity.getPosition();
                p.add(new pc.Vec3(0,0.5,0));
                $this.template.entity.moveTo(p);
                realmEditor.editItem($this.template.entity);
            }
        });

         const moveUpBig = UI.SetUpItemButton({
            parentEl:container,
            width:18,height:18,textureAsset:assets.textures.ui.builder.moveUpBig,
            anchor:[-.5,.8,-.5,.8],
            mouseDown:function(){   
                var p = $this.template.entity.getPosition();
                p.add(new pc.Vec3(0,10,0));
                $this.template.entity.moveTo(p);
                realmEditor.editItem($this.template.entity);
            }
        });

        const moveDown = UI.SetUpItemButton({
            parentEl:container,
            width:18,height:18,textureAsset:assets.textures.ui.builder.moveDown,
            anchor:[-1,.2,-1,.2],
            mouseDown:function(){   
                var p = $this.template.entity.getPosition();
                p.add(new pc.Vec3(0,-0.5,0));
                $this.template.entity.moveTo(p);
                realmEditor.editItem($this.template.entity);
            }
        });

        const moveDownBig = UI.SetUpItemButton({
            parentEl:container,
            width:18,height:18,textureAsset:assets.textures.ui.builder.moveDownBig,
            anchor:[-.5,0.2,-0.5,0.2],
            mouseDown:function(){   
                var p = $this.template.entity.getPosition();
                p.add(new pc.Vec3(0,-10,0));
                $this.template.entity.moveTo(p);
                realmEditor.editItem($this.template.entity);
            }
        });

  
        return container;
    }
}

export class FractionProperty extends Property {
    static icon = assets.textures.ui.icons.fraction; 

    buildUi(){
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

