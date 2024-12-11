const FogOutlineShader = {
    Shader (){
        var vertexShader = `
            attribute vec3 aPosition;
            uniform mat4 matrix_viewProjection;
            uniform mat4 matrix_model;

            void main(void) {
                gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition, 1.0);
            }
        `;
        var fragmentShader = `
            uniform sampler2D uDepthMap;
            uniform float uOutlineThreshold;
            uniform float uMaxOutlineThickness;
            uniform float uMinOutlineThickness;
            uniform vec2 uScreenSize;

            float getDepth(vec2 coord) {
                return texture2D(uDepthMap, coord).x;
            }

            float isEdge(vec2 coord) {
                float depth = getDepth(coord);
                float outlineThickness = mix(uMaxOutlineThickness, uMinOutlineThickness, depth);
                
                float edge = 0.0;
                for(int x = -1; x <= 1; x++) {
                    for(int y = -1; y <= 1; y++) {
                        if(x == 0 && y == 0) continue;
                        float neighborDepth = getDepth(coord + vec2(x, y) / uScreenSize);
                        edge += step(uOutlineThreshold, abs(depth - neighborDepth)) * outlineThickness;
                    }
                }
                return clamp(edge, 0.0, 1.0);
            }

            uniform vec3 uFogColor;
            uniform float uFogNear;
            uniform float uFogFar;

            vec3 applyFog(vec3 color, float depth) {
                float fogFactor = smoothstep(uFogNear, uFogFar, depth);
                return mix(color, uFogColor, fogFactor);
            }

            void main(void) {
                vec2 coord = gl_FragCoord.xy / uScreenSize;
                float depth = getDepth(coord);
                float edge = isEdge(coord);

                vec3 color = ...; // Your scene color
                vec3 outlineColor = vec3(0.0, 0.0, 0.0); // Black outline

                // Apply outline
                color = mix(color, outlineColor, edge);

                // Apply fog
                color = applyFog(color, depth);

                gl_FragColor = vec4(color, 1.0);
            }

        `;

        var shader = new pc.Shader(this.app.graphicsDevice, {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION
            },
            vshader: vertexShader,
            fshader: fragmentShader
        });
        return shader
    }, CreateMaterial(){
        var material = new pc.Material();
        material.shader = FogOutlineShader.Shader();
        return material;
        },
    material : null,
    CreateRenderTarget(){

        var renderTarget = new pc.RenderTarget({
            colorBuffer: pc.app.graphicsDevice.createTexture({
                width: window.innerWidth,
                height: window.innerHeight,
                format: pc.PIXELFORMAT_R8_G8_B8_A8
            }),
            depth: true
        });
        return renderTarget;
    }, renderTarget : null,
    depthMap : null,
    initialize(){
        FogOutlineShader.renderTarget = FogOutlineShader.CreateRenderTarget();
        FogOutlineShader.material = FogOutlineShader.CreateMaterial();
        FogOutlineShader.material.setParameter('uDepthMap',FogOutlineShader.depthMap);
        FogOutlineShader.material.setParameter('uOutlineThreshold',1);
        FogOutlineShader.material.setParameter('uMaxOutlineThickness',2);
        FogOutlineShader.material.setParameter('uMinOutlineThickness',1);
        FogOutlineShader.material.setParameter('uScreenSize',[window.innerWidth,window.innerHeight]);

    }, update(dt){
        pc.app.renderer.render(pc.app.scene, Camera.main, FogOutlineShader.renderTarget, true, false);

    },
   
}

FogOutlineShader.initialize();
pc.app.on("update", function (dt) { FogOutlineShader.update(dt); }

