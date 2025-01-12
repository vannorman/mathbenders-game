import CanvasResizer from './canvasResizer.js';
const canvasOffset = {top:0,left:0}; // Inventory.js and other ui will depend on this const

class ApplicationLoader {

    static deviceType = 'webgl2';
    static get canvas(){ return document.getElementById('application'); };
    pcx;

    constructor(){
        this.canvas = document.getElementById('application');
        window.canvasResizer = new CanvasResizer();
        this.LoadEngine(this.canvas);
    }

    LoadEngine(canvas) {
        pc.WasmModule.setConfig('DracoDecoderModule', {
            glueUrl: '/static/lib/draco/draco.wasm.js',
            wasmUrl: '/static/lib/draco/draco.wasm.wasm',
            fallbackUrl: '/static/lib/draco/draco.js'
        });

        pc.WasmModule.setConfig("Ammo", {
    //        glueUrl: "/static/lib/ammo/ammo.wasm.js", // Safari has errors with Ammo so we just load ammo js here instead
      //      wasmUrl: "/static/lib/ammo/ammo.wasm.wasm",
            fallbackUrl: "/static/lib/ammo/ammo.js",
        });

    //    pc.WasmModule.getInstance("DracoDecoderModule",(()=>{})); // 
        pc.WasmModule.getInstance("Ammo", this.LoadScene);
    }

    LoadScene(){
        const gfxOptions = {
            deviceTypes: [ApplicationLoader.deviceType],
        //        glslangUrl: "/static/lib/glslang/glslang.js",
        //       twgslUrl: "/static/lib/twgsl/twgsl.js",
        };

        pc.createGraphicsDevice(ApplicationLoader.canvas, gfxOptions).then((device) => {
            const app = new pc.Application(ApplicationLoader.canvas,{}); //AppBase(canvas);

            pc.app.keyboard = new pc.Keyboard(document.body)
            pc.app.mouse = new pc.Mouse(document.body);
            pc.app.elementInput = new pc.ElementInput(document.body);

            pc.app.start();
            ScriptManager.AppLoaded(); // let scriptManager know all dependencies/engine are loaded, so we can load our "game scripts"
            canvasResizer.ResizeCanvas();
        });
        // Script execution error dislike
        // Technically InGameGui hasn't finished loading at this point so you can resize at beginnign of app and get an error message
        $(window).resize(function(){
            canvasResizer.ResizeCanvas();
        });

    }
}


$(document).ready(function(){
    let appLoader = new ApplicationLoader();
});


