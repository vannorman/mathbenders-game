function Cloud2(position, size) {
    this.position = position;
    this.size = size;
    this.spheres = [];

    let shaderDefinition = {
        attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aNormal: pc.SEMANTIC_NORMAL,
        },
        vshader: `
            attribute vec3 aPosition;
            attribute vec3 aNormal;
            uniform mat4 matrix_model;
            uniform mat4 matrix_viewProjection;
            void main(void) {
                gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition, 1.0);
            }`,
        fshader: `
            precision mediump float;
            void main(void) {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 0.7);  // Cloud color - white and semi-transparent
            }`,
    };
    let shader = new pc.Shader(pc.app.graphicsDevice, shaderDefinition);
    let material = new pc.Material();
    material.shader = shader;

    let sphereModelAsset = new pc.Asset("sphereModel", "model", { url: "path/to/your/sphere/model" });

    sphereModelAsset.ready(function() {
        for (let i = 0; i < size; i++) {
            let sphere = new pc.Entity();
            sphere.addComponent('model', { type: 'asset', asset: sphereModelAsset });
            sphere.model.material = material;  // Set material
            let x = Math.random() * size - size / 2;
            let y = Math.random() * size - size / 2;
            let z = Math.random() * size - size / 2;
            sphere.setLocalPosition(x, y, z);
            pc.app.root.addChild(sphere);  // Add to root
            this.spheres.push(sphere);
        }
    });

    let colliderEntity = new pc.Entity();
    colliderEntity.addComponent('collision', { type: 'box', halfExtents: [size/2, size/2, size/2] });
    colliderEntity.setPosition(this.position);
    pc.app.root.addChild(colliderEntity);  // Add to root

    // Add the collider and spheres to the parent entity
    let cloudEntity = new pc.Entity();
    cloudEntity.addChild(colliderEntity);
    this.spheres.forEach(sphere => {
        cloudEntity.addChild(sphere);
    });
    pc.app.root.addChild(cloudEntity);  // Add to root
    pc.app.assets.add(sphereModelAsset);
pc.app.assets.load(sphereModelAsset);
}


