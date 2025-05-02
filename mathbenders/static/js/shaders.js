var Shaders = {

    GridBlack() {
        // Generate a shader that textures mesh in layers based on world yvalue
        let vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        uniform mat4 matrix_viewProjection;
        uniform mat4 matrix_model;

        varying vec4 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition; // Add this line
        varying float vY;
        uniform float uTime;
        varying float wR;
        varying float wG;
        void main(void) {
            vec4 worldPosition = matrix_model * vec4(aPosition, 1.0);
            vY = worldPosition.y;
            vWorldPosition = worldPosition.xyz; // Set the value here
            vPosition = matrix_viewProjection * worldPosition;
            vNormal = (matrix_model * vec4(aNormal, 0.0)).xyz;
            gl_Position = vPosition;
        }`;
        let fragmentShaderSource = `
        uniform sampler2D uTexture1;
        precision mediump float;
        varying vec4 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition; 
        varying float vY;
        varying float wR;
        varying float wG;
        uniform float waterLevel;
        void main(void) {
            vec4 color;
            vec2 uv = vWorldPosition.xz / 15.0;
            color = texture2D(uTexture1, uv);
            gl_FragColor = color;
        }`;
        let shaderDefinition = {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION,
                aNormal: pc.SEMANTIC_NORMAL,
            },
            uniforms: {
                uTime: pc.UNIFORMTYPE_FLOAT,
                uMaxYExtent: pc.UNIFORMTYPE_FLOAT
            },
            vshader: vertexShaderSource,
            fshader: fragmentShaderSource,
        };

        // Is this shader really necessary?? lol no
        let shader = new pc.Shader(pc.app.graphicsDevice, shaderDefinition);
        let material = new pc.Material();

        material.setParameter('uTexture1',assets.textures.terrain.grid_fine.resource);
        material.shader = shader;
        material.name="GridBlack";
        return material;
    },
 
    NoFogShader(){
        
     // Generate a shader that textures mesh in layers based on world yvalue
        let vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        uniform mat4 matrix_viewProjection;
        uniform mat4 matrix_model;

        varying vec4 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition; // Add this line
        varying float vY;
        uniform float uTime;
        varying float wR;
        varying float wG;
        void main(void) {
            vec4 worldPosition = matrix_model * vec4(aPosition, 1.0);
            vY = worldPosition.y;
            vWorldPosition = worldPosition.xyz; // Set the value here
            vPosition = matrix_viewProjection * worldPosition;
            vNormal = (matrix_model * vec4(aNormal, 0.0)).xyz;
            
            gl_Position = vPosition;
        }`;
    let fragmentShaderSource = `

        uniform sampler2D uTexture1;
        precision mediump float;
        varying vec4 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition; 
        varying float vY;
        varying float wR;
        varying float wG;
        uniform float waterLevel;
        void main(void) {
            vec4 color;
            vec2 uv = vWorldPosition.xz / 15.0;
            color = texture2D(uTexture1, uv);
             gl_FragColor = color;
        }`;
        let shaderDefinition = {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION,
                aNormal: pc.SEMANTIC_NORMAL,
            },
            uniforms: {
                uTime: pc.UNIFORMTYPE_FLOAT,
                uMaxYExtent: pc.UNIFORMTYPE_FLOAT
            },
            vshader: vertexShaderSource,
            fshader: fragmentShaderSource,
        };

        let shader = new pc.Shader(pc.app.graphicsDevice, shaderDefinition);
        return shader;
    },

    DefaultShader1(options={}){
        var { yOffset = 0 } = options;
        yOffset = parseFloat(yOffset).toFixed(2);
     // Generate a shader that textures mesh in layers based on world yvalue
        let vertexShaderSource = `
        precision mediump float;
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        uniform mat4 matrix_viewProjection;
        uniform mat4 matrix_model;

        varying vec4 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition; // Add this line
        varying float vY;
        uniform float uTime;
        varying float wR;
        varying float wG;
        void main(void) {
            vec4 worldPosition = matrix_model * vec4(aPosition, 1.0);
            vY = worldPosition.y;
            vWorldPosition = worldPosition.xyz; // Set the value here
            vPosition = matrix_viewProjection * worldPosition;
            vNormal = (matrix_model * vec4(aNormal, 0.0)).xyz;
            
            // For water waving effect, we only manipulate the y-component of the projected position
            if(false && vY < -10.0) { 
                float wave = sin(worldPosition.x  + worldPosition.z + 0.0001 * vY * uTime);
                vPosition.y += 0.9 * wave;
                wG = (sin(worldPosition.x) + sin(worldPosition.z)+2.0)/4.0/2.0;
                wR = (sin(worldPosition.x) + sin(worldPosition.z)+2.0)/4.0/2.0;
            }
            
            gl_Position = vPosition;
        }`;
    let fragmentShaderSource = `

        precision mediump float;
        uniform sampler2D uTexture3;
        uniform sampler2D uTexture1;
        uniform sampler2D uTexture2;
        uniform float uTime;
        varying vec4 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition; 
        uniform vec4 fogColor; // the color of the fog, set from your application
        uniform float fogDensity; // the density of the fog, set from your application
        varying float vY;
        varying float wR;
        varying float wG;
        uniform float uWaterLevel;
        float smoothNoise(float x) {
            return fract(sin(x) * 43758.5453);
        }
        void main(void) {
            vec4 color;
            float y =  vY - `+yOffset+`;

            // Create a water effect
            float wave = sin(vWorldPosition.x  + uTime/300.0 * 0.5) * 0.1 + 
                         cos(vWorldPosition.z  + uTime/300.0 * 0.7) * 0.1;
            
            float blueShade = 0.5 + wave * 0.5; // Keep within range [0,1]

            // Generate white ripple lines that move randomly but smoothly
            //float ripple = smoothstep(0.4, 0.42, fract(vWorldPosition.x * 0.1 + sin(uTime * 0.2))) + 
            //               smoothstep(0.4, 0.42, fract(vWorldPosition.z * 0.1 + cos(uTime * 0.2)));
            float ripple = 0.0;


            vec3 waterColor = vec3(0.0, 0.0, blueShade) + ripple * 0.5; // Add white ripples



            if (y < uWaterLevel) { // Water
                vec2 uv = vWorldPosition.xz / 15.0;
                color = vec4(waterColor, 1.0);
                // color = texture2D(uTexture3, uv);
            } else if (y < 10.0) { // Grass
                vec2 uv = vWorldPosition.xz / 15.0;
                color = texture2D(uTexture1, uv);
            } else if (y < 20.0) { // Blend
                vec2 uv = vWorldPosition.xz / 15.0;
                float t = (y - 10.0) / (20.0 - 10.0); // normalize vY to the range [0, 1]
                vec4 color1 = texture2D(uTexture1, uv);
                vec4 color2 = texture2D(uTexture2, uv);
                color = mix(color1, color2, t); // mix the colors based on vY
            } else if (y < 30.0) { // Rock
                vec2 uv = vWorldPosition.xz / 15.0;
                color = texture2D(uTexture2, uv);
            } else { // Snow
                color = vec4(1,1,1,1); //1.0 * wR, 1.0 * wG, 1.0, 1.0);
            }
            gl_FragColor = color;
        }`;
        let shaderDefinition = {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION,
                aNormal: pc.SEMANTIC_NORMAL,
            },
            uniforms: {
                uTime: pc.UNIFORMTYPE_FLOAT,
                uMaxYExtent: pc.UNIFORMTYPE_FLOAT
            },
            vshader: vertexShaderSource,
            fshader: fragmentShaderSource,
        };

        let shader = new pc.Shader(pc.app.graphicsDevice, shaderDefinition);
        return shader;
    },
    TexturesByHeight(options={}){
        const { 
            uTexture1 = assets.textures.terrain.grid_fine.resource, 
            uTexture2 = assets.textures.terrain.grid_fine.resource, 
            uTexture3 = assets.textures.terrain.grid_fine.resource } = options;
        let material = new pc.Material();
        material.setParameter('uTexture1',uTexture1);
        material.setParameter('uTexture2',uTexture2);
        material.setParameter('uTexture3',uTexture3);
        material.shader = Shaders.DefaultShader1();
        material.name = "TexturesByHeight";
        return material; 
    },
    NoFogMaterial(options) {
        const { texture } = options;
        let material = new pc.Material();
        material.setParameter('uTexture1',assets.textures.skyboxes.space2.resource);
       //  material.shader = Shaders.NoFogShader();
        material.name = "nofog";
        return material;
    },
    NewShaderMaterialWithTexture(texture){
        let shader_vert=`
            attribute vec2 aUv0;
            attribute vec3 aNormal;
            attribute vec3 aPosition;
            
            uniform vec2 uTiling;
            uniform vec2 uOffset;

            uniform mat4 matrix_model;
            uniform mat4 matrix_viewProjection;
            uniform mat3 matrix_normal;

            varying vec2 vUv0;
            varying vec3 worldNormal;

            void main(void)
            {
                vUv0 = aUv0 * uTiling + uOffset;
                worldNormal = normalize(matrix_normal * aNormal);
                gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition, 1.0);
            }`;
        let shader_frag=`
            varying vec2 vUv0;
            varying vec3 worldNormal;
            uniform sampler2D uDiffuseMap;
            // precision mediump vec4; 
            void main(void)
            {
                vec4 color = texture2D(uDiffuseMap, vUv0);
                gl_FragColor = color;
            }`;

        const material = new pc.ShaderMaterial({
            uniqueName: 'MyShader',
            vertexCode: shader_vert,
            fragmentCode: shader_frag,
            attributes: {
                aPosition: pc.SEMANTIC_POSITION,
                aUv0: pc.SEMANTIC_TEXCOORD0,
                aNormal: pc.SEMANTIC_NORMAL,

            }
        });
        material.setParameter('uDiffuseMap', texture.resource);
        material.setParameter('uTiling', [4, 4]);   // Tiling x4
        material.setParameter('uOffset', [0, 0]);   // No offset
        material.update();
        return material;
    },
    GrassDirtByHeight(options={}) {
        const {
            yOffset=0, // waterlevel set here
            snowLine=30,
            // waterLevel=1
        }=options;
        let material = new pc.StandardMaterial(); // StandardMaterial gives shadows but doesn't let you set textures.
        // Solution: Create standard material, then overwrite materials.chunks.diffusePS and material.chunks.startVS 
        // But, we need to start with playcanvas's original diffuseos/startvs since we cant just overwrite it with our random one
        // because it breaks things in the long and complex shaderchunks chain (
            // https://forum.playcanvas.com/t/shader-chunks-compilation-order/34918
            // https://gist.github.com/JohannesDeml/1124520e5618f6c0ec736c48790d929c

        // So, to get the original diffuseps startvs chunks, grab it from any standardmaterial object e.g. concrete pad meshinstance_shaders[0] and shaders[5] (not sure why there are two but they are diff shaders!) then copy the shader.definition.vshader and fshader to edit. 

        // material.shader = Shaders.DefaultShader1({yOffset:yOffset});
        material.chunks.startVS=vs;
        material.chunks.diffusePS=`
            precision highp float;
            uniform vec3 material_diffuse;
            uniform sampler2D uTexture1;
            uniform sampler2D uTexture2;
            uniform sampler2D uTexture3;
            // uniform float uWaterLevel;
            uniform float uSnowLine;
            varying vec2 uvv;
            uniform float uTime;
            uniform float uYoffset;
            vec3 toLinear(vec3 srgbColor) {
                return pow(srgbColor, vec3(2.2));
            }
            void getAlbedo() {
                float y = vPositionW.y - uYoffset;
                vec4 color;
                float wave = sin(vPositionW.x  + uTime/300.0 * 0.5) * 0.1 + 
                             cos(vPositionW.z  + uTime/300.0 * 0.7) * 0.1;
                float blueShade = 0.5 + wave * 0.5; // Keep within range [0,1]
                vec3 waterColor = vec3(0.0, 0.0, blueShade); 
                if (y < 0.0){ // uWaterLevel) { // Water
                    vec2 uv = vPositionW.xz / 15.0;
                    color = vec4(waterColor, 1.0);
                    // color = texture2D(uTexture3, uv);
                } else if (y < 1.0) { // Blend
                    vec2 uv = vPositionW.xz / 15.0;
                    float t = y / 1.0;
                    vec4 color1 = vec4(waterColor,1.0); //texture2D(uTexture2, uv);
                    vec4 color2 = texture2D(uTexture1, uv);
                    color = mix(color1, color2, t); // mix the colors based on vY
                 } else if (y < 10.0) { // Grass
                    vec2 uv = vPositionW.xz / 15.0;
                    color = texture2D(uTexture1, uv);
                } else if (y < 20.0) { // Blend
                    vec2 uv = vPositionW.xz / 15.0;
                    float t = (y - 10.0) / (20.0 - 10.0); // normalize vY to the range [0, 1]
                    vec4 color1 = texture2D(uTexture1, uv);
                    vec4 color2 = texture2D(uTexture2, uv);
                    color = mix(color1, color2, t); // mix the colors based on vY
                } else if (y < uSnowLine) { // Rock
                    vec2 uv = vPositionW.xz / 15.0;
                    color = texture2D(uTexture2, uv);
                } else { // Snow
                    color = vec4(1,1,1,1); //1.0 * wR, 1.0 * wG, 1.0, 1.0);
                }
                dAlbedo = toLinear(color.rgb);

 




            }`;
        material.setParameter('uTexture1',assets.textures.terrain.grass.resource);
        material.setParameter('uTexture2',assets.textures.terrain.dirt.resource);
        material.setParameter('uTexture3',assets.textures.terrain.water.resource);
        material.setParameter('uYoffset',yOffset);
        material.setParameter('uSnowLine',snowLine);
        // material.setParameter('uWaterLevel',waterLevel);
        
        pc.app.on('update',function(dt){
            material.setParameter('uTime',pc.app._time);
        });
        material.name = "grassdirt";
        material.useGammaTonemap=false;
        material.update();
        return material;
    },
    CreateTextureFromVerts(meshVerts){ 
        // Given a (flat) array of a 3d mesh, return a texture according to the yvalue of each mesh vert
        // https://playcanvas.com/editor/code/708598?tabs=33918705
        let heights = meshVerts.filter((value, index) => { return index % 3 === 1; }); // Get y values only
        normalizeArray(heights); // between 0-1 to property test for height and color

        heights = toSquare2dArray(heights); // unflatten the array of y values

        // introduce upscale factor because if we have a 16x16 mesh we may want a 128x128 texture
        let upscale = 64;
        var dimension = heights.length * upscale;

         var texture = new pc.Texture(pc.app.graphicsDevice, {
                width: dimension,
                height: dimension,
                format: pc.PIXELFORMAT_R8_G8_B8,
                addressU: pc.ADDRESS_CLAMP,
                addressV: pc.ADDRESS_CLAMP,
                minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
                magFilter: pc.FILTER_LINEAR
            });
        var pixels = texture.lock();        
        var count = 0;
        var c = 0;
        for (var w = 0; w < dimension; w++) {
            for (var h = 0; h < dimension; h++) {
                let w2 = dimension - w - 1; // w is flipped
                let index = ((h * dimension + w2) - 1); // swap w and h (rotate the texture)
                // fraction index allows higher sampling resolution
                let height = getValueAtFractionalIndex2d(heights,h/upscale,w2/upscale); 
                if (height < 0.15) {
                    result = new pc.Color(0,0,height*3);
                } else if (height < 0.2) {
                    result = new pc.Color(0,0,height*3);
                } else if (height < 0.4) {
                    result = new pc.Color(0,height*2,0);
                } else if (height < 0.6) {
                    result = new pc.Color(height,height,0);
                } else if (height < 0.8) {
                    result = new pc.Color(0,height,height);
                } else {
                    result = new pc.Color(height,height,height);
                }
                pixels[count++] = result.r * 255;       // red
                pixels[count++] = result.g * 255;       // green
                pixels[count++] = result.b * 255;       // blue
            }
        }

        texture.unlock();   // unlock miplevel and send it to VRAM
        return texture;
    },
     
}


var vs = `
varying vec2 uvv;
varying float vy;
void main(void) {
    gl_Position = getPosition();
   vPositionW    = getWorldPosition();
    uvv = vertex_texCoord0;
`

