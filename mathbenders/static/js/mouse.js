class CursorUpFn {
    constructor(options){
        const { name = "Unnamed", fn, deleteOnExecution = true } = options;
        this._fn = fn;
        this._name = name;
        this._deleteOnExecution = deleteOnExecution;
    }
}

class MouseClass {
    
    #isPressed;
    #x;
    #y;
    #cursorInPage = false;
    #onCursorUpFns = {};

    constructor(){
        pc.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);

        $(window).on('mouseout', function() {       Mouse.cursorInPage = false; });
        $(window).on('mouseover', function() {      Mouse.cursorInPage = true;  });
        window.addEventListener('mouseup', () => {  Mouse.#isPressed = false;    });
  
        GameManager.subscribe(this,this.onGameStateChange);
        
    }

    onGameStateChange(state){
        switch(state){
        case GameState.RealmBuilder:
            this.UnlockCursor();
            break;
        case GameState.Playing:
            this.LockCursor();
            break;
        }
 
    }
    
    LockCursor(){
        if (Mouse.isMouseOverCanvas()){
            pc.app.mouse.enablePointerLock();
             // Capture the call stack by creating a new Error object
            // const error = new Error();

            // Log the stack trace
            //console.log("Call stack:\n", error.stack);
        }
    }
    UnlockCursor(){
        pc.app.mouse.disablePointerLock();
    }
    

    get screenY() {
       return event.y - canvasOffset.top;
    }
    onMouseMove (event) {
        this.UpdateMousePos();
    }
    onMouseDown(event) {
        this.UpdateMousePos();
        this.#isPressed = true;
    }
    get xMap(){
        const w = pc.app.graphicsDevice.width;
        const leftMargin = realmEditor.gui.leftMargin * pc.app.graphicsDevice.width / Constants.Resolution.width;
        let invXmap = (-leftMargin + Mouse.x) * (pc.app.graphicsDevice.width-leftMargin)/pc.app.graphicsDevice.width;
        let mx = (Mouse.x - leftMargin);
        let ww = w - leftMargin;
        let adjust = leftMargin*(ww - mx)/ww;
        return this.x - adjust; 
    }
    get x(){ return this.#x; }
    get y(){ return this.#y; }
    onMouseUp(event){
        this.#isPressed = false;
        let fnNamesToRemove = [];
        Object.keys(this.#onCursorUpFns).forEach(key=>{
            this.#onCursorUpFns[key]();
            if (this.#onCursorUpFns[key].deleteOnExecution) fnNamesToRemove.push(this.#onCursorUpFns[key].name);
        })
        fnNamesToRemove.forEach(x=>{delete this.#onCursorUpFns[x]});
    }
    get isPressed(){
        return this.#isPressed;
    }

    UpdateMousePos(){
        this.#y = $('#application').height() - (event.y - canvasOffset.top); // dislike - use canvas instead?
        this.#x = event.x - canvasOffset.left;
    }
    RegisterFunctionToRunOnCursorUp(obj){
        // TODO: replace this with subscribe pattern
        // Example on "slider up" (after slider pressed and moved) we want to run something.
        // Do we  .. uh .. de-register these ever?
        this.#onCursorUpFns[obj.name]=obj.fn;
    }

    
    getMousePositionInElement(element) {
        const corners = element.element.screenCorners;

        // Top-left and bottom-right corners
        const topLeft = corners[0];
        const bottomRight = corners[2];

        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;

        // Early exit if mouse is outside the element
        if (
            this.#x < topLeft.x || this.#x > bottomRight.x ||
            this.#y < topLeft.y || this.#y > bottomRight.y
        ) {
            return null; // or return [0,0] or throw if you prefer
        }

        // Normalize
        const localX = (this.#x - topLeft.x) / width;
        const localY = (this.#y - topLeft.y) / height;

        return [localX, localY];
    }
    isMouseOverEntity(entity){
        const sc = entity.element.screenCorners;
        if (this.#x > sc[0].x && this.#x < sc[2].x && this.#y > sc[0].y && this.#y < sc[2].y){
            return true;
        } else {
            // console.log('el:'+entity.name+', mousexy:'+Mouse.x+', '+Mouse.y+', scxy: '+sc[0].x+' -> '+sc[2].x + ', '+sc[0].y+' -> '+sc[2].y)
            return false;
        }
 
    }
    isMouseOverCanvas() {
        return this.#y > 0 && this.#y < pc.app.graphicsDevice.height 
            && this.#x > 0 && this.#x < pc.app.graphicsDevice.width;
    }
}


