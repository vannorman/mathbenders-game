export default class EditItemTray {
    
    #editableItemBackboard;
    buttonContainers = [];
    editableButtons = []

    currentProperties = [];
    propertyBtns = [];

    constructor(args={}){
        //const {} = args; // move this to a static somehwere plz
        // Define pop-up gui for editing itmes.
        this.entity = new pc.Entity('Parent');
        this.entity.addComponent('element', {
            layers: [pc.LAYERID_UI],
            type: 'group',  // This makes it a UI element
            anchor: [0.2,0.15,0.8,0.85],
            pivot: [0.5, 0.5],
            margin: [0, 0, 0, 0],
        });

        const editableItemMenu = new pc.Entity("eidtablemenu");
        editableItemMenu.addComponent("element", {
            type: pc.ELEMENTTYPE_GROUP,
            layers:[pc.LAYERID_UI],
            anchor: [0,0,1,1],
            pivot: [0.5, 0.5],
            // the element's width and height dictate the group's bounds
        });


        this.#editableItemBackboard = new pc.Entity("inv");
        this.#editableItemBackboard.addComponent("element", {
            anchor: [0,0,1,1],
            pivot: [0.5, 0.5],
            margin:[0,0,0,0],
            type: 'image',
            useInput: true,
            opacity:0.5,
            textureAsset: assets.textures.ui.builder.editItemBackboard,
        });

        this.entity.addChild(this.#editableItemBackboard);
        this.entity.addChild(editableItemMenu);
//        realmEditor.SetEditableItemMode(EditableItemMode.Editing); // TODO: Eytan, how pass thru realmeditor to set this mode?

        // Define a circle of buttons for various actions like copy, delete
        let points = Utils.GetCircleOfPoints({degreesToComplete:360,radius:100,scale:100});
        this.buttonContainers = []; // we'll access RealmBuilder by index later.
        points.forEach(point=>{
            const el = new pc.Entity("el");
            el.addComponent('element',{
                type: pc.ELEMENTTYPE_IMAGE,
                anchor:[.5,.5,.5,.5],
                pivot:[.5,.5],
                width:50,
                height:50,
                textureAsset: assets.textures.ui.numberSpherePos,
            })
            this.entity.addChild(el);
            this.buttonContainers.push(el);
            const offCenter = 20;
            el.setLocalPosition(new pc.Vec3(point.x,point.y+offCenter,0));
        });

        this.copyBtnContainer = new pc.Entity();
        this.copyBtnContainer.addComponent('element',{
            type: 'image',
            color:pc.Color.GRAY,

            anchor:[0.8,0.1,0.8,0.1],
            width:80,height:30
        })

        this.entity.enabled = false;
        this.entity.addChild(this.copyBtnContainer);
    }


    buildUiForItem(args){
        const { ItemTemplate, entity } = args;

        // Destroy any old ones if exist.
        this.propertyBtns.forEach(x=>{x.destroy();x=null;})
        this.propertyBtns = [];
        this.currentProperties.forEach(x=>{x.destroy();x=null;});

        // Build Move and Rotate first.
        const moveProperty = new MoveProperty({entity:entity});
        const moveBtn = moveProperty.buildUiButton();
        this.buttonContainers[0].addChild(moveBtn);

        const nudgeProperty = new NudgeProperty({template:entity._templateInstance}); 
        const nudgeBtns = nudgeProperty.buildUiButton();
        this.buttonContainers[3].addChild(nudgeBtns);

        const copyProperty = new CopyProperty({entity:entity});
        const copyBtn = copyProperty.buildUiButton({parentEl:this.copyBtnContainer});
        //this.buttonContainers[3].addChild(copyBtn);

        const $this = this;
        var buttonIndex = 1; // 0 is taken (by Move)
        ItemTemplate.propertiesMap.forEach(x => {
            const property = new x.property({
                template:entity._templateInstance, 
                onChangeFn:x.onChangeFn,
                getCurValFn:x.getCurValFn,
                buttonIndex:buttonIndex,
                min:x.min,
                max:x.max,
            });

            property.buildUi();
            property.hideUi();

            // reparent ui to container's parent and position it over all siblings from parent
            let pare = this.buttonContainers[buttonIndex];
            let p1 = pare.getLocalPosition();
            pare.parent.addChild(property.ui);
            property.ui.setLocalPosition(p1);

            const uiBtn = property.buildUiButton();
            uiBtn.element.on('mousedown',function(){
                $this.currentProperties.forEach(x=>{x.hideUi();});
                property.showUi();
            })
            this.buttonContainers[buttonIndex].addChild(uiBtn);
            this.currentProperties.push(property);
            this.propertyBtns.push(uiBtn);

            buttonIndex++;
            if (buttonIndex == 3) {
                // 3 is taken (by Rotate)
                buttonIndex++;
            }
        });

    }

}
