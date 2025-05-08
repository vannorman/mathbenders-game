import Base from "./base.js";

export default class Normal extends Base {

    onEnter(){
    }

    onMouseMove(e) {
        super.onMouseMove(e);
    }
    mouseHeld=false;
    timer = 0;
    onMouseDown(e) {
        this.mouseHeld=true;
        // console.log("%c Mousedown w/ mode: Normal",'color:#07f');
       // const itemIsUnderCursor = this.realmEditor.gui.editableItemUnderCursor != null;
        super.onMouseDown(e);
    }
    
    onMouseUp(e) {
        this.mouseHeld=false;
        this.timer=0;
        if (realmEditor.gui.isMouseOverMap){
            const itemToEdit = this.realmEditor.gui.editableItemUnderCursor;
            if (itemToEdit != null){
                realmEditor.editItem({entity:this.realmEditor.gui.editableItemUnderCursor});
            }
       }
        super.onMouseUp(e);
    }

    update(dt){
        if (this.mouseHeld){
            this.timer += dt;
            const handPanHoldThreshold = 0.2;
            if (this.timer > handPanHoldThreshold && this.realmEditor.gui.isMouseOverMap){
                this.realmEditor.toggle('handpan');
            }
        }
    }

    onExit(){
        this.timer=0;
        this.mouseHeld=false;

    }

 




}
