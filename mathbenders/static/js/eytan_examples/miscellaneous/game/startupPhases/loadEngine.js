import StartupPhase from "./startupPhase";

class LoadEngine extends StartupPhase {
    get name() { return 'Loading Engine'; }

    async execute() {
        console.log('Loading engine...');
        await loadEngine();
        console.log('Finished loading engine.');
    }
}

export default LoadEngine;

async function loadEngine() {
    pc.WasmModule.setConfig('DracoDecoderModule', {
        glueUrl: '/static/lib/draco/draco.wasm.js',
        wasmUrl: '/static/lib/draco/draco.wasm.wasm',
        fallbackUrl: '/static/lib/draco/draco.js'
    });
    pc.WasmModule.setConfig("Ammo", {
        fallbackUrl: "/static/lib/ammo/ammo.js",
    });
    pc.WasmModule.getInstance("Ammo", LoadScene);
}

async function LoadScene() {

    const gfxOptions = {
        deviceTypes: [deviceType]
    };

    pc.createGraphicsDevice(canvas, gfxOptions).then((device) => {
        const createOptions = new pc.AppOptions();
        createOptions.graphicsDevice = device;

        const app = new pc.Application(canvas,{}); //AppBase(canvas);

        pc.app.keyboard = new pc.Keyboard(document.body)
        pc.app.mouse = new pc.Mouse(document.body);
        pc.app.elementInput = new pc.ElementInput(document.body);

//        app.init(createOptions);

        // Set the canvas to fill the window and automatically change resolution to be the same as the canvas size
        // dislike needing to set fillmode to fill window here, then changed below in resizeCanvas
        // Tried: various combinations of setting canvas fillmode and resolution.
        // The only one I got to work was "set it once here in one way, then set it again, differently, on windowResize.
        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);
        app.start();
        ScriptManager.AppLoaded(); // let scriptManager know all dependencies/engine are loaded, so we can load our "game scripts"
        ResizeCanvas();
    });
    // Script execution error dislike
    // Technically InGameGui hasn't finished loading at this point so you can resize at beginnign of app and get an error message
    $(window).resize(function(){
        ResizeCanvas();
    });
}

function ResizeCanvas(){
    // This is awkwward. Playcanvas doesnt seem to respect resized canvas in x-direciton and won't properly detect mousedown events on elements if the canvas is not as wide as the screen, no matter what fillmode, resolution, canvas size, etc that you set to. So I'm going to manually detect where the cursor is vs where elements are, and check that way.
    // SO, we are forced to determine hovered ui elements by comparing element.screenCorners to mousePosition including our manual offset to center the screen. dislike loll
    // console.log("w,h:"+window.innerWidth+","+window.innerHeight);
    const aspectRatio = {w : 8, h:5 };
    const winWidth = $(window).innerWidth();
    const winHeight = $(window).innerHeight();
    const minTopOffset = 50;
    var w = winWidth;
    var h = winHeight;
    var offset = canvasOffset;
    if (winWidth / winHeight > aspectRatio.w / aspectRatio.h){
        // Calculate and set new resolution at aspect ratio constraint.
        let resX = parseInt(winHeight * aspectRatio.w/aspectRatio.h);
        let resY = parseInt(winHeight);
        res.x=resX,res.y=resY;
        // console.log("xy1:"+resX+", "+resY+", winh:"+winHeight);
        pc.app.setCanvasFillMode(pc.FILLMODE_KEEP_ASPECT,resX,resY);
        pc.app.setCanvasResolution(pc.RESOLUTION_AUTO,resX,resY);

        // Bars on left and right. Image is less wide than total page width.
        w = winHeight * aspectRatio.w/aspectRatio.h;
        offset.left = (winWidth - w)/2;

    } else {
        // Calculate and set new resolution at aspect ratio constraint.
        let resX = parseInt(winWidth);
        let resY = parseInt(winWidth * aspectRatio.h/aspectRatio.w);
        pc.app.setCanvasFillMode(pc.FILLMODE_KEEP_ASPECT,resX,resY);
        pc.app.setCanvasResolution(pc.RESOLUTION_AUTO,resX,resY);
        // console.log("xy2:"+resX+", "+resY);
        res.x=resX,res.y=resY;

        // Bars on top and bottom. Image is as wide as the total page width.
        h = winWidth * aspectRatio.h/aspectRatio.w;
        offset.top = Math.max(minTopOffset,(winHeight-h)/2);
    }
//    if (InGameGui && InGameGui.gui){
    //InGameGui.gui.screen.resolution=new pc.Vec2(res.x,res.y);
    //console.log('sc');
    //  }
    pc.app.resizeCanvas();
    $('#application').css('margin-left',offset.left).css('margin-top',offset.top);

    // Update native playcanvas code because the UI doesn't trigger mouseenter event at correct screen coordinates without this
//    console.log("Extending / updating native PC code for _getTargetElementByCoords due to offset ui mouseenter issue");
    pc.ElementInput.prototype._getTargetElementByCoords = function(camera,x,y){
        var rayA = new pc.Ray();
        var rayB = new pc.Ray();
        rayA.end = new pc.Vec3();
        rayB.end = new pc.Vec3();
        // when y is closer to bottom of screen (closer to zero) it gets more and more offset, at bottom of screen it reads as still being at a high y value. Therefore, we need to subtract between 0 and 1 factor of top margin as a factor of how close mouse y is to bottom of screen.
        y -= parseInt($('#application').css('margin-top'));
        let yPercentCloseToBottom = 1.0 - (pc.app.graphicsDevice.height - y) / pc.app.graphicsDevice.height; // 0 to 1, 1 when y is zero
        let yy = parseInt(yPercentCloseToBottom * parseInt($('#application').css('margin-top')));
        y += yy; // ugh i hate this so much
        x -= parseInt($('#application').css('margin-left'));
        x = parseInt(x*window.innerWidth/$('#application').width());
        var rayScreen = this._calculateRayScreen(x, y, camera, rayA) ? rayA : null;
        var ray3d = this._calculateRay3d(x, y, camera, rayB) ? rayB : null;
        return this._getTargetElement(camera, rayScreen, ray3d);
    }
}