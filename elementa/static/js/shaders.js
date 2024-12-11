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

        uniform sampler2D uTexture3;
        uniform sampler2D uTexture1;
        uniform sampler2D uTexture2;
        precision mediump float;
        varying vec4 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition; 
        uniform vec4 fogColor; // the color of the fog, set from your application
        uniform float fogDensity; // the density of the fog, set from your application
        varying float vY;
        varying float wR;
        varying float wG;
        uniform float waterLevel;
        void main(void) {
            vec4 color;
            float y =  vY - `+yOffset+`;
            if (y < waterLevel) { // Water
                vec2 uv = vWorldPosition.xz / 15.0;
                color = texture2D(uTexture3, uv);
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
            // Calculate the fog factor
            float distance = length(vPosition.xyz);
//            float fogFactor = exp(-pow(distance * fogDensity, 2.0));
            float fogAmount = (log(distance)) * fogDensity; //distInFog * c) - 1) * b;


            // Blend the original color with the fog color
            //vec4 finalColor = mix(color, fogColor, fogFactor);

            //gl_FragColor = finalColor;
            //vec4(finalColor, 1.0);
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
    GrassDirtByHeight(options={}) {
        const {yOffset=0}=options;

        let material = new pc.Material();
        material.setParameter('uTexture3',assets.textures.terrain.grass.resource);
        material.setParameter('uTexture1',assets.textures.terrain.grass.resource);
        material.setParameter('uTexture2',assets.textures.terrain.dirt.resource);
        material.shader = Shaders.DefaultShader1({yOffset:yOffset});
        material.name = "grassdirt";
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
