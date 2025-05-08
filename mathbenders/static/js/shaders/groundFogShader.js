// TOOD: Adjust groundFogShader var whenever current level changes, so that "fog" appears at the correct depth (even for terrains offset by some y pos)

// still trying glsl height fog post effect
// https://www.terathon.com/lengyel/Lengyel-UnifiedFog.pdf
const currentTerrainHeightManager = {
    currentTerrainHeight : 0,
    get adjustedPlayerHeight() {
        if (realmEditor)
            return realmEditor.RealmData.Levels[0].terrain.centroid.y;
        else return 0;
    }
    
}
var warpFxByPointManager; // surely a better way than to declare this global to define and reference later?
//--------------- POST EFFECT DEFINITION------------------------//
// includes fog.
pc.extend(pc, function () {
    // Constructor - Creates an instance of our post effect
    // uses the playcanvas built in shaders with depth value and combines with our custom vert and frag shader,
    // our custom vert/frag are passed in during construction of this defined shader
    var GroundFog = function (graphicsDevice, vs, fs, playerEntity) {
        // this is the shader definition for our effect
        const vertex = `#define VERTEXSHADER\nprecision highp float;\n` + pc.shaderChunks.screenDepthPS + vs;
        const fragment = `#define FRAGMENTSHADER\nprecision highp float;\n` + pc.shaderChunks.screenDepthPS + fs;
        const shader = pc.createShaderFromCode(pc.app.graphicsDevice, vertex, fragment, 'FogShader');

        this.shader = shader;
        this.playerEntity = playerEntity;
        this.device = graphicsDevice;
    };

    // Debug outline
    /*
    const Sh = {};
    window.Sh = Sh;
    Sh.depthDiff =.00921;
    Sh.max = 0.0105;
    Sh.outlineThickness = 0.0005;
    Sh.threshold = -0.0001;*/
    // Frame to connect the posteffect to the variables in the shader
    GroundFog.prototype = pc.extend(pc.PostEffect.prototype, {
        // Every post effect must implement the render method which 
        // sets any parameters that the shader might require and 
        // also renders the effect on the screen
        render: function (inputTarget, outputTarget, rect) {
            var device = this.device;
            var scope = device.scope;

            // Set the sun direction for cel shading attenuation calc
            scope.resolve("uSunDir").setValue(Game.sunDir.data);
            scope.resolve("uCameraPos").setValue(Camera.current.entity.getPosition().data);
            scope.resolve("uCameraDir").setValue(Camera.current.entity.forward.data);

            // Set the input render target to the shader. This is the image rendered from our camera
            scope.resolve("uColorBuffer").setValue(inputTarget.colorBuffer);
            scope.resolve("uFarClip").setValue(Camera.current.farClip);

            // Calculate the inverse view-projection matrix
            inverseViewProjectionMatrix = getInverseViewProjectionMatrix(Camera.current.viewMatrix, Camera.current.projectionMatrix);
            scope.resolve("uInverseViewProjectionMatrix").setValue(inverseViewProjectionMatrix.data);
            // scope.resolve("uViewMatrix").setValue(Camera.current.viewMatrix.data);
            scope.resolve("uProjectionMatrix").setValue(Camera.current.projectionMatrix.data);
//            var viewProjectionMatrix = new pc.Mat4();
//            viewProjectionMatrix.mul2(Camera.current.projectionMatrix, Camera.current.viewMatrix);
//            scope.resolve("uViewProjectionMatrix").setValue(viewProjectionMatrix.data);

         
            // Pass in the current vec4 list
            scope.resolve('uMat3Texture').setValue(warpFxByPointManager.texture);
            // scope.resolve("uVec4Texture").setValue(inputTarget.colorBuffer);
            
            scope.resolve('uMat3Count').setValue(warpFxByPointManager.mat3List.length);
            scope.resolve('uPlayerPos').setValue(this.playerEntity.getPosition().clone().data);
            scope.resolve('uAdjustedPlayerHeight').setValue(currentTerrainHeightManager.adjustedPlayerHeight);

            /* debug outline
            scope.resolve('uMin').setValue(Sh.min);
            scope.resolve('uMax').setValue(Sh.max);
            scope.resolve('uDepthDiff').setValue(Sh.depthDiff);
            scope.resolve('uOutlineThickness').setValue(Sh.outlineThickness);
            scope.resolve('uOutlineThreshold').setValue(Sh.threshold);
            */

           // this.playerEntity.getPosition().clone().data);

            // Surely there's a way to have a listener for these events rather than checking a bool each frame?
//            scope.resolve("uWorldAngryA").setValue(Game.worldAngryA);
  //          scope.resolve("uWorldAngryB").setValue(Game.worldAngryB);
            
                      // Draw a full screen quad on the output target. In this case the output target is the screen.
            // Drawing a full screen quad will run the shader that we defined above
            pc.drawFullscreenQuad(device, outputTarget, this.vertexBuffer, this.shader, rect);
        }
    });

    return {
        GroundFog : GroundFog
    };
}());

