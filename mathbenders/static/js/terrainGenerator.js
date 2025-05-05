TerrainGenerator = {
    terrains : [], // other scripts use this var - to deprecate
    Terrains : [], // only we use this var 
    terrainSpacing : 10000,
    Generate(options={}){
        var  {
            name = "Undefined",
            heightTruncateInterval = 0.0,
            textureOffset = 0,
            heightScale = 0.5,
            resolution = 0.05,
            seed = 0.5,
            material = null, // can't pass material directly, the data isn't a passable type for javascript.
            size = 250,
            centroid,
            treeCount=100,
//            extraFn = null,
            terrainInstance = null,
            resolution2=0,
            heightScale2=0,
            exp=0,
            heights =  (() => {
                const heights2d = perlin.get2dPerlinArr({
                    dim:options.dimension,
                    sampleResolution:resolution,
                    deterministicFloatSeed:seed,
                });


                var heights = heights2d.flat();
                if (options.resolution2 != 0) {
                    heights = TerrainGenerator.SecondLayerWithExponentialHeights({
                        heights:heights,
                        exp:options.exp,
                        dim:options.dimension,
                        resolution2:options.resolution2,
                        heightScale2:options.heightScale2
                    });
               }
                heights = TerrainGenerator.ModHeights({heights:heights,interval:heightTruncateInterval,heightScale:heightScale})

                const modifiers = options.modifiers;
                const size = options.size; // is size strictly world units? We need this to calculate the position of each modifier.
                const centroid = options.centroid;
                if (modifiers && modifiers.length > 0){
                    console.log(JSON.stringify(modifiers));
                    modifiers.forEacH(modifier=>{
                        heights = TerrainGenerator.ApplyModifier({
                            heights:heights,
                            modifier:modifier,
                            centroid:centroid
                        })
                    })
                }


                return heights;
            })(),
            modifiers=[],
        } = options;
        this.textureOffset = textureOffset;

        const newTerrain = { entity : null };
        this.Terrains.push(newTerrain);
        const terrainPosition = centroid;
        let [terrainEntity, positions]  = this.Mesh3({position:terrainPosition,heights:heights,size:size});
        terrainEntity.name = name;

        terrainEntity.tags.add(Constants.Tags.Terrain);
        newTerrain['entity'] = terrainEntity;
        terrainEntity.tags._list.push(Constants.Tags.Terrain);

//        if (trees > 0){
//            setTimeout(function(){ TerrainGenerator.PlaceTrees(terrainEntity,trees,size);},1000);
//        }


        return terrainEntity;
    },
    SecondLayerWithExponentialHeights(options){
        const {exp,heights,dim,resolution2,heightScale2} = options;
        // Second layer of heights
        const heights2d2 = perlin.get2dPerlinArr({
            dim:dim,
            sampleResolution:resolution2,
            });
        var heights2 = heights2d2.flat();
        for(let i=0;i<heights.length;i++){
             
            const d = Math.pow(heights2[i]*heightScale2,exp);
            //console.log('h:'+heights2[i]+', d:'+d+', exp:'+exp);
            heights[i] += d;
            //console.log('d:'+d);
        }
        return heights;
    },
    AddSineCanyonToPerlinTerrain2d(options){
        const { 
            dim = 128, 
            sampleResolution = 0.025,
            seed = 0.5,
            heights2d,
            wavelength = 64,
            h = 10, // how curvy the sine wave appears 
            X = 0, // height of "floor" of canyon,
            slide = [0.99,0.6,0.3,0.1], // interpolate between floor and heights2d,
        } = options;
        // this is how you get heights2d, but do it before you get to this function
        // let P = perlin.get2dPerlinArr({dim:dim,sampleResolution:sampleResolution,deterministicFloatSeed:seed});

        // Step 2: create the Sine array (index only)
        let sineArray = new Array(dim)
        for (let i=0;i<dim;i++){
            sineArray[i] = Math.round(Math.sin(((Math.PI*0.5)*i*0.5)*8/wavelength) * h)  + Math.round(dim/2)
        };

        // Step 3: modify P using slide 
        for(let i=0;i<dim;i++){
            for(let j=0;j<dim;j++){
                if (sineArray[i] == j) {
                    heights2d[i][j] = X;
                    // go up and down by slide.length and modify.
                    
                    for(let k = 1; k<slide.length+1;k++){
                        let delta = (X - heights2d[i][j+k]) * slide[k-1];
                        let result = heights2d[i][j+k] + delta;
                        if (j+k > 0 && j+k < slide.length - 1){
                            heights2d[i][j+k] = result;
                        }
                        // console.log("o:"+heights2d[i][j+k]+", result;"+result);
                    }
                    for(let k = -1; k>-slide.length-1;k--){
                        let delta = (X - heights2d[i][j+k]) * slide[Math.abs(k)-1];
                        let result = heights2d[i][j+k] + delta;
                        heights2d[i][j+k] = result;
                        // console.log("o:"+heights2d[i][j+k]+", result;"+result);
                    }
                }
            }                        
        }

        // reduce all heighst2d vals from 0.xxxxxxxxxxx to 0.xxx for manageability/debugging
        // for(let i=0;i<dim;i++){for(let j=0;j<dim;j++){heights2d[i][j]=parseFloat(heights2d[i][j].toFixed(3))}}
        // console.log(heights2d);
        return heights2d;        
    },
     SineCanyon(size,numWaves = 1,sharpness=20){
        // Create a 128x128 2D array with all values initialized to 0.5
        console.log("creating w size;"+size);
        let heightmap = new Array(size).fill(0).map(() => new Array(size).fill(0));

        // Define the parameters for the sine wave
        const amplitude = 1;        // Amplitude of the sine wave
        const waveLength = size/numWaves;     // Wavelength of the sine wave (spanning 128 columns)

        // x^16 returns 0 while close to 0 and 1 while close to 1
        function smoothstep(x){
            // x always between 0-1
            return Math.pow(x,sharpness);
        }


        // Iterate over each column in the array
        for (let x = 0; x < size; x++) {
          // Calculate the y-coordinate of the sine wave at the current x-coordinate

          // Set the values in the array based on the sine wave
          for (let y = 0; y < size; y++) {
            const y_wave = amplitude * Math.sin(2 * Math.PI * y / waveLength);
            // console.log("y wave at:"+x+","+y+" : "+y_wave);
            // Calculate the distance between the current coordinate and the sine wave
            const distance = 1 - (Math.abs(y - size/2) - y_wave) / size /2;
            var depth = smoothstep(Math.abs(distance));
            let flatThreshold = 0.35;
            if (depth >  flatThreshold) depth = 1;
            // Interpolate between 0.5 and 0 based on the lerp factor
            heightmap[y][x] = -depth;
          }
        }

    //    return heightmap; // exit here for a sTRAIGHT canyon.

        // Now, to make the canyon wiggly, we will rotate each of the sub arrays by some value of sine(row)
        for(let i=0;i<heightmap.length;i++){
           // for sin(x) we get y values between -1 and 1 as we input different X.
           // Here X will be our "i" or the current row.
           // We want "y" to evaluate to noramlize -1 and 1 to the "amplitude" or how wiggly.
           let numWiggles = 4;
           let wiggleDepth = 2;
           let amt = parseInt(Math.sin(i/heightmap.length*4*numWiggles)*heightmap.length); //parseInt(Math.sin((i/heightmap.length)*heightmap.length*numWiggles)*wiggleDepth);
          // console.log("amt:"+amt+" for i:"+i);
            heightmap[i] = slideArray(heightmap[i],amt);
            // console.log(heightmap[i]);
        }

        return heightmap;
        // Print the resulting heightmap

    },
    Canyonize(heights2d){
        // Perform an "additive" sine canyon impression on top of an existing heightmap
        let size = heights2d.length;
        let canyon = Terrain.SineCanyon(size);
        transpose2DArray(canyon);

        let canyonDepth = 0.4;
        canyon.map((row) => {  row.map((element, index, arr) => { 
                arr[index] = element * canyonDepth;
            });
        });

        let combined = [];
        for(let y = 0;y < canyon.length; y++){
            combined[y] = [];
            for (x=0;x<canyon[y].length;x++){
                if (canyon[y][x] < -.09) { // arbitrary height threshold; don't canyonize past this
                    combined[y][x] = canyon[y][x];
                } else {
                   combined[y][x] = canyon[y][x] + heights2d[y][x]
                }
            }
        }
        return combined

    },
    ModHeights(options){
        const { heights,interval=0,heightScale=1} = options;
        heights.forEach((x, i) => {
            // trunc heights to specific y values; create a "stepped" Terrain instead of a smooth one
            //so it results in smooth curves right and forward, with rough steps up and down
            if (interval > 0) {
                heights[i] = x.toInterval(interval); // affects height only, not x and z, 
            }
        })
        heights.forEach((x, i) => {
            // adjust overall height scale of Terrain
            if (heightScale != 1) {
                heights[i] = x * heightScale;
            }
        })
        return heights;
    },

    ApplyModifier(args){
        const {heights,modifier,centroid,scale}=args;
        let dim = Math.sqrt(heights);
        for(let i=0;i<dim;i++){
            // need to "inflate" the flat heights array to a 2d array again
            // or just iterate i and j over it so that i,j is sensibile
            for(let j=0;j<dim;j++){
                let worldPos = modifier.position;
                // which height correponds?

                heights[i*dim + j] = modified;
            }
        }
        heights.forEach((x, i) => {
             
            if (interval > 0) {
                heights[i] = x.toInterval(interval); // affects height only, not x and z, 
            }
        })
        
    }
    Mesh3(options){
        const { position = pc.Vec3.ZERO, size=500, heights = []} = options;
        let app = pc.app;
        const  resolution = Math.sqrt(options.heights.length);
        const scale = size / resolution;
        const height = 10;
        const positions = new Float32Array(3 * resolution * resolution);
        const uvs = new Float32Array(2 * resolution * resolution);

        var vertexFormat = new pc.VertexFormat(pc.app.graphicsDevice, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 },
            { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_UINT8, normalize: true }
        ]);

        // Create a vertex buffer
        var vertexBuffer = new pc.VertexBuffer(pc.app.graphicsDevice, vertexFormat, 16*16);
        let index = 0;
        for (let x = 0; x < resolution; x++) {
            for (let z = 0; z < resolution; z++) {
                
                // x
                positions[3 * index] = scale * (x - resolution * 0.5);
               
                // y
                // the height comes from the value of each vert in the array of verts
                positions[3 * index + 1] = height * scale * options.heights[index]; 

                // z
                positions[3 * index + 2] = scale * (z - resolution * 0.5);

                // UVs for texture 
                uvs[2 * index] = x / resolution;
                uvs[2 * index + 1] = 1 - z / resolution;
                index++;
            }
        }

        // Interleave position and color data
        // Generate array of indices to form triangle list - two triangles per grid square
        const indexArray = [];
        for (let x = 0; x < resolution - 1; x++) {
            for (let y = 0; y < resolution - 1; y++) {
                indexArray.push(
                    x * resolution + y + 1,
                    (x + 1) * resolution + y,
                    x * resolution + y,
                    (x + 1) * resolution + y,
                    x * resolution + y + 1,
                    (x + 1) * resolution + y + 1
                );
            }
        }

        // helper function to update required vertex / index streams
        function updateMesh(mesh, initAll) {
            // Set updated positions and normal each frame
            mesh.setPositions(positions);
            // @ts-ignore engine-tsd
            mesh.setNormals(pc.calculateNormals(positions, indexArray));

            // update mesh Uvs and Indices only one time, as they do not change each frame
            if (initAll) {
                mesh.setUvs(0, uvs);
                mesh.setIndices(indexArray);
            }

            // Let mesh update Vertex and Index buffer as needed
            mesh.update(pc.PRIMITIVE_TRIANGLES);
        }

        // Create a mesh w/inith dynamic vertex buffer and static index buffer
        const mesh = new pc.Mesh(app.graphicsDevice);
    //    mesh.clear(true, false);

        updateMesh(mesh, true);

        // create material for physics (not visible)
        const physicsMaterial = new pc.StandardMaterial();
        physicsMaterial.gloss = 0.5;
        physicsMaterial.metalness = 0.3;
        physicsMaterial.useMetalness = true;
        physicsMaterial.update();

        // Create the mesh instance
        const meshInstance = new pc.MeshInstance(mesh, physicsMaterial);

        // Create the entity with render component using meshInstances
        const entity = new pc.Entity("Terrain");
        entity.addComponent("render", {
            meshInstances: [meshInstance],
        });

        var node = new pc.GraphNode();
        var collisionMeshInstance = new pc.MeshInstance(mesh, physicsMaterial, node);
        var collisionModel = new pc.Model();
        collisionModel.graph = node;
        collisionModel.meshInstances.push(collisionMeshInstance);

        entity.addComponent('collision', {type:'mesh'});
        entity.collision.model = collisionModel;



        const r = entity.addComponent('rigidbody', {
            friction: 0.5,
            type: 'kinematic'
        });

        r.group = Constants.CollisionLayers.FixedObjects;
        r.mask = pc.BODYMASK_ALL & ~r.group;
        // console.log("R was set to fixed as well.");
        // entity.collision.on('collisionstart',function(result){console.log("Ter col w:"+result.other.name);});

        app.root.addChild(entity);
        entity.moveTo(position);
        curvyFloor = entity;
        return [entity, positions];
    },

    GetCanyonOne(options={}){
        const { 
            dim = 128, 
            sampleResolution = 0.025, 
            seed = 0.5, 
            wavelength = 64
       } = options;
        let heights2d = perlin.get2dPerlinArr({dim:dim,sampleResolution:sampleResolution,deterministicFloatSeed:seed});
        let canyonOpts = {
            dim : dim, 
            heights2d : heights2d,
            wavelength : wavelength,
            h : 10, // how curvy the sine wave appears 
            X : -.8, // height of "floor" of canyon, note that perlin2d returns + and - floats.
            slide : [1,1,1,1,1,1,1,1,1,1,1,0.9,0.6,0.5,0.45,0.4,0.35,0.3,0.2,0.1], // interpolate between floor and heights2d,
        }
        return TerrainGenerator.AddSineCanyonToPerlinTerrain2d(canyonOpts).flat();
    },
    terrainCount : 0,
    _terrainList : [],
    getTerrainWorldPosByIndex (index) {
        // Bad; should be a dict or better; lists have mutable indices
        if (this._terrainList && this._terrainList.length > index+1) {
            return this._terrainList[index];
        } else {
            this._terrainList = [];
            // Note: This ordering is special. If you change the ordering algorithm, lookupTerrainPosByIndex will fail
            // and getNextOrderedTerrainByIndex will fail dislike TODO
            const dim = 3;
            const arr = Array.from({ length: dim }, () => Array.from({ length: dim }, () => Array(dim).fill(0)));
            arr.forEach((layer, x) => layer.forEach((row, y) => row.forEach((element, z) => {
                this._terrainList.push(new pc.Vec3(x,y,z));
            })))
            return this._terrainList[index]; 
        }
    },

}


