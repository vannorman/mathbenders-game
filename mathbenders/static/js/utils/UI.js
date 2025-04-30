class UIScrollView {
    constructor(options){
        const {
            group,
            content,
            viewport
        } = options;
        this.group = group;
        this.content = content;
        this.viewport = viewport;
    }

    destroy(){
        this.group?.destroy();
        this.content?.destroy();
        this.viewport?.destroy();
    }

}

class UISlider {
    constructor(options){
        const { 
            labelElement, 
            onChangeFn = ()=>{}, 
            isMoving = false, 
            indicatorElement, 
            sliderElement, 
            textIndicatorElement, 
            val=0,      
            group, 
            maxVal = 1.0,
            minStep = 0.01,
            precision = 2,
        } = options;
        this._isMoving = isMoving;
        this._indicatorElement = indicatorElement;
        this._sliderElement = sliderElement;
        this._val = val; 
        this._maxVal = maxVal;
        this._group = group;
        this.OnPress = this.OnPress.bind(this);
        this.OnUnPress = this.OnUnPress.bind(this);
        this._textIndicatorElement = textIndicatorElement;
        this._onChangeFn = onChangeFn; // callback? does this need a custom function injection? Or simple callback fn that takes a fn as argument already, called "Callback"? Eyton
        this._minStep = minStep;
        this._precision = precision;

        const $this = this;
        this._indicatorElement.on('mousedown', function () {
            $this.OnPress();
            Mouse.RegisterFunctionToRunOnCursorUp( {name:"SliderMouseUp", fn: () => {  
                $this.OnUnPress();
            }});
            
        });

        this._sliderElement.on('mousedown',function(){
            const minPosX = $this._sliderElement.screenCorners[0].x; 
            const maxPosX = $this._sliderElement.screenCorners[1].x;
            const range = maxPosX-minPosX;
            // mousex can go from minPosX to maxPosX
            const val = (Mouse.x - minPosX) / range;
            $this.SetVal({resultX:val,fireOnChangeFn:true});
            
        });

        this._indicatorElement.on('mouseenter', function () { 
            pc.app.graphicsDevice.canvas.style.cursor='pointer'; 
        });
        
        this._indicatorElement.on('mouseleave', function () { 
            if (!$this._isMoving) pc.app.graphicsDevice.canvas.style.cursor='auto'; 
        });


        pc.app.on('update', function(){ 
            
            if ($this._isMoving) {
                const delta = (Mouse.x -  $this._mouseDownX) * pc.app.graphicsDevice.width/window.innerWidth; // what was x position of mouse when we first clicked
                const startAnchorX = $this._mouseDownAnchorX; // what was x position of slider when we first clicked
                const deltaAnchorX = delta / $this._sliderWidth;
                let resultX = startAnchorX + deltaAnchorX;

                let shouldUpdate = Math.abs($this._val-resultX*$this._maxVal) >= $this._minStep;
                $this.SetVal({fireOnChangeFn:shouldUpdate,resultX:resultX});
           }
        });

        
    }

    SetVal(options){
        var { resultX, fireOnChangeFn=true} = options;
        if (resultX < 0) resultX = 0;
        else if (resultX > 1) resultX = 1;
        // console.log("resultx;"+resultX+", thisval:"+$this._val+", minst;"+$this._minStep);
        let val = resultX * this._maxVal;

        // if minstep is 0.5 and maxval is 2 it should be 0, 0.5, 1, 1.5, 2
        // here, let's say val is 0.6
        val = Math.round(val / this._minStep) * this._minStep;
        this._val = val;
        if (this._minStep % 1 != 0){
            this._textIndicatorElement.text = (val).toFixed(this._precision);
        } else {
            this._textIndicatorElement.text = Math.round(val);

        }
        if (fireOnChangeFn) this._onChangeFn(val);
        let snappedResultX = val / this._maxVal;
        this._sliderWidth = UI.GetElementDim(this._sliderElement).x; // cant do this in initailization for some reason
        this._indicatorWidth = this._indicatorElement.width/this._sliderWidth; // static width of handle in anchor terms
        this._indicatorElement.anchor = [snappedResultX,0.5,snappedResultX+this._indicatorWidth/this._sliderWidth,0.5];

 
    }

    OnPress(){
        pc.app.graphicsDevice.canvas.style.cursor='pointer'; 
        this._sliderWidth = UI.GetElementDim(this._sliderElement).x; // cant do this in initailization for some reason
        this._mouseDownX = Mouse.x;
        this._mouseDownAnchorX = this._indicatorElement.anchor.x;
        this._isMoving = true;
    } 

