class CursorUpFn {
    constructor(options){
        const { name = "Unnamed", fn, deleteOnExecution = true } = options;
        this._fn = fn;
        this._name = name;
        this._deleteOnExecution = deleteOnExecution;
    }
}
const Mouse = {
    Init () {
        pc.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        pc.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        
    },
    LockCursor(){
        if (Mouse.isMouseOverCanvas()){
            pc.app.mouse.enablePointerLock();
             // Capture the call stack by creating a new Error object
            // const error = new Error();

            // Log the stack trace
            //console.log("Call stack:\n", error.stack);
        }
    },
    UnlockCursor(){
        pc.app.mouse.disablePointerLock();
    },
    isPressed : false,

    x : 0,
    y : 0,
    get screenY() {
       return event.y - canvasOffset.top;
    },
    onMouseMove (event) {
        Mouse.UpdateMousePos();
    },
    onMouseDown(event) {
        Mouse.UpdateMousePos();
        Mouse.isPressed = true;
    },
    onMouseUp(event){
        Mouse.isPressed = false;
        let fnNamesToRemove = [];
        Object.keys(Mouse.onCursorUpFns).forEach(key=>{
            Mouse.onCursorUpFns[key]();
            if (Mouse.onCursorUpFns[key].deleteOnExecution) fnNamesToRemove.push(Mouse.onCursorUpFns[key].name);
        })
        fnNamesToRemove.forEach(x=>{delete Mouse.onCursorUpFns[x]});
    },
    UpdateMousePos(){
        Mouse.y = $('#application').height() - (event.y - canvasOffset.top); // dislike - use canvas instead?
        Mouse.x = event.x - canvasOffset.left;
    },
    cursorInPage : false,
    onCursorUpFns : {}, // like delegates?
    RegisterFunctionToRunOnCursorUp(obj){
        // Example on "slider up" (after slider pressed and moved) we want to run something.
        // Do we  .. uh .. de-register these ever?
        Mouse.onCursorUpFns[obj.name]=obj.fn;
    },
    isMouseOverEntity(entity){
        const sc = entity.element.screenCorners;
        if (Mouse.x > sc[0].x && Mouse.x < sc[2].x && Mouse.y > sc[0].y && Mouse.y < sc[2].y){
            return true;
        } else {
            // console.log('el:'+entity.name+', mousexy:'+Mouse.x+', '+Mouse.y+', scxy: '+sc[0].x+' -> '+sc[2].x + ', '+sc[0].y+' -> '+sc[2].y)
            return false;
        }
 
    },
    isMouseOverCanvas() {
        return Mouse.y > 0 && Mouse.y < pc.app.graphicsDevice.height 
            && Mouse.x > 0 && Mouse.x < pc.app.graphicsDevice.width;
    },
}

$(window).on('mouseout', function() {
    Mouse.cursorInPage = false;
});
$(window).on('mouseover', function() {
    Mouse.cursorInPage = true;
});
window.addEventListener('mouseup', () => { Mouse.isPressed = false;});

