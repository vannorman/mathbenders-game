// --------------- POST EFFECT DEFINITION --------------- //
Object.assign(pc, function () {
    var OutlineEffect = function (graphicsDevice, normalsTexture, options) {
        pc.PostEffect.call(this, graphicsDevice);
        
        this.normalsTexture = normalsTexture;
        this.outlineOnly = options.outlineOnly;

        //var color = options.outlineColor;
        var color = new pc.Color(0,0,0);
        this.outlineColor = [color.r, color.g, color.b];
        // Packing 4 parameters into one uniform: 
        this.multiplierParameters = [
          options.depthBias,
          options.depthMultiplier, 
          options.normalBias, 
          options.normalMultiplier
        ];

        this.needsDepthBuffer = true;
        this.shader = new pc.Shader(graphicsDevice, {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION
            },
            vshader: `
            attribute vec2 aPosition;
            varying vec2 vUv0;

            void main(void)
            {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vUv0 = (aPosition.xy + 1.0) * 0.5;
            }
            `,
            fshader:
                `
                precision ${graphicsDevice.precision} float;
                ${graphicsDevice.webgl2 ? '#define GL2' : ""}
                ${pc.shaderChunks.screenDepthPS}

                varying vec2 vUv0;
                uniform sampler2D uColorBuffer;
                uniform sampler2D uNormalBuffer;
                uniform bool uOutlineOnly;
                uniform vec4 uMultiplierParameters;
                uniform vec3 uOutlineColor;

                // Helper functions for reading normals and depth of neighboring pixels.
                float getPixelDepth(float x, float y) {
                    // uScreenSize.zw is pixel size 
                    // vUv0 is current position
                    return getLinearScreenDepth(vUv0 + uScreenSize.zw * vec2(x, y));
                }
                vec3 getPixelNormal(int x, int y) {
                    return texture2D(uNormalBuffer, vUv0 + uScreenSize.zw * vec2(x, y)).rgb;
                }
                float saturate(float num) {
                    return clamp(num, 0.0, 1.0);
                }

                void main()
                {
                    // Color, depth, and normal for current pixel.
                    vec4 sceneColor = texture2D( uColorBuffer, vUv0 );
                    float depth = getPixelDepth(0.0, 0.0);
                    vec3 normal = getPixelNormal(0, 0);

                    // Get the difference between depth of neighboring pixels and current.
                    float depthDiff = 0.0;
                    depthDiff += abs(depth - getPixelDepth(1.0, 0.0));
                    depthDiff += abs(depth - getPixelDepth(-1.0, 0.0));
                    depthDiff += abs(depth - getPixelDepth(0.0, 1.0));
                    depthDiff += abs(depth - getPixelDepth(0.0, -1.0));

                    // Get the difference between normals of neighboring pixels and current
                    float normalDiff = 0.0;
                    normalDiff += distance(normal, getPixelNormal(1, 0));
                    normalDiff += distance(normal, getPixelNormal(0, 1));
                    normalDiff += distance(normal, getPixelNormal(0, 1));
                    normalDiff += distance(normal, getPixelNormal(0, -1));

                    normalDiff += distance(normal, getPixelNormal(1, 1));
                    normalDiff += distance(normal, getPixelNormal(1, -1));
                    normalDiff += distance(normal, getPixelNormal(-1, 1));
                    normalDiff += distance(normal, getPixelNormal(-1, -1));

                    // Apply multiplier & bias to each 
                    float depthBias = uMultiplierParameters.x;
                    float depthMultiplier = uMultiplierParameters.y;
                    float normalBias = uMultiplierParameters.z;
                    float normalMultiplier = uMultiplierParameters.w;

                    depthDiff = depthDiff * depthMultiplier;
                    depthDiff = saturate(depthDiff);
                    depthDiff = pow(depthDiff, depthBias);

                    normalDiff = normalDiff * normalMultiplier;
                    normalDiff = saturate(normalDiff);
                    normalDiff = pow(normalDiff, normalBias);

                    float outline = normalDiff + depthDiff;
                    
                    // Combine outline with scene color.
                    vec4 outlineColor = vec4(uOutlineColor, 1.0);
                    gl_FragColor = vec4(mix(sceneColor, outlineColor, outline));

                    if (uOutlineOnly) {
                        gl_FragColor = vec4(vec3(uOutlineColor * outline), 1.0);
                    }

                    // Uncomment to debug draw either the normal buffer  
                    // or the depth buffer.
                    //gl_FragColor = vec4(normal, 1.0);
                    //gl_FragColor = vec4(vec3(depth * 0.0005), 1.0);
                    //gl_FragColor = vec4(vec3(depthMultiplier), 1.0);
                }`
        });
    };

    OutlineEffect.prototype = Object.create(pc.PostEffect.prototype);
    OutlineEffect.prototype.constructor = OutlineEffect;

    Object.assign(OutlineEffect.prototype, {
        render: function (inputTarget, outputTarget, rect) {
            var device = this.device;
            var scope = device.scope;

            // This contains the scene color.
            scope.resolve("uColorBuffer").setValue(inputTarget.colorBuffer);
            // This is the scene re-rendered with a normal material on every mesh.
            scope.resolve("uNormalBuffer").setValue(this.normalsTexture);
            
            // Parameters for styling this effect. 
            scope.resolve("uOutlineOnly").setValue(this.outlineOnly);
            scope.resolve("uMultiplierParameters").setValue(this.multiplierParameters);
            scope.resolve("uOutlineColor").setValue(this.outlineColor);

            pc.drawFullscreenQuad(device, outputTarget, this.vertexBuffer, this.shader, rect);
        }
    });

    return {
        OutlineEffect: OutlineEffect
    };
}());

