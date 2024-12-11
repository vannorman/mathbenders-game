const SkyboxManager = {
    skyboxMaterial : null,
    get SunnyFaces() { return [
            assets.textures.skyboxes.sunny.front.resource,
            assets.textures.skyboxes.sunny.back.resource,
            assets.textures.skyboxes.sunny.top.resource,
            assets.textures.skyboxes.sunny.bottom.resource,
            assets.textures.skyboxes.sunny.left.resource,
            assets.textures.skyboxes.sunny.right.resource
        ]},
    
    SetSkybox (faces) {


        var cubemapAsset = new pc.Asset('skybox', 'cubemap', {
                url: '' // Leave it empty because we will manually assign the textures
            });

        cubemapAsset.resources = faces;
        pc.app.assets.add(cubemapAsset); 
        cubemapAsset.type = 'cubemap';

//        pc.app.scene.skyboxMip = 0; // Default mip level
        pc.app.scene.setSkybox(cubemapAsset.resources);
        //skyboxMaterial.cubeMap = cubemap;
        //skyboxMaterial.shader = pc.shaderChunks.skyboxEnvShader;

        // Apply the material as the skybox to the scene
        //pc.app.scene.skybox = cubemap;
        
        // Ensure the skybox renders correctly
        pc.app.scene.skyboxIntensity = 1;
    }
}


