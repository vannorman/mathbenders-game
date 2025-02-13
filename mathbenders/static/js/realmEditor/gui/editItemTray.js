export default class EditItemTray {
    
    #editableItemBackboard;
    buttonContainers = [];
    editableButtons = []

    currentProperties = [];
    propertyBtns = [];

    constructor(args={}){
        const {leftMargin} = args; // move this to a static somehwere plz
        // Define pop-up gui for editing itmes.
        const popUpEditItemTray = new pc.Entity('Parent');
        popUpEditItemTray.addComponent('element', {
            layers: [pc.LAYERID_UI],
            type: 'group',  // This makes it a UI element
            anchor: [0.5,0.5,0.5,0.5],
            pivot: [0.5, 0.5],
            margin: [leftMargin, 0, 0, 0],
            width: 320, 
            height: 360, 
        });
        popUpEditItemTray.element.margin = new pc.Vec4(leftMargin,0,0,0);

        const editableItemMenu = new pc.Entity("eidtablemenu");
        editableItemMenu.addComponent("element", {
            type: pc.ELEMENTTYPE_GROUP,
            layers:[pc.LAYERID_UI],
            anchor: [0.0, 0.95, 0.5, 0.05], // [ left, top, ?, ? 
            pivot: [0.5, 0.5],
            // the element's width and height dictate the group's bounds
            width: 320,
            height: 360,
        });


        this.#editableItemBackboard = new pc.Entity("inv");
        this.#editableItemBackboard.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            type: 'image',
            width: 320,
            height: 360,
            useInput: true,

            textureAsset: assets.textures.ui.builder.editItemBackboard,
        });

        popUpEditItemTray.addChild(this.#editableItemBackboard);
        popUpEditItemTray.addChild(editableItemMenu);
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
            popUpEditItemTray.addChild(el);
            this.buttonContainers.push(el);
            const offCenter = 20;
            el.setLocalPosition(new pc.Vec3(point.x,point.y+offCenter,0));
        });

        popUpEditItemTray.enabled = false;
        this.entity = popUpEditItemTray;
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

        const rotateProperty = new RotateProperty({template:entity._template}); 
        const rotateBtn = rotateProperty.buildUiButton();
        this.buttonContainers[3].addChild(rotateBtn);

        const $this = this;
        var buttonIndex = 1; // 0 is taken (by Move)
        ItemTemplate.editablePropertiesMap.forEach(x => {
            const property = new x.property({
                template:entity._template, 
                onChangeFn:x.onChangeFn,
                getCurValFn:x.getCurValFn,
                buttonIndex:buttonIndex,
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