// ----------------- SCRIPT DEFINITION ------------------ //
var OutlinePostProcess = pc.createScript('outlinePostProcess');
var attr = OutlinePostProcess.attributes;

attr.add('outlineOnly', {
    type: 'boolean', 
    default: false, 
    title: 'Outline Only', 
});
attr.add('outlineColor', {
    type: 'rgb', 
    title: 'Outline Color', 
});
attr.add('depthBias', {
    type: 'number', 
    title: 'Depth Bias', 
    default: 1,
    description: "Smooth out the outlines computed from the depth buffer. Set to 0-1 to for a softer effect. Higher than 1 for a sharper effect."
});
attr.add('depthMultiplier', {
    type: 'number', 
    title: 'Depth Multiplier', 
    default: 1,
    description: "Scales the influence of the depth buffer in the outline effect."
});
attr.add('normalBias', {
    type: 'number', 
    title: 'Normal Bias', 
    default: 1,
    description: "Smooth out the outlines computed from the normal buffer. Set to 0-1 to for a softer effect. Higher than 1 for a sharper effect."
});
attr.add('normalMultiplier', {
    type: 'number', 
    title: 'Normal Multiplier', 
    default: 1,
    description: "Scales the influence of the normal buffer in the outline effect."
});

OutlinePostProcess.prototype.initialize = function () {       
    // Create a layer and a render target to store the "normal buffer". 
    var normalPassLayer = new pc.Layer({
        name: 'NormalsPass',
    });
    normalPassLayer.renderTarget = this.createRt();
    //  Add it to the layer list
    this.app.scene.layers.insert(normalPassLayer, 0);
    // Make all meshes & lights render into the normals pass. 
    // I believe the reasons we need the lights too is 
    // that otherwise the engine won't pass the normal varying to the shader.
    this.getAllEntities(this.app.root, node => {
        if (node.model != undefined)
            node.model.layers = [...node.model.layers, normalPassLayer.id];
        if (node.light != undefined)
            node.light.layers = [...node.light.layers, normalPassLayer.id];
    });
    // Make this layer set a normal material on all meshes
    // and turn it off post render. 
    normalPassLayer.onPreRender = () => {
        this.toggleNormalMaterial(true);
    };
    normalPassLayer.onPostRender = () => {
        this.toggleNormalMaterial(false);
    };
    this.normalPassLayer = normalPassLayer;
    
    // Create a second camera that will render the normals 
    // onto the normal layer we created above.
    var normalsCamera = new pc.Entity();
    normalsCamera.addComponent('camera');
    normalsCamera.camera.layers = [normalPassLayer.id];
    this.normalsCamera = normalsCamera;
    this.app.root.addChild(normalsCamera);
    normalsCamera.camera.clearColor = pc.Color.BLACK;
    
    // Create the outline effect, which needs a reference to the normal buffer of the scene.
    var colorBuffer = normalPassLayer.renderTarget.colorBuffer;
    this.outlineEffect = new pc.OutlineEffect(
        this.app.graphicsDevice, 
        colorBuffer, {
            outlineOnly: this.outlineOnly, 
            outlineColor: this.outlineColor,
            depthBias: this.depthBias,
            depthMultiplier: this.depthMultiplier,
            normalBias: this.normalBias,
            normalMultiplier: this.normalMultiplier
        });    
    
    // Add the effect to the main camera.
    var queue = this.entity.camera.postEffects;
    queue.addEffect(this.outlineEffect);
    this.on('state', function (enabled) {
        if (enabled) {
            queue.addEffect(this.outlineEffect);
        } else {
            queue.removeEffect(this.outlineEffect);
        }
    });

    this.on('destroy', function () {
        queue.removeEffect(this.outlineEffect);
    });
};