    OnUnPress(){
        pc.app.graphicsDevice.canvas.style.cursor='auto'; 
        this._isMoving = false;
    }

    get val() { return this._val; }
    get group() { return this._group; }
    get isMoving() { return this._isMoving; }
    set isMoving(value) { this._isMoving = value; }
}

const UI = {
    createElementGrid(options={}){
        const {rowDim=3,colDim=3,spacing=[10,10],defaultSize=[50,50]}=options;
    // Validate input
        if (rowDim <= 0 || colDim <= 0) {
            throw new Error("rowDim and colDim must be greater than 0");
        }

        // Create the parent layout group entity
        const layoutGroup = new pc.Entity("LayoutGroup");
        layoutGroup.addComponent("element", {
            type: "image",
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width: (colDim * defaultSize[0]) + ((colDim-1) * spacing[0]), 
            height:(rowDim * defaultSize[1]) + ((rowDim-1) * spacing[1]),
        });

        Game.l = layoutGroup;
        
        // Add layout group component
        layoutGroup.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_HORIZONTAL, // Horizontal layout by default
            spacing:spacing,
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_BOTH,
            wrap: true // Wrap to form rows and columns
        });

        const elements = [];

        // Create elements and add them to the layout group
        let color = new pc.Color(0.2,0.4,0.6);
        for (let i = 0; i < rowDim; i++) {
            for (let j = 0; j < colDim; j++) {
                const element = new pc.Entity(`Element-${i}-${j}`);
                element.addComponent("element", {
                    type: "image",
                    anchor: [0, 0, 0, 0],
                    pivot: [0.5, 0.5],
                    width: defaultSize[0],
                    height: defaultSize[1], 
                    color:color,
                });
                color = new pc.Color((color.x+.1)%1,(color.y-1)%1,(color.z*2)%1);
                element.addComponent('layoutchild');
                // Add the element to the layout group
                layoutGroup.addChild(element);

                // Store the element in the array
                elements.push(element);
            }
        }

        // Return the group and its elements
        return { group: layoutGroup, elements };
    },
    createInputWithLabel(options={}){
        const {
            onChangeFn,
            labelWidth=50,
            inputWidth=90,
            height=40,
            //anchor=[.5,.5,.5,.5],
            //pivot=[0.5,0.5],
            text="labell",
        } = options;
        const group = new pc.Entity("input label group");
        group.addComponent('element',{
            type:'image',
            width:inputWidth+labelWidth,
            height:35,
            color:pc.Color.GREEN,
        });

        const textA = new pc.Entity('Text'); // text
        textA.addComponent('element', {
            type: 'text',
            text: text,
            anchor:[0,0.5,0,0.5],
            pivot:[0,0.5],
            height:35,
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            width:labelWidth,
            fontSize : 12,
            color:pc.Color.BLACK,
        });
        group.addChild(textA);

        let textInputGroup = new pc.Entity();
        textInputGroup.addComponent('element',{
            type:'image',
            useInput:true,
            anchor:[0.36, 0.5, 0.36, 0.5],
            pivot:[0,0.5],
            width:inputWidth,
            height:35,
        });
        textInputGroup.addComponent('script');
       
        const textInput = new pc.Entity('Text'); // text
        textInput.addComponent('element', {
            type: 'text',
            text: text,
            anchor:[0.1,0,0.1,0],
            pivot:[0,0.5],
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : 12,
            color:pc.Color.BLACK,
            useInput:true,
        });
        textInputGroup.addChild(textInput);
        textInputGroup.script.create('uiInputField',{attributes:{textEntity:textInput,placeHolderColor:new pc.Color(0.1,0.1,0.1)}});
        textInputGroup.script.uiInputField.init();

        group.addChild(textInputGroup);
        textInputGroup.on('updatedvalue',function(val){
            onChangeFn(val);
            //console.log("RM:"+val);
        });
        const inputGroup = {
            root : group,
            inputText : textInput.element,
            labelText : textA.element,
        }
        return inputGroup;
    },

    SetUpItemButton(options={}){
        const {
            parentEl,
            mouseDown,
            mouseEnter,
            mouseLeave,
            width,
            height,
            textureAsset,
            anchor=[.5,.5,.5,.5],
            cursor='auto',
            pivot=[0.5,0.5],
            colorOn,
            colorOff,
            text="",
            textAnchor=[0.5,0.5,0.5,0.5],
            textColor=pc.Color.BLUE,
            hoverValidationFn=null,
            useSelectedState=false,
        }=options;
        const ent = new pc.Entity("btn");
        ent.addComponent('element',{ 
            layers: [pc.LAYERID_UI],
            type: "image", 
            anchor:anchor,
            pivot:pivot, 
            width:width, 
            height:height, 
            useInput:true,
        })
        if (textureAsset) ent.element.textureAsset=textureAsset;
        if (colorOff) {
            ent.element.color=colorOff;

            }
        if (text && text != "") {
             const textA = new pc.Entity('Text'); // text
             textA.addComponent('element', {
                type: 'text',
                text: text,
                anchor:textAnchor,
                pivot:[0.5,0.5],
                margin:[0,0,0,0],
                fontAsset: assets.fonts.montserrat, // Replace with your font asset id
                fontSize : 12,
                color:textColor,
            });
            ent.addChild(textA); 
        }
        if (parentEl) parentEl.addChild(ent);
        if (!colorOff) UI.HoverColor({element:ent.element,cursor:cursor,validationFn:hoverValidationFn,useSelectedState:useSelectedState});
        else UI.HoverColor({element:ent.element,cursor:cursor,validationFn:hoverValidationFn,colorOff:colorOff,colorOn:colorOn,useSelectedState:useSelectedState});
        if (mouseDown) ent.element.on('mousedown',function(){ mouseDown(ent); });
        return ent;
    },

    AddCloseWindowButton(options={}){
        const { onClickFn, parentEl } = options;
        const closeBtn = UI.SetUpItemButton({
            parentEl:parentEl,
            width:35,height:35,
            textureAsset:assets.textures.ui.builder.closeWindow,
            anchor:[1,1,1,1],
            pivot:[0.6,0.6],
            mouseDown:onClickFn,
            cursor:'pointer',
        });
    },
    CreateScrollableLayoutGroup(options){
        const {screen,itemList=[]}=options;
        function createScrollbar(horizontal) {
            const handle = new pc.Entity('Handle');
            const handleOptions = {
                type: pc.ELEMENTTYPE_IMAGE,
                color: new pc.Color(1, 1, 1),
                opacity: 1,
                margin: [0,0,0,0],//new pc.Vec4(0, 0, 0, 0),
                rect: new pc.Vec4(0, 0, 1, 1),
                mask: false,
                useInput: true
            };
            if (horizontal) {
                // @ts-ignore engine-tsd
                handleOptions.anchor = new pc.Vec4(0, 0, 0, 1); // Split in Y
                // @ts-ignore engine-tsd
                handleOptions.pivot = new pc.Vec2(0, 0); // Bottom left
            } else {
                // @ts-ignore engine-tsd
                handleOptions.anchor = new pc.Vec4(0, 1, 1, 1); // Split in X
                // @ts-ignore engine-tsd
                handleOptions.pivot = new pc.Vec2(1, 1); // Top right
            }
            handle.addComponent('element', handleOptions);
            handle.addComponent('button', {
                active: true,
                imageEntity: handle,
                hitPadding: new pc.Vec4(0, 0, 0, 0),
                transitionMode: pc.BUTTON_TRANSITION_MODE_TINT,
                hoverTint: new pc.Color(1, 1, 1),
                pressedTint: new pc.Color(1, 1, 1),
                inactiveTint: new pc.Color(1, 1, 1),
                fadeDuration: 0
            });

            const scrollbar = new pc.Entity(horizontal ? 'HorizontalScrollbar' : 'VerticalScrollbar');

            scrollbar.addChild(handle);

            const scrollbarOptions = {
                type: pc.ELEMENTTYPE_IMAGE,
                color: new pc.Color(0.5, 0.5, 0.5),
                opacity: 1,
                rect: new pc.Vec4(0, 0, 1, 1),
                mask: false,
                useInput: false
            };

            const scrollbarSize = 20;

            if (horizontal) {
                // @ts-ignore engine-tsd
                scrollbarOptions.anchor = new pc.Vec4(0, 0, 1, 0);
                // @ts-ignore engine-tsd
                scrollbarOptions.pivot = new pc.Vec2(0, 0);
                // @ts-ignore engine-tsd
                scrollbarOptions.margin = new pc.Vec4(0, 0, scrollbarSize, -scrollbarSize);
            } else {
                // @ts-ignore engine-tsd
                scrollbarOptions.anchor = new pc.Vec4(1, 0, 1, 1);
                // @ts-ignore engine-tsd
                scrollbarOptions.pivot = new pc.Vec2(1, 1);
                // @ts-ignore engine-tsd
                scrollbarOptions.margin = new pc.Vec4(-scrollbarSize, scrollbarSize, 0, 0);
            }
            scrollbar.addComponent('element', scrollbarOptions);
            scrollbar.addComponent('scrollbar', {
                orientation: horizontal ? pc.ORIENTATION_HORIZONTAL : pc.ORIENTATION_VERTICAL,
                value: 0,
                handleSize: 0.5,
                handleEntity: handle
            });

            return scrollbar;
        }
        
        const text = new pc.Entity('Text');
        text.addComponent('element', {
            alignment: new pc.Vec2(0, 0),
            anchor: new pc.Vec4(0, 1, 0, 1),
            autoHeight: true,
            autoWidth: false,
            fontAsset: assets.font.id,
            fontSize: 32,
            lineHeight: 36,
            pivot: new pc.Vec2(0, 1),
            text:
                'This is a scroll view control. You can scroll the content by dragging the vertical ' +
                'or horizontal scroll bars, by dragging the content itself, by using the mouse wheel, or ' +
                'by using a trackpad. Notice the elastic bounce if you drag the content beyond the ' +
                'limits of the scroll view.',
            type: pc.ELEMENTTYPE_TEXT,
            width: 600,
            color:pc.Color.BLACK,
            wrapLines: true
        });




        // Group to hold the content inside the scroll view's viewport
        const content = new pc.Entity('Content');
//        content.addChild(text);

        content.addComponent('element', {
            anchor: new pc.Vec4(0, 1, 0, 1),
            height: 400,
            pivot: new pc.Vec2(0, 1),
            type: pc.ELEMENTTYPE_GROUP,
            useInput: true,
            width: 600
        });

        content.addComponent("layoutgroup", {
        orientation: pc.ORIENTATION_VERTICAL,
            spacing: new pc.Vec2(10, 10),
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
            wrap: false,
        });
        // Scroll view viewport
        const viewport = new pc.Entity('Viewport');
        viewport.addChild(content);

        viewport.addComponent('element', {
            anchor: new pc.Vec4(0, 0, 1, 1),
            color: new pc.Color(0.2, 0.2, 0.2),
            margin: [0,0,0,0],//new pc.Vec4(0, 20, 20, 0),
            mask: true,
            opacity: 1,
            pivot: new pc.Vec2(0, 1),
            rect: new pc.Vec4(0, 0, 1, 1),
            type: pc.ELEMENTTYPE_IMAGE,
            useInput: false
        });

//        const horizontalScrollbar = createScrollbar(true);
        const verticalScrollbar = createScrollbar(false);

        // Create a scroll view
        const scrollview = new pc.Entity('ScrollView');
        scrollview.addChild(viewport);
 //       scrollview.addChild(horizontalScrollbar);
        scrollview.addChild(verticalScrollbar);

        // You must add the scrollview entity to the hierarchy BEFORE adding the scrollview component
        screen.addChild(scrollview);

        scrollview.addComponent('element', {
            anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
            height: 200,
            pivot: new pc.Vec2(0.5, 0.5),
            type: pc.ELEMENTTYPE_GROUP,
            useInput: false,
            width: 400
        });

        scrollview.addComponent('scrollview', {
            bounceAmount: 0.1,
            contentEntity: content,
            friction: 0.05,
            useMouseWheel: true,
            mouseWheelSensitivity: pc.Vec2.ONE,
//            horizontal: true,
            //horizontalScrollbarEntity: horizontalScrollbar,
            // horizontalScrollbarVisibility: pc.SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED,
            scrollMode: pc.SCROLL_MODE_BOUNCE,
            vertical: true,
            verticalScrollbarEntity: verticalScrollbar,
            verticalScrollbarVisibility: pc.SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED,
            viewportEntity: viewport
        });

        itemList.forEach(x=>{
           content.addChild(x); 
        });
        const newScrollView = new UIScrollView({group:scrollview,viewport:viewport,content:content});
        return newScrollView;

    },
    HoverColor(options={}){
        const {
            element,
            colorOff=new pc.Color(0.9,0.9,0.9),
            colorOn=pc.Color.WHITE,
            cursor='pointer',
            opacityOn=1,
            opacityOff=1,
            useSelectedState=false,
            validationFn=null,
            }= options;
        element.on('mouseenter',function(){
            if (validationFn == null || validationFn()){
                if(!useSelectedState || !element.isSelected) {
                    element.color=colorOn;
                    pc.app.graphicsDevice.canvas.style.cursor=cursor;
                    element.opacity=opacityOn;
                }
            }
        });
        element.on('mouseleave',function(){
            if (validationFn == null || validationFn()){
                if (!useSelectedState || !element.isSelected) {
                    element.color=colorOff;
                    pc.app.graphicsDevice.canvas.style.cursor='auto';
                    element.opacity=opacityOff;
                }
            }
        });
        element.color=colorOff;
    },
    createSlider(options={}){
        const { 
            labelText="label",
            onChangeFn, 
            minVal = 0, 
            maxVal = 2, 
            width=180, 
            sliderWidth=140,
            height=50, 
            sliderHeight=10,
            sliderIndicatorWidth=10,
            sliderIndicatorHeight=25,
            minStep=.01,
            precision = 2,
        } = options;

        const group = new pc.Entity('sliderGroup');
        group.addComponent('element', {
            type: 'image',
            color:pc.Color.BLUE,
            opacity:0.4,
            width: width,
            height: height,
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5]
        });

       // Slider
        const slider = new pc.Entity('slider');
        slider.addComponent('element', {
            anchor: [0.4, 0.5, 0.4, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            width: sliderWidth,
            height: sliderHeight,
            color:pc.Color.WHITE,
            useInput: true,

        });
        group.addChild(slider);

        // Slider indicator
        const sliderIndicator = new pc.Entity('sliderIndicator');
        sliderIndicator.addComponent('element', {
            type: 'image',
            width: sliderIndicatorWidth,
            height: sliderIndicatorHeight,
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            useInput: true,
            color: pc.Color.YELLOW // Visual indicator color
        });
        slider.addChild(sliderIndicator);

        // Current value of the slider
        let currentValue = minVal;

        // Update slider position based on currentValue
        function updateSliderPosition() {
            const percentage = (currentValue - minVal) / (maxVal - minVal);
            sliderIndicator.setLocalPosition((percentage * 160) - 80, 0, 0); // Centered on slider
        }

        const textIndicator = new pc.Entity();
        textIndicator.addComponent('element', {
            type: 'text',
            text: '0',
            anchor:[0.79,0.5,0.79,0.5],
            pivot:[0.0,0.5],
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : 12,
            width:80,
            height:group.element.height,
            color:pc.Color.BLACK,
        });

        group.addChild(textIndicator);

        const label = new pc.Entity();
        label.addComponent('element', {
            type: 'text',
            text: labelText,
            anchor:[0.05,0.9,0.05,0.9],
            pivot:[0.0,0.5],
            fontAsset: assets.fonts.montserrat, // Replace with your font asset id
            fontSize : 12,
            width:80,
            height:group.element.height,
            color:pc.Color.BLACK,
        });

        group.addChild(label);
 

        const opts = { 
            maxVal:maxVal, 
            group:group,indicatorElement : sliderIndicator.element, 
            labelElement: label.element,
            sliderElement:slider.element,
            textIndicatorElement:textIndicator.element,
            onChangeFn : onChangeFn,
            minStep : minStep,
            precision : precision,

        };
        const sliderObj = new UISlider(opts);

        return sliderObj;
    },
    GetElementDim(element){
        const x = element.screenCorners[1].x - element.screenCorners[0].x;
        const y = element.screenCorners[2].y - element.screenCorners[1].y;
        return new pc.Vec2(x,y);
    }

}