//--------------- SCRIPT DEFINITION------------------------//
var GroundFogShader = pc.createScript('groundFogShader');
GroundFogShader.attributes.add('cameraEntity', { type: 'entity' });
GroundFogShader.attributes.add('playerEntity', { type: 'entity' });

// initialize code called once per entity
GroundFogShader.prototype.init = function(options) {
    const { cameraEntity, playerEntity } = options;
    this.cameraEntity = cameraEntity;
    this.playerEntity = playerEntity;
    if (!this.cameraEntity){
        console.log("init gfs. cameraent:"+this.cameraEntity.name);
        console.log("How did I get created BEFORE cameras.js created me with entity enabeld ..?");
        return;
    }
    this.cameraEntity.camera.requestSceneDepthMap(true);
    pc.Tracing.set(pc.TRACEID_RENDER_FRAME, true);
    pc.Tracing.set(pc.TRACEID_RENDER_PASS, true);
    pc.Tracing.set(pc.TRACEID_RENDER_PASS_DETAIL, true);
   
    function onGameStateChange(state) {
        switch(state){
        case GameState.RealmBuilder:
            this.enabled=false;
            break;
        case GameState.Playing:
            this.enabled=true;
            break;
        }
    }

    GameManager.subscribe(this,onGameStateChange);
    
    var effect = new pc.GroundFog(
        this.app.graphicsDevice, 
        assets.shaders.outlineToonVert.resource, 
        assets.shaders.outlineToonFrag.resource,
        this.playerEntity
        ); 
    
    // add the effect to the camera's postEffects queue
    var queue = this.entity.camera.postEffects;
    queue.addEffect(effect);

    // create a vec4Manager to handle passing in of data to the shader (positional data)
    warpFxByPointManager = new WarpFxByPointManager(this.app);
    this.app.on('update',function(dt){
       warpFxByPointManager.update(dt);
    });

    
    // when the script is enabled add our effect to the camera's postEffects queue
    this.on('enable', function () {
        queue.addEffect(effect, false); 
    });
    
    // when the script is disabled remove our effect from the camera's postEffects queue
    this.on('disable', function () {
        queue.removeEffect(effect); 
    });
    
    
};


function getInverseViewProjectionMatrix(viewMatrix, projectionMatrix) {

    // Combine the view and projection matrices
    var viewProjectionMatrix = new pc.Mat4();
    viewProjectionMatrix.mul2(projectionMatrix, viewMatrix);

    // Invert the view-projection matrix
    var inverseViewProjectionMatrix = new pc.Mat4();
    inverseViewProjectionMatrix.copy(viewProjectionMatrix).invert();


    return inverseViewProjectionMatrix;

}



// Hmm.. why is this here lol . Guess I need a better management of shader etc.
class WarpFxByPointManager {
    constructor() {
        this.app = pc.app;
        this.mat3List = [];
        this.texture = new pc.Texture(pc.app.graphicsDevice, {
            width: 63,
            height: 64,
            format: pc.PIXELFORMAT_RGBA32F,
            cubemap: false,
            mipmaps: false
        });
    }

    addMat3(options) {
        const { x, y, z, duration=0.5, strength=1, maxDist=2, slowFactor=0.2, blackHoleRadius=0, startTime=0.0} = options;
        this.mat3List.push([x, y, z, duration, strength, maxDist, slowFactor, blackHoleRadius, startTime]);
    }

    update(dt) {
      //   temp remove as we are debugging
        this.mat3List = this.mat3List.filter(mat3 => {
          mat3[7] -= dt * mat3[6];// Math.lerp(0,mat3[7],mat3[3]);
          mat3[8] += dt; // increase running time for sine func
//          console.log("matx:"+mat3[8]);
          mat3[3] -= dt;// *  mat3[6];
           return mat3[3] > 0;
        });
        this.updateTexture();
    }

    updateTexture() {
        var data = new Float32Array(63 * 64 * 4);
        this.mat3List.forEach((mat3, index) => {
            const offset = index * 12;  // Name             // Shader mat3 location
            data[offset + 0] = mat3[0]; // x                // data[0].x
            data[offset + 1] = mat3[1]; // y                // data[0].y
            data[offset + 2] = mat3[2]; // z                // data[0].z
            data[offset + 3] = mat3[3]; // time             // data[1].x
            data[offset + 4] = mat3[4]; // strength         // data[1].y
            data[offset + 5] = mat3[5]; // maxDist          // data[1].z
            data[offset + 6] = mat3[6]; // slowFactor       // data[2].x
            data[offset + 7] = mat3[7]; // blackHoleRadius  // data[2].y
            data[offset + 8] = mat3[8]; //                  // data[2].z
        });

        let textureSource = this.texture.lock();
        for (let i = 0; i < textureSource.length; i++) {
            textureSource[i] = data[i];
        }
        this.texture.unlock();
    }

    destroy() {
        if (this.texture) {
            this.texture.destroy();
        }
    }
}