OutlinePostProcess.prototype.update = function(dt) {
    this.syncNormalCamera();
    
    // Update uniforms 
    var color = this.outlineColor;
//    this.outlineEffect.outlineColor = [color.r, color.g, color.b];
    this.outlineEffect.outlineColor = [0,0,0];
    this.outlineEffect.outlineOnly = this.outlineOnly;
    this.outlineEffect.multiplierParameters = [
      this.depthBias,
      this.depthMultiplier, 
      this.normalBias, 
      this.normalMultiplier
    ];
    
    // Recreate the buffer & effect if window resizes. 
    var device = this.app.graphicsDevice;
    var rt = this.normalPassLayer.renderTarget;
    if (rt.width !== device.width || rt.height !== device.height) {
        this.recreateOutlineEffect();
    }
};

// Enable hot-reload
// See: https://developer.playcanvas.com/en/user-manual/scripting/hot-reloading/
OutlinePostProcess.prototype.swap = function(old) {
    this.normalPassLayer  = old.normalPassLayer;
    this.outlineEffect = old.outlineEffect;
    this.normalsCamera = old.normalsCamera;
    
    this.recreateOutlineEffect();
};

// All remaining code is helper functions. 
OutlinePostProcess.prototype.recreateOutlineEffect = function() {
    var rt = this.normalPassLayer.renderTarget;
    rt.colorBuffer.destroy();
    rt.destroy();
    this.normalPassLayer.renderTarget = this.createRt();
    var colorBuffer = this.normalPassLayer.renderTarget.colorBuffer;

    var queue = this.entity.camera.postEffects;
    queue.removeEffect(this.outlineEffect);
    this.outlineEffect = new pc.OutlineEffect(
        this.app.graphicsDevice, 
        colorBuffer, {
            outlineOnly: this.outlineOnly, 
            outlineColor: this.outlineColor,
            depthBias: this.depthBias,
            depthMultiplier: this.depthMultiplier,
            normalBias: this.normalBias,
            normalMultiplier: this.normalMultiplier
        });
    queue.addEffect(this.outlineEffect);
};

OutlinePostProcess.prototype.getAllEntities = function(node, callback) {
    if (node == undefined) node = this.app.root; 
    
    for (var i = 0;i < node.children.length; i++) {
        var child = node.children[i];
        this.getAllEntities(child, callback);
    }
    
    callback(node);
};

OutlinePostProcess.prototype.syncNormalCamera = function() {
    // Updates the camera that renders the normals layer
    // It should be identical to the main camera.
    var mainCamera = this.entity;
    var nCamera = this.normalsCamera;
    
    var pos = mainCamera.getPosition();
    var rot = mainCamera.getRotation();
    nCamera.setPosition(pos.x,pos.y,pos.z);
    nCamera.setRotation(rot);
    nCamera.camera.fov = mainCamera.camera.fov;
    nCamera.camera.horizontalFov = mainCamera.camera.horizontalFov;
};

OutlinePostProcess.prototype.createRt = function() {
    var device = this.app.graphicsDevice;
    var texture = new pc.Texture(device, {
        width: Math.floor(device.width),
        height: Math.floor(device.height),
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        mipmaps: false
    });
    
    return new pc.RenderTarget({
        colorBuffer: texture
    });
};

OutlinePostProcess.prototype.toggleNormalMaterial = function(bool) {
    // Replace the material on all opaque meshes in the "World"
    // layer with our normal material.
    var worldLayer = this.app.scene.layers.getLayerByName("World");
    for (let mesh of worldLayer.instances.opaqueMeshInstances) {
        if (mesh.originalMaterial == undefined) {
            mesh.originalMaterial = mesh.material;
        }
        if (bool) {
            mesh.material = this.getNormalMaterial();
        } else {    
            mesh.material = mesh.originalMaterial;
        }
    }
};

OutlinePostProcess.prototype.getNormalMaterial = function () {
    // Cache the material that renders the normals.
    if (this.normalMaterial) return this.normalMaterial;
    
    var material = new pc.StandardMaterial();
    material.customFragmentShader = `
        varying vec3 vNormalW;
        uniform mat4 matrix_view;

        vec3 getViewNormal() {
            return mat3(matrix_view) * vNormalW;
        }

        void main()
        {
            gl_FragColor = vec4(getViewNormal(), 1.0);
        }
    `;
    this.normalMaterial = material;
    return material;
};

