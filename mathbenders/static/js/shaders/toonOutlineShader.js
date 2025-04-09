
//--------------- POST EFFECT DEFINITION------------------------//
// includes fog.
pc.extend(pc, function () {
    // Constructor - Creates an instance of our post effect
    // uses the playcanvas built in shaders with depth value and combines with our custom vert and frag shader,
    // our custom vert/frag are passed in during construction of this defined shader
    var ExamplePostEffect = function (graphicsDevice, vs, fs) {
        // this is the shader definition for our effect
        const vertex = `#define VERTEXSHADER\n` + pc.shaderChunks.screenDepthPS + vs;
        const fragment = pc.shaderChunks.screenDepthPS + fs;
        const shader = pc.createShaderFromCode(pc.app.graphicsDevice, vertex, fragment, 'FogShader');
        this.shader = shader;

    };


    // Frame to connect the posteffect to the variables in the shader
    ExamplePostEffect.prototype = pc.extend(pc.PostEffect.prototype, {
        // Every post effect must implement the render method which 
        // sets any parameters that the shader might require and 
        // also renders the effect on the screen
        render: function (inputTarget, outputTarget, rect) {
            var device = this.device;
            var scope = device.scope;

            // Set the input render target to the shader. This is the image rendered from our camera
            scope.resolve("uColorBuffer").setValue(inputTarget.colorBuffer);
            scope.resolve("uPlayerY").setValue(Game.player.getPosition().y);
           

            // inverse view projection matrix (for reverse engineering world y value from depth value in shader
            // Assume you have your viewMatrix and projectionMatrix

            // Calculate the inverse view-projection matrix
            let inverseViewProjectionMatrix = getInverseViewProjectionMatrix(Camera.main.viewMatrix, Camera.main.projectionMatrix);
            scope.resolve("uInverseViewProjectionMatrix").setValue(inverseViewProjectionMatrix);

            // Draw a full screen quad on the output target. In this case the output target is the screen.
            // Drawing a full screen quad will run the shader that we defined above
            pc.drawFullscreenQuad(device, outputTarget, this.vertexBuffer, this.shader, rect);
        }
    });

    return {
        ExamplePostEffect: ExamplePostEffect
    };
}());

//--------------- SCRIPT DEFINITION------------------------//
var ToonOutlineShader = pc.createScript('toonOutlineShader');


// initialize code called once per entity
ToonOutlineShader.prototype.initialize = function() {
    Camera.main.requestSceneDepthMap(true);
    pc.Tracing.set(pc.TRACEID_RENDER_FRAME, true);
    pc.Tracing.set(pc.TRACEID_RENDER_PASS, true);
    pc.Tracing.set(pc.TRACEID_RENDER_PASS_DETAIL, true);

    
    var effect = new pc.ExamplePostEffect(
        this.app.graphicsDevice, 
        assets.shaders.outlineToonVert.resource, 
        assets.shaders.outlineToonFrag.resource); 
    
    // add the effect to the camera's postEffects queue
    var queue = this.entity.camera.postEffects;
    queue.addEffect(effect);

    
    
    // when the script is enabled add our effect to the camera's postEffects queue
    this.on('enable', function () {
        queue.addEffect(effect, false); 
    });
    
    // when the script is disabled remove our effect from the camera's postEffects queue
    this.on('disable', function () {
        queue.removeEffect(effect); 
    });
    
    
};

