TestManager = {
    // DISLIKE having all of the levelData in a single Test object, I should have levelDataTemplates
    LevelDataTemplates : {
        SineTerrain : {
            name : "Alien World River",
            centroid : pc.Vec3.ZERO,
            heightTruncateInterval : 0.0,
            heightScale : 0.5,
//            heights: Terrain.GetPerlin({seed:0.5,dimension:64,sampleResolution:0.05}), // non-canyonized.
            heights: TerrainGenerator.GetCanyonOne({seed:0.49}), // data structure is hard. Whre does this live?
            size : 250, // scaled the terrain by this
            placeTrees : true, treeCount : 50,
            extraFn : (options) => { 
                const { centroid, terrainEntity } = options;
                const material = terrain.TexturesByHeight({ uTexture1 : assets.textures.terrain.grass.resource,
                                                            uTexture2 : assets.textures.terrain.dirt.resource,
                                                            uTexture3 : assets.textures.terrain.water.resource,  })
                terrainEntity.render.meshInstances[0].material = material;
                terrainEntity.moveTo(centroid);
            },

        }
    },
    Tests :  {
        0 : {
            name : "Sine terrain",
            async Run(options={}){
                const { testLocation = pc.Vec3.ZERO } = options;
                const levelData = TestManager.LevelDataTemplates.SineTerrain;
                const terrain = terrain.Generate(levelData);
                console.log("Ran:");
                return [ terrain, testLocation ];

            },
        },
        1 : {
            name : "Sine terrain",
            async Run(options={}){
                const { testLocation = pc.Vec3.ZERO } = options;
                const levelData = TestManager.LevelDataTemplates.SineTerrain;
                levelData.seed = 0.3;
                const terrain = terrain.Generate(levelData);
                console.log("Ran:");
                return [ terrain, testLocation ];

            },
        },
    },
    async RunAll(){
        const keys = Object.keys(TestManager.Tests);
        for(let i=0;i<keys.length;i++){
           const test = TestManager.Tests[keys[i]];
           await TestManager.RunTest(test);
           print("DON!: "+i);

        }
    },
    async RunTest(test){
        const [obj, pos] = await test.Run(); 
        const cam = new pc.Entity();
        pc.app.root.addChild(cam);
        cam.moveTo(pos.clone().add(new pc.Vec3(0,100,-150)),new pc.Vec3(-30,0,0));
        cam.addComponent('camera');
        cam.camera.layers = [2,0,4];
        cam.camera.priority = 7;
        Game.cam = cam;
        await delay(2000);
        cam.destroy();
        obj.destroy();
        console.log("Finish");
        return "Finishing";
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