class OptionButtonGroupUI {
    constructor({ parent, options }) {
        this.buttons = [];

        options.forEach((opt, index) => {
            const buttonEntity = new pc.Entity(`OptionButton_${opt.name}`);
            const { anchor=[0,0,1,1], w=30, h=30 } = opt;
            buttonEntity.addComponent("element", {
                type: "image",
                anchor: anchor,
                pivot: [0.5, 0.5],
                width: w,
                height: h,
                textureAsset: opt.textureAsset,
                color: opt.defaultColor.clone(),
                useInput:true,

            });

            buttonEntity.isSelected = false;

            // Position buttons horizontally
            // buttonEntity.setLocalPosition(index * 70, -70, 0);

            // Events
            buttonEntity.element.on("mouseenter", () => {
                if (!buttonEntity.isSelected) {
                    buttonEntity.element.color = opt.hoverColor.clone();
                }
            });

            buttonEntity.element.on("mouseleave", () => {
                if (!buttonEntity.isSelected) {
                    buttonEntity.element.color = opt.defaultColor.clone();
                }
            });

            buttonEntity.element.on("click", () => {
                opt.onClick?.();
                buttonEntity.element.fire("select");

            });

            buttonEntity.element.on("select", () => {
                this.buttons.forEach(btn => {
                    btn.isSelected = false;
                    btn.element.color = options.find(o => o.name === btn.name).defaultColor.clone();
                });

                buttonEntity.isSelected = true;
                buttonEntity.element.color = opt.selectedColor.clone();

 
            });

            buttonEntity.name = opt.name;

            parent.addChild(buttonEntity);
            this.buttons.push(buttonEntity);
            return this;
        });

    }
}


