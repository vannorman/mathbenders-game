var Toon = pc.createScript('toon');

Toon.prototype.initialize = function() {
    // store the light entity
    this.light = pc.app.root.findByName("DirectionalLight");
    this.lightDir = new pc.Vec3();            
    
    // get the ramp texture
    var tex = assets.textures.toonRamp.resource;
    
    // create materials
    this.edgeMaterial = this.createEdgeMaterial();
    this.toonMaterial = this.createCelMaterial();

    // Set the initial parameters
    this.edgeMaterial.setParameter('edge', true);
    this.edgeMaterial.setParameter('edgeColor', new pc.Color(0,0,0,0).data);

    this.toonMaterial.setParameter('lightDirection', this.lightDir.data);
    this.toonMaterial.setParameter('edge', false);
    this.toonMaterial.setParameter('texture', tex);

    // assign the toon material to the model
    this.entity.render.meshInstances[0].material = this.toonMaterial;

    // Create a new entity with the same model
    // Assign the edge material to it
    var backfaces = new pc.Entity();
    backfaces.addComponent("render", {attributes:{meshInstances:this.entity.render.meshInstances}});
    backfaces.render.meshInstances[0] = this.entity.render.meshInstances[0];
    backfaces.render.meshInstances[0].material = black; //this.edgeMaterial;
    this.entity.addChild(backfaces);
};

Toon.prototype.createEdgeMaterial = function () {
//            var frag = app.assets.get(this.edge_frag).resource;
    var frag = assets.shaders.toon_edge_frag.resource;
    //var vert = app.assets.get(this.toon_vert).resource;
    var vert = assets.shaders.toon_vert.resource;

    var shaderDefinition = {
        attributes: {
            position: pc.SEMANTIC_POSITION,
            normal: pc.SEMANTIC_NORMAL
        },
        vshader: vert,
        fshader: frag
    };

    var shader = new pc.Shader(pc.app.graphicsDevice, shaderDefinition);

    // Create a new material and set the shader
    var material = new pc.Material();
    material.setShader(shader);
    material.cull = pc.CULLFACE_FRONT;
    
    return material;
};

// Create material which uses light direction and ramp texture to set diffuse color
Toon.prototype.createCelMaterial = function () {
    var frag = assets.shaders.toon_frag.resource
   // app.assets.get(this.toon_frag).resource;
    //var vert = app.assets.get(this.toon_vert).resource;
    var vert = assets.shaders.toon_vert.resource; //app.assets.get(this.toon_vert).resource;
    
    var shaderDefinition = {
        attributes: {
            position: pc.SEMANTIC_POSITION,
            normal: pc.SEMANTIC_NORMAL
        },
        vshader: vert,
        fshader: frag
    };

    var shader = new pc.Shader(pc.app.graphicsDevice, shaderDefinition);

    var material = new pc.Material();
    material.setShader(shader);
    
    return material;    
};

Toon.prototype.update = function (dt) {
    /// spin the entity
    this.entity.rotate(0, 20*dt, 0);
    
    // update the light direction
    this.lightDir.copy(this.entity.getPosition()).sub(this.light.getPosition()).normalize().scale(-1);
    this.toonMaterial.setParameter('lightDirection', this.lightDir.data);
};

