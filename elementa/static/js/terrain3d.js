const Terrain3d = {
    makeNoise3dArr(dim){
        var noise = new Noise(Math.random());
        let noise3d = Array.from({ length: dim }, () => Array.from({ length: dim }, () => Array(dim).fill(0)));
        noise3d.forEach((layer, x) => layer.forEach((row, y) => row.forEach((element, z) => {
            noise3d[x][y][z] = noise.simplex3(x/dim,y/dim,z/dim);
        })))
        return noise3d;

    },
    Noise3dTerrain(dim,s=2.5,threshold=0){
        var noise = new Noise(0.5); // use Math.random() for rand seed
        let noise3d = []
        for(let i=0;i<dim;i++){
            noise3d[i] = [];
            for(let j=0;j<dim;j++){
                noise3d[i][j] = []
                for (let k=0;k<dim;k++){
                    n = noise.simplex3(i/dim,j/dim,k/dim);
                    // let fudge = 0.2; // increase each value by this amount 
                    noise3d[i][j][k] = n;
                    if (n > 0){
                        let nn = (n + 0.2)*3;
                      //      let a = Cube(new pc.Vec3(i*s,j*s,k*s),new pc.Vec3(s*nn,s*nn,s*nn),false); //,'kinematic');
                      // Cubes are too non performant. Need a singular mesh.
                      // a.render.material = blue;
//                        console.log("a:"+a.getPosition());
                    }
                }
            }
        }

        // now that we have 3d array of noise3ditions, check each one to see if it's a "surface" node or not. 
        // If it is, we can use its centroid as the point to draw a 3d mesh.
        let surface3d = Array.from({ length: dim }, () => Array.from({ length: dim }, () => Array(dim).fill(0)));
       
        let surfaceCount = 0;
        let interiorCount = 0;

        noise3d.forEach((layer, x) => layer.forEach((row, y) => row.forEach((element, z) => {
            let neighbors = [];    
            if (x > 0) neighbors.push(noise3d[x - 1][y][z]); // Left neighbor
            if (x < noise3d.length - 1) neighbors.push(noise3d[x + 1][y][z]); // Right neighbor
            if (y > 0) neighbors.push(noise3d[x][y - 1][z]); // Bottom neighbor
            if (y < noise3d[0].length - 1) neighbors.push(noise3d[x][y + 1][z]); // Top neighbor
            if (z > 0) neighbors.push(noise3d[x][y][z - 1]); // Back neighbor
            if (z < noise3d[0][0].length - 1) neighbors.push(noise3d[x][y][z + 1]); // Front neighbor
            let surfaceVert = element > 0 && neighbors.filter(x => x <= 0).length > 0;
            surfaceVert ? surfaceCount++ : interiorCount++;
            if (surfaceVert) {
                let p = new pc.Vec3(x*s,y*s,z*s);
                surface3d[x][y][z] = p;        
//                let nn = (element+0.2)*3;
                // let cube = Cube(new pc.Vec3(x*s,y*s,z*s),new pc.Vec3(s*nn,s*nn,s*nn),false); //,'kinematic');
//                let cube = Cube(p,new pc.Vec3(s/3,s/3,s/3),false); //,'kinematic');
                // cube.render.material = blue;
                let cube = Game.NumberCube(new pc.Vec3(x*s,y*s,z*s));
                cube.rigidbody.type = "kinematic";
                let ni = cube.getComponentsInChildren('numberInfo')[0];
                ni.setObjectProperties({fraction:{numerator:x+","+y+","+z,denominator:1}},ni);
            }


        })));
//        console.log("Surf:"+surfaceCount+", inte:"+interiorCount);
//        console.log(surface3d);

        surface3d.forEach((layer, x) => layer.forEach((row, y) => row.forEach((element, z) => {
            if (element instanceof pc.Vec3){
                neighbors = this.getNeighbors3d(surface3d,x,y,z);
                //if (x == 1 && y == 0 && z == 1){

                if (true) {
                    for (let i=0; i<neighbors.length ; i++){
                        // if element x value is % 2 == 0 then only make triangles to the right

    //                    if (x % 2 == 0 && neighbors[i].x < element.x || neighbors[i+1].x < element.x) continue; 
                        // get EVERY triplet between neighbors which includes me?
                        let a = b = c = 0;
                        if (i == neighbors.length- 1){
                            a = element;
                            b = neighbors[i];
                            c = neighbors[0];

                        } else {
                            a = element;
                            b = neighbors[i];
                            c = neighbors[i+1];

                        }



                        if (pc.Vec3.distance(a,b) > s * Math.SQRT2 + .05) continue;
                        if (pc.Vec3.distance(b,c) > s * Math.SQRT2 + .05) continue;
                        if (pc.Vec3.distance(a,c) > s * Math.SQRT2 + .05) continue;


                        
                        Triangle2(a,b,c);
                    }
                }
    //                console.log("Ns of "+x+","+y+","+z+": "+neighbors);
            }
        })))


        return surface3d;
    },
    getNeighbors3d(arr3d,x,y,z, filterFn = (x) => x instanceof pc.Vec3){
        neighbors = [];
        try { neighbors.push(arr3d[x - 1][y - 1][z - 1]); } catch {};
        try { neighbors.push(arr3d[x - 1][y - 1][z]); } catch {};
        try { neighbors.push(arr3d[x - 1][y - 1][z + 1]); } catch {};
        try { neighbors.push(arr3d[x - 1][y][z - 1]); } catch {};
        try { neighbors.push(arr3d[x - 1][y][z]); } catch {};
        try { neighbors.push(arr3d[x - 1][y][z + 1]); } catch {};
        try { neighbors.push(arr3d[x - 1][y + 1][z - 1]); } catch {};
        try { neighbors.push(arr3d[x - 1][y + 1][z]); } catch {};
        try { neighbors.push(arr3d[x - 1][y + 1][z + 1]); } catch {};
        try { neighbors.push(arr3d[x][y - 1][z - 1]); } catch {};
        try { neighbors.push(arr3d[x][y - 1][z]); } catch {};
        try { neighbors.push(arr3d[x][y - 1][z + 1]); } catch {};
        try { neighbors.push(arr3d[x][y][z - 1]); } catch {};
//        try { neighbors.push(arr3d[x][y][z] (Current element)); } catch {};
        try { neighbors.push(arr3d[x][y][z + 1]); } catch {};
        try { neighbors.push(arr3d[x][y + 1][z - 1]); } catch {};
        try { neighbors.push(arr3d[x][y + 1][z]); } catch {};
        try { neighbors.push(arr3d[x][y + 1][z + 1]); } catch {};
        try { neighbors.push(arr3d[x + 1][y - 1][z - 1]); } catch {};
        try { neighbors.push(arr3d[x + 1][y - 1][z]); } catch {};
        try { neighbors.push(arr3d[x + 1][y - 1][z + 1]); } catch {};
        try { neighbors.push(arr3d[x + 1][y][z - 1]); } catch {};
        try { neighbors.push(arr3d[x + 1][y][z]); } catch {};
        try { neighbors.push(arr3d[x + 1][y][z + 1]); } catch {};
        try { neighbors.push(arr3d[x + 1][y + 1][z - 1]); } catch {};
        try { neighbors.push(arr3d[x + 1][y + 1][z]); } catch {};
        try { neighbors.push(arr3d[x + 1][y + 1][z + 1]); } catch {};


        return neighbors.filter(x => filterFn(x));
    },
    buildPerlin3d(dim=3,s=2.5,threshold=0){
        let surface3d = Noise3dTerrain(dim,s,threshold);
        let positions = [];
        let uvs = [];
        let indexArray = [];

        surface3d.forEach((layer, x) => layer.forEach((row, y) => row.forEach((element, z) => {
            
        })))

    },
    Mesh4(p=pc.Vec3.ZERO,size=500){
        const noise3dFull = Terrain3d.makeNoise3dArr(64);
        dim = noise3dFull.length;
        // p:starting position
        // noise3dFull: 3d perlin array incl. <0
        // noise3dSurface: 3d perlin array only >0

        // dim: perlin array size (cube)
        // size: Terrain scale
        const scale = size / dim;
        // const positions = new Float32Array(3 * noise3dSurface.flat(Infinity).length); // 3 elements for each vertex (xyz per each)

        var vertexFormat = new pc.VertexFormat(pc.app.graphicsDevice, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 },
            { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_UINT8, normalize: true }
        ]);

        // Create a vertex buffer
        let index = 0;

        positions = [];
        indexArray = [];
        uvs = [];
            
          function isOnSurface(x, y, z) {
            // Check if current vertex is above zero
            if (noise3dFull[x][y][z] > 0) {
              // Check if any neighboring vertices are below zero
              if (
                (x > 0 && noise3dFull[x - 1][y][z] < 0) ||
                (x < dim - 1 && noise3dFull[x + 1][y][z] < 0) ||
                (y > 0 && noise3dFull[x][y - 1][z] < 0) ||
                (y < dim - 1 && noise3dFull[x][y + 1][z] < 0) ||
                (z > 0 && noise3dFull[x][y][z - 1] < 0) ||
                (z < dim - 1 && noise3dFull[x][y][z + 1] < 0)
              ) {
                return true;
              }
            }

            return false;
          }

          // Generate positions and triangles
          for (let x = 0; x < dim; x++) {
            for (let y = 0; y < dim; y++) {
              for (let z = 0; z < dim; z++) {
                if (isOnSurface(x, y, z)) {
                  // Generate position for the current vertex
                  positions.push(x, y, z);

                  // Generate triangles based on neighboring vertices on the surface
                  if (x > 0 && isOnSurface(x - 1, y, z)) {
                    indexArray.push(
                      positions.length / 3 - 1,
                      positions.length / 3 - 2,
                      positions.length / 3 - 4
                    );
                  }
                  if (y > 0 && isOnSurface(x, y - 1, z)) {
                    indexArray.push(
                      positions.length / 3 - 1,
                      positions.length / 3 - 4,
                      positions.length / 3 - 5
                    );
                  }
                  if (z > 0 && isOnSurface(x, y, z - 1)) {
                    indexArray.push(
                      positions.length / 3 - 1,
                      positions.length / 3 - 5,
                      positions.length / 3 - 2
                    );
                  }
                }
              }
            }
          }
       
        console.log("ositions:"+positions);

        positions = new Float32Array(positions);
        uvs = new Float32Array(positions.length * 2  / 3);
        var vertexBuffer = new pc.VertexBuffer(pc.app.graphicsDevice, vertexFormat, 16 * 16); //positions.length / 3); // why it's 16 i dunno
        
        function updateMesh(mesh, initAll) {
            mesh.setPositions(positions);
            mesh.setNormals(pc.calculateNormals(positions, indexArray));
            if (initAll) {
                mesh.setUvs(0, uvs);
                mesh.setIndices(indexArray);
            }
            mesh.update(pc.PRIMITIVE_TRIANGLES);
        }
        // Create a mesh w/inith dynamic vertex buffer and static index buffer
        const mesh = new pc.Mesh(pc.app.graphicsDevice);
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
        entity.setPosition(p);
        entity.addComponent("render", {
            meshInstances: [meshInstance],
        });

//        var material = new pc.Material();

        let mat = Shaders.GrassDirtByHeight();
        //Terrain.material = mat;

        // Assign the material to the mesh instance
        entity.render.meshInstances.forEach(function(meshInstance) {
            console.log("m:"+meshInstance);
            meshInstance.material = mat;
        });
        console.log('n');
        var node = new pc.GraphNode();
        var collisionMeshInstance = new pc.MeshInstance(node, mesh, physicsMaterial);
        var collisionModel = new pc.Model();
        collisionModel.graph = node;
        collisionModel.meshInstances.push(collisionMeshInstance);

        entity.addComponent('collision', {type:'mesh'});
        entity.collision.model = collisionModel;

        entity.addComponent('rigidbody', {
            friction: 0.5,
            type: 'static'
        });

        pc.app.root.addChild(entity);
        entity.rigidbody.teleport(new pc.Vec3(100,1,100))
        curvyFloor = entity;
        return [entity, positions];
    },

}


