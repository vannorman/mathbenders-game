class TerrainGenerator {
    constructor() {
        // this.terrains = []; // legacy support
        this.Terrains = []; // internal use
        this.terrainSpacing = 10000;
        this.level = null;
        this.textureOffset = 0;
        this.terrainCount = 0;
        this._terrainList = [];
    }

    Generate(options = {}) {
        const { data, level } = options;
        this.level = level;

        let {
            name = "Undefined",
            heightTruncateInterval = 0.0,
            textureOffset = 0,
            heightScale = 0.5,
            resolution = 0.05,
            seed = 0.5,
            material = null,
            size = 250,
            centroid,
            treeCount = 100,
            terrainInstance = null,
            resolution2 = 0,
            heightScale2 = 0,
            exp = 0,
            heights = [],
            buildCollision = true,
        } = data;

        this.textureOffset = textureOffset;
        const dimension = size * resolution;

        if (heights.length === 0) {
            const heights2d = perlin.get2dPerlinArr({
                dim: dimension,
                sampleResolution: resolution,
                deterministicFloatSeed: seed,
            });
            heights = heights2d.flat();
        }

        const baseHeight = 10;
        const sideResolution = dimension;
        const scale = size / sideResolution;

        heights = heights.map(x => x * heightScale * baseHeight * scale);

        if (resolution2 !== 0) {
            heights = this.SecondLayerWithExponentialHeights({ heights, exp, dim: dimension, resolution2, heightScale2 });
        }

        heights = this.ModHeights({ heights, interval: heightTruncateInterval * 40 });

        let postModifyFns = [];
        if (this.level) {
            // awkward because we only needed to pass the level at all in order to search for modifiers
            // Perhaps it's better to simply pass the modifiers themselves?
            const modifierItems = this.level.templateInstances.filter(x => x.isTerrainModifier); 
            const modifiers = modifierItems.map(x => x.data);

            for (const modifier of modifiers) {
                heights = this.ApplyModifier({ modifier, heights, size, centroid });
                postModifyFns.push(modifier.callback);
            }
        } else{
            // cases when level wouldn't be passed:
            // don't need it (no level, just a rouge terrain, for example created in conjunction with a dungeon)
        }
        const newTerrain = { entity: null };
        this.Terrains.push(newTerrain);

        const [terrainEntity, positions] = this.Mesh3({ centroid, heights, size, buildCollision });
        terrainEntity.name = name;
        terrainEntity.tags.add(Constants.Tags.Terrain);
        newTerrain.entity = terrainEntity;

        postModifyFns.forEach(fn => fn());

        return terrainEntity;
    }

    SecondLayerWithExponentialHeights({ exp, heights, dim, resolution2, heightScale2 }) {
        const heights2d2 = perlin.get2dPerlinArr({ dim, sampleResolution: resolution2 });
        const heights2 = heights2d2.flat();
        for (let i = 0; i < heights.length; i++) {
            const d = Math.pow(heights2[i] * heightScale2, exp);
            heights[i] += d;
        }
        return heights;
    }
    ModHeights(options){
        const { heights,interval=0,heightScale=1} = options;
        heights.forEach((x, i) => {
            // trunc heights to specific y values; create a "stepped" Terrain instead of a smooth one
            //so it results in smooth curves right and forward, with rough steps up and down
            if (interval > 0) {
                heights[i] = x.toInterval(interval); // affects height only, not x and z, 
            }
        })
       return heights;
    }

 

    ApplyModifier({ heights, modifier, centroid, size }) {
        const sideResolution = Math.sqrt(heights.length);
        const radius = (modifier.width + modifier.depth) / 2;
        const positions = this.GlobalPosToTerrainPos({
            centroid,
            globalPos: modifier.position,
            radius,
            sideResolution,
            size
        });

        // let minHeight = Math.min(...positions.map(([x, z]) => heights[x * sideResolution + z]));
        let sum = positions.reduce((acc, [x, z]) => acc + heights[x * sideResolution + z], 0);
        let avgHeight = sum / positions.length;
        const sankHeight = avgHeight - modifier.depth;

        for (const [x, z] of positions) {
            heights[x * sideResolution + z] = sankHeight;
        }

        return heights;
    }

    GlobalPosToTerrainPos({ centroid, globalPos, radius, sideResolution, size }) {
        const scale = size / sideResolution;
        const positions = [];
        for (let x = 0; x < sideResolution; x++) {
            for (let z = 0; z < sideResolution; z++) {
                const localX = scale * (x - sideResolution * 0.5);
                const localZ = scale * (z - sideResolution * 0.5);
                const globalX = centroid.x + localX;
                const globalZ = centroid.z + localZ;
                const d = new pc.Vec2(globalX, globalZ).distance(new pc.Vec2(globalPos.x, globalPos.z));
                if (d < radius) positions.push([x, z]);
            }
        }
        return positions;
    }

    getTerrainWorldPosByIndex(index) {
        if (this._terrainList && this._terrainList.length > index + 1) {
            return this._terrainList[index];
        } else {
            this._terrainList = [];
            const dim = 3;
            for (let x = 0; x < dim; x++) {
                for (let y = 0; y < dim; y++) {
                    for (let z = 0; z < dim; z++) {
                        this._terrainList.push(new pc.Vec3(x, y, z));
                    }
                }
            }
            return this._terrainList[index];
        }
    }
    Mesh3(options){
        const { centroid = pc.Vec3.ZERO, size=500, heights = [], buildCollision=true} = options;
        let app = pc.app;
        const  sideResolution = Math.sqrt(options.heights.length);
        const scale = size / sideResolution;
        const positions = new Float32Array(3 * sideResolution * sideResolution);
        const uvs = new Float32Array(2 * sideResolution * sideResolution);

        var vertexFormat = new pc.VertexFormat(pc.app.graphicsDevice, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 },
            { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_UINT8, normalize: true }
        ]);

        // Create a vertex buffer
        var vertexBuffer = new pc.VertexBuffer(pc.app.graphicsDevice, vertexFormat, 16*16);
        let index = 0;
        for (let x = 0; x < sideResolution; x++) {
            for (let z = 0; z < sideResolution; z++) {
                
                // x
                positions[3 * index] = scale * (x - sideResolution * 0.5);
               
                // y
                // the height comes from the value of each vert in the array of verts
                // positions[3 * index + 1] = height * scale * options.heights[index]; 
                positions[3 * index + 1] = options.heights[index]; 

                // z
                positions[3 * index + 2] = scale * (z - sideResolution * 0.5);

                // UVs for texture 
                uvs[2 * index] = x / sideResolution;
                uvs[2 * index + 1] = 1 - z / sideResolution;
                index++;
            }
        }

        // Interleave position and color data
        // Generate array of indices to form triangle list - two triangles per grid square
        const indexArray = [];
        for (let x = 0; x < sideResolution - 1; x++) {
            for (let y = 0; y < sideResolution - 1; y++) {
                indexArray.push(
                    x * sideResolution + y + 1,
                    (x + 1) * sideResolution + y,
                    x * sideResolution + y,
                    (x + 1) * sideResolution + y,
                    x * sideResolution + y + 1,
                    (x + 1) * sideResolution + y + 1
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

        if (buildCollision){
            this.AddCollisionMeshToTerrain({entity:entity,mesh:mesh,physicsMaterial:physicsMaterial}) ;
            const r = entity.addComponent('rigidbody', {
                friction: 0.5,
                type: 'kinematic'
            });
            r.group = Constants.CollisionLayers.FixedObjects;
            r.mask = pc.BODYMASK_ALL & ~r.group;

         }
            

        app.root.addChild(entity);
        entity.moveTo(centroid);
        return [entity, positions];
    }

    // collisionTimeoutFns = [];

    AddCollisionMeshToTerrain(args){
        const {entity,mesh,physicsMaterial}=args;
        var node = new pc.GraphNode();
        var collisionMeshInstance = new pc.MeshInstance(mesh, physicsMaterial, node);
        var collisionModel = new pc.Model();
        collisionModel.graph = node;
        collisionModel.meshInstances.push(collisionMeshInstance);

        entity.addComponent('collision', {type:'mesh'});
        entity.collision.model = collisionModel;


    }
    // Add remaining methods as needed following this pattern.
}

// Usage:
// const generator = new TerrainGenerator();
// const terrain = generator.Generate({ data, level });


/*
class TerrainGenerator = {
    terrains : [], // other scripts use this var - to deprecate
    Terrains : [], // only we use this var 
    terrainSpacing : 10000,
    Generate(options={}){
        var  { data, level } = options;
        this.level = level;
        var {
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
            terrainInstance = null,
            resolution2=0,
            heightScale2=0,
            exp=0,
            heights = [],
            level
        } = data;
        const dimension = size * resolution;
        this.textureOffset = textureOffset;

        if (heights.length == 0){
            const heights2d = perlin.get2dPerlinArr({
                dim:dimension,
                sampleResolution:resolution,
                deterministicFloatSeed:seed,
            });
            heights = heights2d.flat();

        }

        ///// Mod heights
        const sideResolution = dimension; 
        const scale = size / sideResolution;

        // Heights were generated "raw" as a range 0-1
        const baseHeight = 10;
        
        heights.forEach((x, i) => {
            // adjust overall height scale of Terrain
            if (heightScale != 1) {
                heights[i] = x * heightScale * baseHeight * scale;
            }
        })



        if (resolution2 != 0) {
            heights = TerrainGenerator.SecondLayerWithExponentialHeights({
                heights:heights,
                exp:exp,
                dim:dimension,
                resolution2:resolution2,
                heightScale2:heightScale2
            });
       }

       // One type of "global" mod heights
        heights = TerrainGenerator.ModHeights({heights:heights,interval:heightTruncateInterval})

        // Another type of "local /object based" mod heights

        let postModifyFns = [];
         
    ////////

        const newTerrain = { entity : null };
        this.Terrains.push(newTerrain);
        const terrainPosition = centroid;
        let [terrainEntity, positions]  = this.Mesh3({centroid:terrainPosition,heights:heights,size:size});
        terrainEntity.name = name;

        terrainEntity.tags.add(Constants.Tags.Terrain);
        newTerrain['entity'] = terrainEntity;
        terrainEntity.tags._list.push(Constants.Tags.Terrain);

//        if (trees > 0){
//            setTimeout(function(){ TerrainGenerator.PlaceTrees(terrainEntity,trees,size);},1000);
//        }


        postModifyFns.forEach(x=>{x();})
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
            heights[i] += d;
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
       return heights;
    },

    ApplyModifier(args){
        const {heights,modifier,centroid,size}=args;
        let dim = Math.sqrt(heights);
        const radius = (modifier.width + modifier.depth) / 2;
        const  sideResolution = Math.sqrt(heights.length);
        let heightsToMod2d = TerrainGenerator.GlobalPosToTerrainPos({
            centroid:centroid,
            globalPos:modifier.position,
            radius:radius,
            sideResolution:sideResolution,
            size:size,
        });
        let minHeight = Infinity;
        heightsToMod2d.forEach(arr=>{
            const x = arr[0];
            const z = arr[1];
            const index = x*sideResolution+z;
            let h = heights[index];
            if (h < minHeight) {
                minHeight = h;
            }
        });

        const sankHeight = minHeight - modifier.depth;
        heightsToMod2d.forEach(arr=>{
            const x = arr[0];
            const z = arr[1];
            const index = x*sideResolution+z;
            heights[index]=sankHeight;


        });
        return heights;      
        
        
    },
    GlobalPosToTerrainPos(args){
        const {
            centroid,
            globalPos,
            radius,
            sideResolution,
            size,
            isSquare=false,
        }=args;
        const scale = size  / sideResolution;
        let positions = [];
        for (let x = 0; x < sideResolution; x++) {
            for (let z = 0; z < sideResolution; z++) {

                const localX = scale * (x - sideResolution * 0.5);
                const localZ = scale * (z - sideResolution * 0.5);
                const globalX = centroid.x + localX;
                const globalZ = centroid.z + localZ;
                let p1 = new pc.Vec2(globalX,globalZ);
                Utils3.debugSphere({position:p1,timeout:10000})
                let p2 = new pc.Vec2(globalPos.x,globalPos.z);
                let d = p1.distance(p2);
                if (d < radius){
                    positions.push([x,z])
                    
                } else {
                }

            }
        }
        return positions;     
    },
    Mesh3(options){
        const { centroid = pc.Vec3.ZERO, size=500, heights = []} = options;
        let app = pc.app;
        const  sideResolution = Math.sqrt(options.heights.length);
        const scale = size / sideResolution;
        const positions = new Float32Array(3 * sideResolution * sideResolution);
        const uvs = new Float32Array(2 * sideResolution * sideResolution);

        var vertexFormat = new pc.VertexFormat(pc.app.graphicsDevice, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 },
            { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_UINT8, normalize: true }
        ]);

        // Create a vertex buffer
        var vertexBuffer = new pc.VertexBuffer(pc.app.graphicsDevice, vertexFormat, 16*16);
        let index = 0;
        for (let x = 0; x < sideResolution; x++) {
            for (let z = 0; z < sideResolution; z++) {
                
                // x
                positions[3 * index] = scale * (x - sideResolution * 0.5);
               
                // y
                // the height comes from the value of each vert in the array of verts
                // positions[3 * index + 1] = height * scale * options.heights[index]; 
                positions[3 * index + 1] = options.heights[index]; 

                // z
                positions[3 * index + 2] = scale * (z - sideResolution * 0.5);

                // UVs for texture 
                uvs[2 * index] = x / sideResolution;
                uvs[2 * index + 1] = 1 - z / sideResolution;
                index++;
            }
        }

        // Interleave position and color data
        // Generate array of indices to form triangle list - two triangles per grid square
        const indexArray = [];
        for (let x = 0; x < sideResolution - 1; x++) {
            for (let y = 0; y < sideResolution - 1; y++) {
                indexArray.push(
                    x * sideResolution + y + 1,
                    (x + 1) * sideResolution + y,
                    x * sideResolution + y,
                    (x + 1) * sideResolution + y,
                    x * sideResolution + y + 1,
                    (x + 1) * sideResolution + y + 1
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

        app.root.addChild(entity);
        entity.moveTo(centroid);
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

*/
