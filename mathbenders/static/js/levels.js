/*
Todo: Refactor to leverage Constnats.js TerrainWorldPositions.worldPositionAtIndex(i) for each terrain and Portals should be placed only locally relative. No more global vec3(5000) shit */

const Levels = {
    CreateGameLevels(){

        // Create the "ship" where you are sent on missions.
//        Game.centroid_ship = new pc.Vec3(0,5000,0);
        // Game.spaceship = Levels.CreateSpaceship(); // TODO define centroid once, pass in to ship, world, and pair portal fns

        // Create Alien World 1, a Sine Canyon with simple puzzles where you collect resources.
        Game.levels = {};

        // performance
        // moved to 'cheats' press 'P' to unlock each

//        Game.levels.world1 = Levels.CreateAlienWorld1(); // big canyon
//        Game.levels.world2 = Levels.CreateManifold1();// black grid
//        Game.levels.world3 = Levels.CreatePerlinHills();

//        Game.levels.world2 = Levels.CreateAlienWorld2();

        // Create Alien World 2, a cave-dweller world with reds and purples, with a base terrain (the "floor") and caves (they sit on top of the terrain)

        // Create Alien World 3, a desert island beach world with tropical trees and birds

        // Create Alien World 4, 

        // Create Alpha Prime, a cloud world where users have a shared multiplayer experience


    }, 
    CreateSpaceship(){
        // Technically, the SpaceShip is a Level.
        let centroid = new pc.Vec3(0,5000,0);
        let options = {
            centroid : centroid.clone().add(new pc.Vec3(0,-3,1)),
        }
          
        let opts = {   position:options.centroid }
        let ship = Game.Instantiate['spaceship2'](opts);
        ApplyTextureAssetToEntity({
            textureAsset:assets.textures.spaceship_texture_1,
            entity:ship})

        ship.moveTo(ship.getPosition().add(new pc.Vec3(0,0,-12)),new pc.Vec3(-90,90,0));
        Game.ship = ship;
        
       

       let pos = centroid.clone().add(new pc.Vec3(13,2.0,-9));
        let rot = new pc.Vec3(0,270,0);
//        terrain.Terrains.push({entity:ship});
        const level = new Level();
        level.terrain = new Terrain();
        level.terrain.entity = ship;
        level.terrain.data.centroid = ship.getPosition();
        RealmBuilder.RealmData.Levels.push(level);
        return ship;
//        Game.Instantiate.mr_ball_faceless({position:pos,rotation:rot});

    },

    // Is this a data store or a manager? Should I separate those?
    // Levels.level[0] should be loaded by a LevelManager.Load(Levels.level[0]) ?
    // What specifically do we mean by Terrain, Level, Scene, or Area? Since Levels are loaded cumulatively and not replaced?
    data : {
        0 : {
            name : "GridBlack",
            centroid : new pc.Vec3(0,0,0),
            heightTruncateInterval : 0.5,
            heightScale : 0.05,
            seed : 0.5,
            material : Shaders.TexturesByHeight({
                uTexture1:assets.textures.terrain.grid_blue.resource,
                uTexture2:assets.textures.terrain.grid_fine.resource,
                uTexture3:assets.textures.terrain.grid_fine.resource,
                }),
            dimension : 32,
            sampleResolution : 0.05,
            size : 150,
            placeTrees : false,
        },
        1 : {
            name : "Castle Hills",
            centroid : new pc.Vec3(0,0,0),
            heightTruncateInterval : 0.0,
            heightScale : 0.5,
            seed : 0.5,
            material : Shaders.GrassDirtByHeight(),
            dimension : 64,
            sampleResolution : 0.05,
            size : 250,
            placeTrees : true,
            extraFn : (options) => { 
                const { centroid, terrainEntity } = options;
                const mat = Shaders.GrassDirtByHeight();
                terrainEntity.render.meshInstances[0].material = mat;
                setTimeout(function(){
                    castleArchitecture.buildWalls({
                        seedAsset:Game.Instantiate[Constants.Templates.CastleWall](),
                        centroid:centroid.clone().add(new pc.Vec3(-20,100,-32)),
                        sides:5, 
                        openings:1,
                        radius:20
                    });
                },2000); // doing this without settimeout causes the raycast to fail because it wont hit terrain because it hasn't been loaded by physics yet.
            },
        },
        2 : {
            name : "Perlin Hills 1",
            centroid: new pc.Vec3(5000,10,0),
            heightTruncateInterval : 0.55,
            heightScale : 0.2,
            seed : 0.5,
            material : Shaders.GrassDirtByHeight(),
            dimension : 128,
            sampleResolution : 0.4,
            size : 1000,
            placeTrees : true,
        },

        3 : {
            name : "Flat",
            centroid: new pc.Vec3(0,0,5000),
            heightTruncateInterval : 0,
            heightScale : 0.0,
            seed : 0.5,
            material : Materials.blue,
            dimension : 128,
            sampleResolution : 0.4,
            size : 300,
            placeTrees : false,
            extraFn : ()=>{
                Utils.LinesWithinPlane({centroid:new pc.Vec3(50,-4,5050)})
            },
        },
        4 : {
            name : "Alien World 1", // Perlin hills current version 2024.10.09
            centroid : new pc.Vec3(-5000,0,0),
            heightTruncateInterval : 0.0,
            heightScale : 4.5,
            seed : 0.5,
            dimension : 64,
            sampleResolution : 0.05,
            size : 250,
            placeTrees : true,
            treeCount : 50,
            extraFn : (options) => { 
                const { centroid, terrainEntity } = options;
                const mat = Shaders.GrassDirtByHeight({yOffset:centroid.y});
                terrainEntity.render.meshInstances[0].material = mat;
//                for(let i=0;i<10;i++){
                    setTimeout(function(){
                        castleArchitecture.buildWalls({
                            seedAsset:Game.Instantiate['CastleWall'](),
                            centroid:centroid.clone().add(new pc.Vec3(00,100,02)),
                            sides:20, 
                            openings:1,
                            radius:50
                        });
                    },5000); // settimeout because the walls get created the same frame as terrain and raycast wont hit terarin to drop wall
//                }
            },
        },
        5 : {
            name : "Alien World River1",
            centroid : new pc.Vec3(0,15,0),
            portalExit :new pc.Vec3(-110,1.0,3),
            heightTruncateInterval : 0.0,
            heightScale : 0.5,
//            heights: Terrain.GetPerlin({seed:0.5,dimension:64,sampleResolution:0.05}),
            heights: (()=> { 
                let dim = 128;
                let sampleResolution = 0.025;
                let seed = 0.5;
                let heights2d = perlin.get2dPerlinArr({
                    dim:dim,
                    sampleResolution:sampleResolution,
                    deterministicFloatSeed:seed
                });
                //let heights = this.GetPerlin({seed:0.51,dim:32, sampleResolution:10}); 
                //let verts2d = toSquare2DArray(heights);
                let canyonOpts = {
                    dim : dim, 
                    heights2d : heights2d,
                    wavelength : 64,
                    h : 10, // how curvy the sine wave appears 
                    X : -.8, // height of "floor" of canyon, note that perlin2d returns + and - floats.
                    slide : [1,1,1,1,1,1,1,1,1,1,1,0.9,0.6,0.5,0.45,0.4,0.35,0.3,0.2,0.1], // interpolate between floor and heights2d,
                }
                  let canyonized = TerrainGenerator.AddSineCanyonToPerlinTerrain2d(canyonOpts);
                let heights = canyonized.flat();
                // Utils.truncateArray(heights2d);
                return heights;
           //     return Terrain.GetPerlin({seed:0.5,dimension:64,sampleResolution:0.05})
            })(),
            
            size : 250, // scaled the terrain by this
            placeTrees : true,
            treeCount : 4,
            extraFn : (options) => { 
                const { centroid, terrainEntity } = options;
                const material = Shaders.TexturesByHeight({
                    uTexture1 : assets.textures.terrain.grass.resource,
                    uTexture2 : assets.textures.terrain.dirt.resource,
                    uTexture3 : assets.textures.terrain.water.resource,
                    })

                terrainEntity.render.meshInstances[0].material = material;
                terrainEntity.moveTo(centroid);
                let audioPositions = [pc.Vec3.ZERO,new pc.Vec3(-100,0,0),new pc.Vec3(100,0,0)]
                audioPositions.forEach(x=>{
                    Game.aa = AudioManager.play({
                        source : assets.sounds.river,
                        position : x,
                        rollOffFactor : 0.5,
                        pitch : 1,
                        volume : 1.0,
                        positional : true,
                        loop : true,
                    })
                });

                // "Edge of world"
                const riverpic = Utils.Cube({
                    scale:new pc.Vec3(35,25,1),
                    position:new pc.Vec3(-120,0,-10),
                    rotation:new pc.Vec3(0,80,0),
                })
        Game.riverpic.render.receiveShadows=false;
        ApplyTextureAssetToEntity({entity:Game.riverpic,textureAsset:assets.textures.riverpic});



            },
        },
            
        6 : {
            name : "Alien World River2",
            centroid : new pc.Vec3(5000,15,0),
            heightTruncateInterval : 0.0,
            heightScale : 0.5,
//            heights: Terrain.GetPerlin({seed:0.5,dimension:64,sampleResolution:0.05}),
            heights: (()=> { 
                let dim = 128;
                let sampleResolution = 0.005;
                let seed = 0.5;
                let heights2d = perlin.get2dPerlinArr({
                    dim:dim,
                    sampleResolution:sampleResolution,
                    deterministicFloatSeed:seed
                });
                const heights = Utils.truncateArray(heights2d);
                return heights;
            })(),
            
            size : 250, // scaled the terrain by this
            placeTrees : true,
            treeCount : 4,
            extraFn : (options) => { 
                const { centroid, terrainEntity } = options;
                const material = Shaders.TexturesByHeight({
                    uTexture1 : assets.textures.terrain.purple.resource,
                    uTexture2 : assets.textures.terrain.dirt.resource,
                    uTexture3 : assets.textures.terrain.water.resource,
                    })

                terrainEntity.render.meshInstances[0].material = material;
                console.log("cent:"+centroid);
                terrainEntity.moveTo(centroid);
                let audioPositions = [pc.Vec3.ZERO,new pc.Vec3(-100,0,0),new pc.Vec3(100,0,0)]
                audioPositions.forEach(x=>{
                    Game.aa = AudioManager.play({
                        source : assets.sounds.river,
                        position : x,
                        rollOffFactor : 0.5,
                        pitch : 1,
                        volume : 1.0,
                        positional : true,
                        loop : true,
                    })
                });
            },
        },
        7 : {
            name : "Alien World River0",
            centroid : new pc.Vec3(0,15,0),
            portalExit :new pc.Vec3(-110,1.0,3),
            heightTruncateInterval : 0.0,
            heightScale : 0.5,
//            heights: Terrain.GetPerlin({seed:0.5,dimension:64,sampleResolution:0.05}),
            heights: (()=> { 
                let dim = 64;
                let sampleResolution = 0.025;
                let seed = 0.5;
                let heights2d = perlin.get2dPerlinArr({
                    dim:dim,
                    sampleResolution:sampleResolution,
                    deterministicFloatSeed:seed
                });
                //let heights = this.GetPerlin({seed:0.51,dim:32, sampleResolution:10}); 
                //let verts2d = toSquare2DArray(heights);
                let canyonOpts = {
                    dim : dim, 
                    heights2d : heights2d,
                    wavelength : 64,
                    h : 10, // how curvy the sine wave appears 
                    X : -.8, // height of "floor" of canyon, note that perlin2d returns + and - floats.
                    slide : [1,1,1,1,1,1,1,1,1,1,1,0.9,0.6,0.5,0.45,0.4,0.35,0.3,0.2,0.1], // interpolate between floor and heights2d,
                }
                  let canyonized = TerrainGenerator.AddSineCanyonToPerlinTerrain2d(canyonOpts);
                let heights = canyonized.flat();
                Utils.truncateArray(heights2d);
                return heights;
           //     return Terrain.GetPerlin({seed:0.5,dimension:64,sampleResolution:0.05})
            })(),
            
            size : 1500, // scaled the terrain by this
            placeTrees : true,
            treeCount : 40,
            extraFn : (options={}) => { 
                const { centroid, terrainEntity } = options;
                const material = Shaders.TexturesByHeight({
                    uTexture1 : assets.textures.terrain.grass.resource,
                    uTexture2 : assets.textures.terrain.dirt.resource,
                    uTexture3 : assets.textures.terrain.water.resource,
                    })
        
                terrainEntity.render.meshInstances[0].material = material;
                terrainEntity.moveTo(centroid);
                let audioPositions = [pc.Vec3.ZERO,new pc.Vec3(-100,0,0),new pc.Vec3(100,0,0)]
                audioPositions.forEach(x=>{
                    Game.aa = AudioManager.play({
                        source : assets.sounds.river,
                        position : x,
                        rollOffFactor : 0.5,
                        pitch : 1,
                        volume : 1.0,
                        positional : true,
                        loop : true,
                    })
                });
            },
        },
         8 : {
            name : "Manifold1",
            centroid : new pc.Vec3(5000,100,0),
            portalExit :new pc.Vec3(5000,220.0),
            size : 500, // scaled the terrain by this
            placeTrees : true,
       //     heights : terrain.Manifold(),
            treeCount : 50,
            material : Shaders.GridBlack(),
            extraFn : (options={}) => { 
                const { centroid, terrainEntity } = options;
                terrainEntity.moveTo(centroid);
                terrainEntity.render.meshInstances[0].material = Shaders.GridBlack();
            },
       },
  
    },

   CreateManifold1(){
        let ter = TerrainGenerator.Generate(Levels.data[8]); 
        let centroid = ter.getPosition();

//        Levels.PlacePortalPair({
//            centroid1:Game.centroid_ship.clone().add(new pc.Vec3(0,-1.25,-20)),
//            rotation1:new pc.Vec3(0,0,0),
//            centroid2:centroid.clone().add(new pc.Vec3(0,20,0)),
//            rotation2:new pc.Vec3(0,-134,0),
//            placeLandingPlatform:true,
//            skyboxFn:()=>{  // TODO this doesn't belong here. Move skyboxes to terrainData.
//                console.log('sky (commented so no sky.)');
////                Game.Instantiate['skybox_space']({position:Game.centroid_ship})
//  //              Game.Instantiate.sky2({position:pc.Vec3.ZERO,rotation:new pc.Vec3(-90,0,0)});
//                
//            },
//            backgroundAudio1:assets.sounds.space_ambient,
//            backgroundAudioVolume1:0.2,
//        });
        // terrain.terrains.push(ter);
        return ter;

    },
    CreateAlienWorld1(){
        let data = Levels.data[7];
        let extra = Levels.data[7].extraFn;
        let ter = TerrainGenerator.Generate(data);
        let centroid = ter.getPosition();

        //terrain.terrains.push(ter);
        return ter;

    }, 
    CreatePerlinHills(){
        let ter = TerrainGenerator.Generate(Levels.data[4]); //perlin hills
        let centroid = ter.getPosition();

//        Levels.PlacePortalPair({
//            centroid1:new pc.Vec3(-247,10.75,-340),
//            rotation1:new pc.Vec3(0,180,0),
//            centroid2:new pc.Vec3(-5000,10.0,3),
//            rotation2:new pc.Vec3(0,-120,0),
//            placeLandingPlatform:true,
//            backgroundAudio1:assets.sounds.space_ambient,
//            backgroundAudioVolume1:0.2,
//        });


        TerrainGenerator.terrains.push(ter);

        return ter;


     
    },
    CreateAlienWorld2(){
        let ter = TerrainGenerator.Generate(Levels.data[6]);
        let centroid = ter.getPosition();

        // Block end of sine wave river so you cant fall off level.
        Game.riverpic = Utils.Cube({
            scale:new pc.Vec3(35,25,1),
            position:new pc.Vec3(-120,0,-10),
            rotation:new pc.Vec3(0,80,0),
        })
        Game.riverpic.render.receiveShadows=false;
        ApplyTextureAssetToEntity({entity:Game.riverpic,textureAsset:assets.textures.riverpic});

        // Puzzle 1, the wall the break thru in the river.
        const cw1 = Utils.Cube({position:new pc.Vec3(-80,0,-5),rotation:new pc.Vec3(0,90,0),scale:new pc.Vec3(15,8,1)})
        const cw2 = Utils.Cube({position:new pc.Vec3(-80,0,15),rotation:new pc.Vec3(0,90,0),scale:new pc.Vec3(15,8,1)})


//        Levels.PlacePortalPair({
//            centroid1:new pc.Vec3(-100,1.0,3),
//            rotation1:new pc.Vec3(0,180,0),
//            centroid2:new pc.Vec3(5000,21.0,3),
//            rotation2:new pc.Vec3(0,-120,0),
//            placeLandingPlatform:false,
//            backgroundAudio1:assets.sounds.space_ambient,
//            backgroundAudioVolume1:0.2,
//        });

        //terrain.terrains.push(ter);


        return ter;


        /* Utils.MakePyramid1WithWall(options={x,y,z,num,position})
        let p1 = Game.Instantiate['flat_pyramid']({ position:centroid.clone().add(new pc.Vec3(-50,15,0)) })
        let p2 = Game.Instantiate['flat_pyramid']({ position:centroid.clone().add(new pc.Vec3(50,15,0)) })
        setTimeout(function(){
            // dependency chain fail, circular, needs player droppos because of numberinfo.
            const p = p1.getPosition().add(new pc.Vec3(0,5,0));
            const opts = {
               x:4,
               y:2,
               z:1,
               fraction:new Fraction(1,1),
               position: p,
            }
            let n1 = Game.NumberWall(opts);

        },1000);
        */ 
    },
    CreateManyLevels(){
        // Procedurally test multiple levels. NOT FOR FINAL GAME 
        TerrainGenerator.Generate(Levels.data[0]),
        TerrainGenerator.Generate(Levels.data[1]),
        TerrainGenerator.Generate(Levels.dataLevels.data[2]),
        TerrainGenerator.Generate(Levels.data[3]),

        // Procedural: Build Walls
        // NOTE: Centroid is hardcoded to match with terrain. 
        // TODO / dislike - pair "walls" and other "terrain" features with terrain centroid + offset.
               //Place portals onto terrains.
        Levels.PlacePortalPair({centroid1:new pc.Vec3(30,1.5,30),centroid2:new pc.Vec3(5040,20.6,0)})
        Levels.PlacePortalPair({centroid1:new pc.Vec3(20,1.5,50),centroid2:new pc.Vec3(0,6,5000)})

        // ok lets make some procedural procedural automated terrains.
        const seed = 12345;
        const nextRandom = GenerateRandomFromSeed(seed); // deterministic random
        const randomTexture = function(){
            const values = [
                assets.textures.terrain.grid_blue.resource,
                assets.textures.terrain.grid_fine.resource,
                assets.textures.terrain.grass.resource,
                assets.textures.terrain.dirt.resource,
                assets.textures.terrain.hex_tile.resource,
                assets.textures.terrain.water.resource,
            ];
            const randomIndex = Math.floor(nextRandom() * values.length);
            return values[randomIndex];
          }

        for(let i=1;i<10;i++){
            const cent = new pc.Vec3(i*1000,0,i*1000);
            const terrainDataRand = {
                name : "Random "+i,
                heightTruncateInterval : nextRandom(),
                heightScale : nextRandom() / 2,
                seed : Math.floor(nextRandom() *128),
                material : Shaders.TexturesByHeight({
                    uTexture1 : randomTexture(), 
                    uTexture2 : randomTexture(), 
                    uTexture3 : randomTexture(), 
                    }),
                dimension : 16 + Math.floor(nextRandom() * 48),
                sampleResolution : nextRandom(),
                size : 60 + nextRandom() * 500,
                placeTrees : false, //Math.random() > 0.5,
           }
            // console.log(terrainDataRand);
            const Terrain = TerrainGenerator.Generate(terrainDataRand);
            const portalData = {
                centroid1 : new pc.Vec3(-70,2.5,-80+i*12), 
                rotation1 : new pc.Vec3(0,90,0),
                centroid2 : cent.clone().add(new pc.Vec3(0,10,0)), 
                rotation2 : new pc.Vec3(0,0,0) 
            }
            Levels.PlacePortalPair(portalData);
  
        }

        // Place maze onto Terrain 3.
 
    },
    PlacePortalPair2(options){

        const {
            origin = "Terrain Object 1",
            destination = "Terrain Object 2",
        } = options;
        const fullOptions = {
            centroid1 : origin.portalEntrance,
            centroid2 : destination.portalExit,
            //etc
        }
    },
    PlacePortalPair(options={}){
        const { 
            centroid1 = new pc.Vec3(3,4998,-10), 
            rotation1 = new pc.Vec3(0,180,0),
            centroid2 = new pc.Vec3(3,4998,-20), 
            rotation2 = pc.Vec3.ZERO,
            placeLandingPlatform = true,
            skyboxFn = null,
        } = options;
        
        // Create a portal 
        let testPortal = Portal.CreatePortal();
        testPortal.moveTo(centroid1,rotation1);
        testPortal.name="portal";
        Game.portal = testPortal;
        
        testPortal2 = Portal.CreatePortal();
        testPortal2.moveTo(centroid2, rotation2);
//        if (placeLandingPlatform) tpScript.createLandingPlatform(assets.textures.chess);

        testPortal2.getComponentsInChildren('portal')[0].dest = testPortal;
        testPortal.getComponentsInChildren('portal')[0].dest = testPortal2;
     //   testPortal2.getComponentsInChildren('portal')[0].addWalls();

        // The portal is being created after a terrain, and terrain may have put trees there; so simply "clear" that area
        Utils.DestroyObjectsWithTagByRadius({tag:Tagged.Tree,radius:50,origin:testPortal2.getPosition()});

        // dislike - the awkward part where we set up the portalCamera to be the primary camera, and the main camera to overwrite that depthbuffer to display the normal scene. :(
        Game.portal2 = testPortal2;
        Game.portal2.name = "Portal2";
        //Camera.main.renderTarget=renderTarget; // jenky portal logic - dislike - should not "render texture" as default!!
        
        //testPortal2.children[0].rotate(180);

        if (skyboxFn != null) {
            skyboxFn();
        }
        // Important: Hardcoded values for the portal nearest the player
        // TODO / dislike : dynamically select these based on "Which portal I'm closest to."
 
    },
     
}

