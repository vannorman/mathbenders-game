Utils = {
    getCenterOfEntities(entities){
        let p = new pc.Vec3();
        entities.forEach(x=>{p.add(x.getPosition());});
        p.mulScalar(1/entities.length);
        return p;
    },
    isPointInsidePolyhedra(points, point) {
        function safeDot(a, b) {
            return Math.min(1, Math.max(-1, a.dot(b)));
        }

        function solidAngleSum(p, triangles) {
            let sum = 0;

            for (let tri of triangles) {
                const [a, b, c] = tri;

                const va = new pc.Vec3().sub2(a, p).normalize();
                const vb = new pc.Vec3().sub2(b, p).normalize();
                const vc = new pc.Vec3().sub2(c, p).normalize();

                const cross = new pc.Vec3().cross(vb, vc);
                const numerator = va.dot(cross);
                const denom = 1 + safeDot(va, vb) + safeDot(vb, vc) + safeDot(vc, va);
                const angle = 2 * Math.atan2(numerator, denom);

                sum += angle;
            }

            return sum;
        }

        function getBoxFrustumTriangles(points) {
            const [A, B, C, D, E, F, G, H] = points;
            return [
                [A, B, C], [A, C, D],
                [E, G, F], [E, H, G],
                [A, E, F], [A, F, B],
                [B, F, G], [B, G, C],
                [C, G, H], [C, H, D],
                [D, H, E], [D, E, A],
            ];
        }

        const triangles = getBoxFrustumTriangles(points);
        const sum = solidAngleSum(point, triangles);
        return Math.abs(Math.abs(sum) - 4 * Math.PI) < 1e-3;
    },

    isPointInBox(center,dx,dy,dz,half,point){
// https://stackoverflow.com/questions/52673935/check-if-3d-point-inside-a-box

        let d = new pc.Vec3().sub2(point,center);
        let inside = Math.abs(d.dot(dx)) <= half.x &&
                      Math.abs(d.dot(dy)) <= half.y &&
                      Math.abs(d.dot(dz)) <= half.z;
        return inside;
    },
    isPointInBox_old(corners, point) {
        // Assume corners is an array of 8 vec3 representing the box corners
        // and point is a vec3. Use any three non-coplanar corners to define the box.
        const [p0, p1, p2] = [corners[0], corners[1], corners[2]];

        // Create edge vectors
        const u = new pc.Vec3().sub2(p1, p0);
        const v = new pc.Vec3().sub2(p2, p0);
        const w = new pc.Vec3().sub2(corners[4], p0); // pick another non-coplanar corner

        // Vector from p0 to point
        const d = new pc.Vec3().sub2(point, p0);

        const dotUU = u.dot(u);
        const dotUV = u.dot(v);
        const dotUW = u.dot(w);
        const dotVV = v.dot(v);
        const dotVW = v.dot(w);
        const dotWW = w.dot(w);

        const dotDU = d.dot(u);
        const dotDV = d.dot(v);
        const dotDW = d.dot(w);

        // Solve for scalar projections (must be between 0 and 1 for point to be inside box)
        const uProj = dotDU / dotUU;
        const vProj = dotDV / dotVV;
        const wProj = dotDW / dotWW;

        return (
            uProj >= 0 && uProj <= 1 &&
            vProj >= 0 && vProj <= 1 &&
            wProj >= 0 && wProj <= 1
        );
    },

    addMeshCollider(clone,asset,rbType){
        let colEnt = clone.findComponent('render').entity; // assumes only one render per asset
        colEnt.addComponent('collision' ,{type:'mesh',renderAsset:asset.resource.renders[0]}); 
        colEnt.addComponent( 'rigidbody',{type:rbType});
        clone.addComponent('rigidbody',{type:rbType}); // won't add twice to same obj
        return colEnt.collision;
    },
    randomName(){
        // List of 20 math adjectives
        const mathAdjectives = [
            "Algebraic", "Geometric", "Fractional", "Decimal", "Integral", "Polynomial", "Radical", "Trigonometric",
            "Statistical", "Logarithmic", "Exponential", "Calculus", "Rational", "Theorem", "Matrix", "Prime", 
            "Vector", "Symmetric", "Differential", "Parametric"
        ];

        // List of 20 animals or nouns
        const animalsOrNouns = [
            "Lion", "Elephant", "Tiger", "Giraffe", "Zebra", "Kangaroo", "Penguin", "Panda", "Cheetah", "Koala", 
            "Whale", "Eagle", "Fox", "Wolf", "Monkey", "Bear", "Shark", "Falcon", "Hawk", "Turtle", "Otter"
        ];

        // Function to generate a random player name
        function generateRandomName() {
            const adjective = mathAdjectives[Math.floor(Math.random() * mathAdjectives.length)];
            const noun = animalsOrNouns[Math.floor(Math.random() * animalsOrNouns.length)];
            const number = Math.floor(Math.random() * 100);  // Random number between 0-99
            return adjective + noun + number;
        }

        return generateRandomName();

    },
    cleanJson(jsonString){
        if (!jsonString) return JSON.parse("{}")
        jsonString = jsonString.replaceAll("'",'"')
        jsonString = jsonString.replaceAll("True",'true')
        jsonString = jsonString.replaceAll("False",'false')
        let parsedJson = JSON.parse(jsonString);
        parsedJson = Utils.transformFractions(parsedJson);
        return parsedJson;

    },
    transformFractions(obj,depth=0) {
        if (depth>20) return null; //oopes
        if (Array.isArray(obj)) {
            // Recurse into arrays
            return obj.map(Utils.transformFractions);
        } else if (typeof obj === "object" && obj !== null) {
            // Check if this object has a key "Fraction" with an object value
            if ("Fraction" in obj && typeof obj.Fraction === "object") {
                return new Fraction(obj.Fraction.numerator, obj.Fraction.denominator);
            }

            // Recurse into all object properties
            let newObj = {};
            for (let key in obj) {
                newObj[key] = Utils.transformFractions(obj[key],++depth);
            }
            return newObj;
        }
        return obj; // Return as is for primitive types
    },
    newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    GetCircleOfPoints3d(options={}){
        const { degreesToComplete=360, radius=150, scale=5, autoCount = true, count=9} = options; 

        // calc count based on scale and radius
        // lower scale = higher point count
        // if (autoCount) Math.round((degreesToComplete * radius / scale / 60)); 

        const arcLength = degreesToComplete / count;
        const ret = new Array(count);
        for (let i=0;i<count;i++){
            const xPos = Math.sin(pc.math.DEG_TO_RAD * i * arcLength)*radius
            const yPos = Math.cos(pc.math.DEG_TO_RAD * i * arcLength)*radius;
            ret[i] = new pc.Vec3(xPos,0,yPos);
        }
        return ret;
    },


    GetCircleOfPoints(options={}){
        const { count=8, degreesToComplete=360, radius=150, scale=5 } = options; // lower scale = higher point count
        if (count){
            
        } else {
            count = Math.round((degreesToComplete * radius / scale / 60));

        }
        const arcLength = degreesToComplete / count;
        const ret = new Array(count);
        for (let i=0;i<count;i++){
            const xPos = Math.sin(pc.math.DEG_TO_RAD * i * arcLength)*radius
            const yPos = Math.cos(pc.math.DEG_TO_RAD * i * arcLength)*radius;
            ret[i] = new pc.Vec2(xPos,yPos);
        }
        return ret;
    },

   AddToNonCollidingGroup(rigidbody,group){
        var ALL_GROUPS = 0xFFFFFFFF;
        rigidbody.group = group;
        var NEW = ALL_GROUPS ^ group;
        rigidbody.mask = ALL_GROUPS ^ group;
   }, 
   truncateArray(arr){
        for(let i=0;i<arr.length;i++){
            if (Array.isArray(arr[i])){
                for(let j=0;j<arr[i].length;j++){
                    arr[i][j] = parseFloat(arr[i][j].toFixed(3));

                }
            } else {
                arr[i] = parseFloat(arr[i].toFixed(3));
            }
        }
    },
    LinesWithinPlane(options={}){
        const { 
            centroid = new pc.Vec3(0,0,0),
            planeSize = 100,
            numPoints = 50, 
            numLines = 3,
            minPointDist = 3,
            linesPerPointMin = 1, 
            linesPerPointMax = 4,
            yOffset = 0,
            height = 2.5,
            seed = 0.5,
        } = options;
        const points = []; // point vec2 : connectedLines array vec2} 

        // create #points with minDist
        const rand = GenerateRandomFromSeed(seed,numPoints);

        for(let i=0;i<numPoints; i++){
            let point = new pc.Vec3(centroid.x+rand()*planeSize,centroid.y+yOffset,centroid.z+rand()*planeSize);
            if (points.filter(x=>x.point.distance(point)<minPointDist).length==0){
                // no existing points were too close to this one
                points.push({point:point.trunc(),connected:[]});
            }
        }
        points.forEach(x=>{
            const sortedByNearest = Utils.SortVec3ArrayByDistFromPoint({point:x.point,arr:points.map(y=>y.point)});
            const numLines = Math.min(Math.floor(linesPerPointMin+rand()*linesPerPointMax),sortedByNearest.length);
            for(let i=0;i<numLines;i++){
                // don't make a new connection if it already exists in another element.
                const nearPoint = sortedByNearest[i];
                const nearPointConnected = points.filter(y=>y.point.equals(nearPoint)).map(y=>y.point);
                points.forEach(y=>{
                    const d = x.point.distance(nearPoint);
                    if (d < minPointDist) console.log("close:"+d);
                });
                const isConnected = x.point in points.filter(y=>y.point.equals(nearPoint))[0].connected;
                if (!isConnected){
                    x.connected.push(nearPoint.trunc());
                } else {
                    console.log("Con");
                }
            }
        });
        lines=[]; 
        Game.cubesParent = new pc.Entity();
        pc.app.root.addChild(Game.cubesParent);
        points.forEach(x=>{
            const d = Utils.Cube({color:pc.Color.YELLOW,position:x.point.clone().add(new pc.Vec3(0,5,0)) });
            Game.cubesParent.addChild(d);
            d.rigidbody.syncBodyToEntity();
            x.connected.forEach(y=>{
                const newLine = {start:new pc.Vec2(x.point.x,x.point.z),end:new pc.Vec2(y.x,y.z)}
                cross = false;
                lines.forEach(line=>{
                    if (Utils.DoLinesCross({line1:newLine,line2:line})){
  //                      console.log("cross;"+JSON.stringify(line)+","+JSON.stringify(newLine));
                        cross = true;
                    }else {
//                        console.log("no cross;"+JSON.stringify(line)+","+JSON.stringify(newLine));

                    }

                })
                if (!cross) {
                    c = Utils.DrawCubeLine({start:x.point,end:y});
                    Game.cubesParent.addChild(c);
                    c.translate(0,5,0)
                    c.setLocalScale(c.localScale.x,height,c.localScale.z);
                    lines.push({start:x.point,end:y});
                }
            });
        }); 
        return [points,lines];
    },
    DoLinesCross(options={}){
      const { line1, line2 } = options;

      const crossProduct = (vec1, vec2) => vec1.x * vec2.y - vec1.y * vec2.x;

      const line1Vector = new pc.Vec2(line1.end.x - line1.start.x, line1.end.y - line1.start.y);
      const line2Vector = new pc.Vec2(line2.end.x - line2.start.x, line2.end.y - line2.start.y);

      const startVector = new pc.Vec2(line2.start.x - line1.start.x, line2.start.y - line1.start.y);

      const determinant = crossProduct(line1Vector, line2Vector);

      if (determinant === 0) {
        // Lines are parallel, no intersection
        return false;
      }

      const t1 = crossProduct(startVector, line2Vector) / determinant;
      const t2 = crossProduct(startVector, line1Vector) / determinant;

      // Check if t1 and t2 are within [0, 1] for both lines
      return t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1;

    },
    SortVec3ArrayByDistFromPoint(options={}){
        const { point,arr } = options;
        return arr.sort((a,b) => (point.distance(a) - point.distance(b))).filter(x=>x!=point);
    },
    DrawCubeLine(options={}){
        const { start, end } = options;
        const mid = new pc.Vec3().add2(start,end).mulScalar(0.5);
        const angle = 90 - (Math.atan2(end.z-start.z,end.x-start.x)) * pc.math.RAD_TO_DEG;
        const cube = Utils.Cube({position:mid});
        cube.setLocalScale(0.2,0.2,start.distance(end));
        cube.setLocalEulerAngles(0,angle,0);
        return cube;
    },
    Cube(options={}){
        const { 
            color = pc.Color.WHITE, 
            position = pc.Vec3.ZERO, 
            rotation = pc.Vec3.ZERO,
            scale = pc.Vec3.ONE, 
            rigid = true, 
            rbType = pc.RIGIDBODY_TYPE_KINEMATIC,
            
        } = options;
        cube  = new pc.Entity("cube");
        cube.addComponent("render", {  type: "box" }); 
        cube.render.meshInstances[0].material = Materials.createMaterial(color);
        cube.setLocalScale(scale);
        pc.app.root.addChild(cube); 
        if (rigid){
            cube.addComponent("rigidbody", { type: "kinematic", restitution: 0.5, });
            cube.addComponent("collision", {
                type: "box",
                halfExtents: new pc.Vec3(scale.x/2, scale.y/2, scale.z/2),
            });
            cube.rigidbody.type = rbType;
        }
        cube.moveTo(position,rotation);
        return cube;
    },

    stripObjToGfxOnly(obj){
        obj.getComponentsInChildren('script').forEach(x=>{ // remove all scripts
            Object.keys(x._scriptsIndex).forEach(y => { x.destroy(y); })
        });
        if (obj.collision) obj.removeComponent('collision')
     
    },
    getRandomUnitVector() {
        // random.onUnitSphere
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        
        var x = Math.sin(phi) * Math.cos(theta);
        var y = Math.sin(phi) * Math.sin(theta);
        var z = Math.cos(phi);
        
        return new pc.Vec3(x, y, z);
    },
    get RandomColor() {
      const colors = [pc.Color.RED, pc.Color.BLUE, pc.Color.GREEN, pc.Color.YELLOW, pc.Color.PURPLE];
      const randomIndex = Math.floor(Math.random() * colors.length);
      return colors[randomIndex];
    },

    AddTextFloater(options={}){ // HoverText
        const floater = new pc.Entity();
        pc.app.root.addChild(floater);
        const parentObj = options.parent;
        pc.app.on('update', function(){ floater.moveTo(parentObj.getPosition().clone().add(options.floaterOffset)); });
        parentObj.on('destroy',function(){ floater.destroy();},this);
        parentObj.on("state", function (enabled) { 
            floater.enabled = enabled ;
        });
        const debugText = Utils.AddText({
            color:options.color,
            text:options.text,
            parent:floater,
            localPos:options.textOffset,
            scale:options.scale});
        floater.addComponent('script');
        const useRadius = options.useRadius == undefined ? false : options.useRadius;
        floater.script.create('alwaysFaceCamera',{attributes:{useRadius:useRadius,reverse:true}});
        return debugText;

    },
    SetupFadeToBlack(){

        // Fade scene to black ; used when traversing portals,
        const black = new pc.Entity();
        black.addComponent('element', {
            type: 'image',
            layers:[pc.LAYERID_UI],
            color: pc.Color.BLACK,
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0.5],
            width: pc.app.graphicsDevice.canvas.clientWidth,
            height: pc.app.graphicsDevice.canvas.clientHeight,
            opacity: 0,
            screenSpace: true,
            useInput: false // we do not want the cursor image to intercept mouse events
        });
        const screen = new pc.Entity();
        screen.addComponent("screen", {
            referenceResolution: new pc.Vec2(pc.app.graphicsDevice.canvas.clientWidth, pc.app.graphicsDevice.canvas.clientHeight),
            scaleBlend: 0.5,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true,
        });
        black.addComponent('script');
        black.script.create('screenFadeBlack');
        pc.app.root.addChild(screen);
        screen.addChild(black); 
        Game.black = black;


    },
    
    AddText(options){
        const { 
            rotation = pc.Vec3.ZERO, 
            color = pc.Color.YELLOW, 
            text = "text", 
            parent = null, 
            localPos = pc.Vec3.ZERO, 
            scale = 1 
        } = options;
        let entity = new pc.Entity("DebugText");
        if (parent) parent.addChild(entity);
        else pc.app.root.addChild(entity);
        entity.setLocalPosition(localPos);
        entity.setLocalEulerAngles(rotation);
        entity.setLocalScale(new pc.Vec3(1,1,1).mulScalar(scale));
        entity.addComponent('element', {
            type: 'text',
            layers:[pc.LAYERID_WORLD],
            text: text,
            color: color,
            // Align text to the center of the entity
            anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
            pivot: new pc.Vec2(0.5, 0.5),
            fontSize: 6,
            fontAsset: assets.fonts.montserrat,
        });
        return entity; 
    }, 
    getDistToGround(entity){
        const p = entity.getPosition();
        const result = pc.app.systems.rigidbody.raycastFirst(p, p.clone().add(new pc.Vec3(0,-1000,0)));
        if (result) {
              const hitDistance = pc.Vec3.distance(result.point,p);
              return hitDistance;
        } else {
            console.log("Fail to hit anything! :"+entity.name+", pos:"+entity.getPosition().trunc());
            Utils3.debugSphere({position:entity.getPosition()});
            return -1;
        }
    },
    getGroundPosFromPos(pos){
        const result = pc.app.systems.rigidbody.raycastFirst(pos.clone().add(new pc.Vec3(0,400,0)), pos.clone().add(new pc.Vec3(0,-1000,0)));
        if (result) {
            return result.point;
        } else {
            return pos;
        }
         
    },
    adjustMeshToGround(options) {
        // performanceHelp
        const {entity} = options;
        // offset is for the CastleWall prefabN

        // Before anything, lower mesh as close to ground as it can get before bending.
        const p = entity.getPosition();
        const buffer = 2;
        const mesh = entity.render.meshInstances[0].mesh;
        // mesh.vertexBuffer.lock(); // Get the vertex positions from the mesh data
        const vertices = [];
        mesh.getPositions(vertices);
        const vertexCount = vertices.length / 3;

        let positions = []; // easily keep track of each vec3 by an index
        for (let i = 0; i < vertexCount; i++) {
            const x = vertices[i * 3];
            const y = vertices[i * 3 + 1];
            const z = vertices[i * 3 + 2];
            positions[i] = [x,y,z]; 
        }

        // each Catalog will define a unique vert/point in the mesh, and keep track of the twins by way of index
        class Catalog {
            twins=[]; // the index of the twin inside positions;
            position;
            index;
            constructor(args={}){
                const { index, position, } = args;
                this.index=index;
                this.position=position;
            }
        }

        let catalogs = [];
        // Look at all verts and each unique vert, along with its twins, into the catalog
        for (let i = 0; i < vertexCount; i++) {
            const x = vertices[i * 3];
            const y = vertices[i * 3 + 1];
            const z = vertices[i * 3 + 2];
            

            // Here we have a v3 xyz and what we want to know is, have we seen this vector3 before?
            // If not catalog it.
            let saved = catalogs.filter(c =>{
                let p = c.position;
                return p[0] == x && p[1] == y && p[2] == z;
            });
            if (saved.length == 1){
                // We saw this position before; add it to the twins.
                saved[0].twins.push(i);
            } else {
                // New position, save it.
                let c = new Catalog({index:i,position:[x,y,z]})
                catalogs.push(c);
            }
        }

        // For each saved catalog, raycast down to get the new y position for that unique point
                       
         // We manually checked which vertexes should be paired, 
        // So tht when moving them down to the terrain,
        // The mesh looks better if these pairs are of the same ending height
        // each pair refers to two indexes of vert inside the "positions" variable
        const pairs = [[3,109],[2,108],[288,156],[106,159],
                        [8,120],[11,126],[44,161],[41,164],
                        [17,129],[20,135],[54,171],[51,174],
                        [25,138],[28,144],[49,166],[46,169],
                        [34,147],[37,153]];

/*        pairs.forEach(pair=>{
            let cat1 = catalogs.filter(c => {return c.index == pair[0]})[0];
            let cat2 = catalogs.filter(c => {return c.index == pair[1]})[0];
            let maxY = Math.max(cat1.position[1],cat2.position[1]);
            cat1.position[1] = cat2.position[1] = maxY;
            // Now, push these new "y" values to the saved "positions" array
            positions[pair[0]][1] = maxY;
            positions[pair[1]][1] = maxY;

            // Finally push the new "y" values to all the twins as well
            cat1.twins.forEach(index=>{
                positions[index][1] = maxY;
            });
            cat2.twins.forEach(index=>{
                positions[index][1] = maxY;
            });

        });
*/
        // Now that we have a modified "positions" array where each y value has been lowered and twins have been matched,
        // flatten that array so we can inflate the mesh with it

        // Finally, modify the original (and flat)  array of vertices with the new y values

        let lastHitDist = -20;
        for (let i = 0; i < vertexCount; i++) {
            const x = vertices[i * 3];
            const y = vertices[i * 3 + 1];
            const z = vertices[i * 3 + 2];

            const heightDelta = 25;
            const startPos = entity.localToWorldPos(new pc.Vec3(x, heightDelta, z))
            const endPos = startPos.clone().add(pc.Vec3.DOWN.clone().mulScalar(100));
            
            const results = pc.app.systems.rigidbody.raycastAll(startPos, endPos);
            try { 
                const result = results.filter(x=>{return x.entity.tags._list.includes(Constants.Tags.Terrain);})[0]
                const hitDistance = pc.Vec3.distance(result.point,startPos) - heightDelta;
                // let localHeight = y - minLocalPosition;
                let droppedPos = startPos.clone().add(new pc.Vec3(0,-hitDistance,0));
                
                let localDroppedPos = entity.worldToLocalPos(droppedPos);
                let offset = 1; // helps it meet the terrain exactly

                if (y < 1.0) { //1.0 happens to be the lower threshold for the bottom of the wall 
                                //( local model maybe has a pivot below the model by 1 unit?)
                    offset = 3; // for the bottom of the mesh, stretch it down towards the terrain more
                }
                vertices[i * 3 + 1] -= hitDistance + offset;

                lastHitDist = hitDistance; // only in case the next raycast busts and doesn't land. It happens a lot 
            } catch {
                vertices[i * 3 + 1] -= lastHitDist + offset;
            }
        
           
        }
        pairs.forEach(pair=>{
            let a = pair[0];
            let b = pair[1];
//            console.log("Checking :"+a+","+b);
//            console.log(vertices[a*3+1]+","+vertices[b*3+1]);
            const max = Math.max(vertices[a*3+1],vertices[b*3+1]);
            vertices[a * 3 + 1] = vertices[b * 3 + 1] = max;
            catalogs.filter(c=>{return c.index==a})[0].twins.forEach(t=>{vertices[t*3+1]=max});
            catalogs.filter(c=>{return c.index==b})[0].twins.forEach(t=>{vertices[t*3+1]=max});
        })

        // mesh.vertexBuffer.unlock();
//        mesh.setPositions(vertices);
//        mesh.update(pc.PRIMITIVE_TRIANGLES);
        return vertices;
    },

    DestroyObjectsWithTagByRadius(options){
        const {tag="none",radius=20,origin=pc.Vec3.ZERO} = options;
        pc.app.root.getComponentsInChildren('tagged').forEach(x=>{
            if (x.tags.includes(tag) && pc.Vec3.distance(x.entity.getPosition(),origin) < radius){
                x.entity.destroy();
            }
        });
    },
    SelectNFromArray (options) {
        const { arr, count } = options;
        const interval = Math.floor(arr.length / count);
        const newArray = [];

        for (let i = 0; i < arr.length; i++) {
            if (i % interval == 0) {
                newArray.push(arr[i]);
            }
          }

        return newArray;
    },
    SelectRandomFromArray(options){
        const { arr, count } = options;
          const selectedElements = [];
          const arrCopy = arr.slice();

          while (selectedElements.length < count && arrCopy.length > 0) {
            const randomIndex = Math.floor(Math.random() * arrCopy.length);
            const selectedElement = arrCopy.splice(randomIndex, 1)[0];
            selectedElements.push(selectedElement);
          }

          return selectedElements;
    },






}
 

function stackTrace(){
    var err = new Error();
    return err.stack; 
}

function Cube(options={}){
    const {position=pc.Vec3.ZERO,scale=pc.Vec3.ONE,rigid=true,rbType=pc.RIGIDBODY_TYPE_KINEMATIC} = options;
    
    cube  = new pc.Entity("cube");
    cube.addComponent("render", {  type: "box" }); 
    cube.render.meshInstances[0].material = Materials.createMaterial(pc.Color.WHITE);
    cube.setLocalScale(scale);
    pc.app.root.addChild(cube); 
    if (rigid){
        cube.addComponent("rigidbody", { type: "kinematic", restitution: 0.5, });
        cube.addComponent("collision", {
            type: "box",
            halfExtents: new pc.Vec3(scale.x/2, scale.y/2, scale.z/2),
        });
        cube.rigidbody.type = rbType;
    }
    cube.moveTo(position);
    return cube;
}

function NetworkNumberCube(p){
    return;
    const cube = myTemplates['NumberCube'].clone();
    pc.app.root.addChild(cube);
    cube.rigidbody.teleport(p);
    setTimeout(function(){cube.enabled = true},1); // unforunately it flickers at position zero for some fking reason
    return cube;
}


//function NumberCube(p,s){
////    console.log("OLD");
//    let cube = Cube(p,s,true,'dynamic');
//    
//    cube.addComponent('script');
//    cube.script.create('numberInfo',{});
//    cube.script.create('pickUpItem');
//    cube.script.pickUpItem.icon = assets.textures.numberCube1;
//    cube.script.create('recordPosition');
//    return cube;
    
//}

function ToonCube(p,s,rigid=true){
    let cube = Cube(p,s,rigid);
    // Load the vertex shader

    fetch('/static/assets/shaders/toon.vert')
    .then(response => response.text())
    .then(vertexShader => {

        // Fetch the fragment shader
        fetch('/static/assets/shaders/toon.frag')
        .then(response => response.text())
        .then(fragmentShader => {

            // Create shader definition
            var shaderDefinition = {
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aNormal: pc.SEMANTIC_NORMAL,
                },
                vshader: vertexShader,
                fshader: fragmentShader
            };

            // Create shader
            var shader = new pc.Shader(pc.app.graphicsDevice, shaderDefinition);

            // Apply shader to material
            var material = new pc.StandardMaterial();
            material.shader = shader;

            // Apply material to mesh instance
            cube.render.material = material;
//            var meshInstance = cube.model.model.meshInstances[0]; // replace 'entity' with your model's entity
 //           meshInstance.material = material;
        });
    });

}

curvyFloor = null;

sword2=null

function Light(){
// Create a new Entity
    var light = new pc.Entity();

    // Add a Light Component to the entity
    light.addComponent("light", {
        type: "point",
        color: new pc.Color(1, 1, 1),
        intensity: 1,
        range: 2000
    });

    // Add the new entity to the root of the scene's graph
    pc.app.root.addChild(light);

    // Move the light to a suitable
        // Utils3.debugSphere(from,0.2);
      light.setLocalPosition(0, 250, 0);
      // Utils3.debugSphere(to,0.1);

}


var Utils3 = {
    checkIfEntityHasAllProperties(ent,props){
        // checks if ent has at laest one inst of each prop, if not return false
        return props.map(x => ent.getComponent(x)).filter(x => x.length == 0).length == 0;
    },
    get sixDirs() {
        const north = new pc.Vec3(0, 0, -1);
        const south = new pc.Vec3(0, 0, 1);
        const east = new pc.Vec3(1, 0, 0);
        const west = new pc.Vec3(-1, 0, 0);
        const up = new pc.Vec3(0, 1, 0);
        const down = new pc.Vec3(0, -1, 0);

        return [north, south, east, west, up, down];
    },

//     GetFraction : function(entity){
//         if (entity && entity.script && entity.script.numberInfo){
//             return entity.script.numberInfo.getFraction(entity.script.numberInfo);    
//         } 
        
//     },
    TruncVec3 : function(v){
        r = new pc.Vec3(v.x.toFixed(2),v.y.toFixed(2),v.z.toFixed(2));
        return r;

    },
    GetAllPropertiesFrom : function(entity){
        // huh? Wtf this used for
        var properties = {};
        if (entity === null || entity === undefined || entity.script === null) {
          // console.log('tried get all prop from:'+entity+', early out.');
            return {};
        } 
        for(var s in entity.script){
            if (typeof entity.script[s].getObjectProperties === 'function'){
                // get all properties possible and append them, this may cause overwrites
                properties = Object.assign(properties,entity.script[s].getObjectProperties());
            }
        }
        return properties;
    },
    fixRotation : function(rot){
        // sometimes rotations are close to zero and have "e" in them, so when sharing a number with "e" to the server it loses context and thinks its a string
        if (Math.abs(rot.x) < 0.05) rot.x = 0;
        if (Math.abs(rot.y) < 0.05) rot.y = 0;
        if (Math.abs(rot.z) < 0.05) rot.z = 0;
        return new pc.Vec3(rot.x,rot.y,rot.z);
        
    },
    flattenVec3 : function(v){
        return new pc.Vec3(v.x,0,v.z);
    },
    sphere2 : function(color,pos,scale) {
        const material = new pc.StandardMaterial();
        material.diffuse = color;
        material.specular = color;
        material.metalness = 0.0;
        material.gloss = 0.5;
        material.useMetalness = true;
        material.blendType = pc.BLEND_NORMAL;
        material.opacity = 0.5;
        material.opacityFadesSpecular = true;
        material.alphaWrite = false;

        material.update();

        const sphere = new pc.Entity();

        sphere.addComponent("render", {
            material: material,
            type: "sphere",
        });
        pc.app.root.addChild(sphere);
        sphere.setPosition(pos);
        sphere.setLocalScale(scale,scale,scale);
        return sphere;
    },
    debugForce : function(args={}){
        const {entity,force,autoDestruct=true,timeout=0.05}=args;
        const a = entity.getPosition().clone();
        const b = a.clone().add(force);
        const mid = new pc.Vec3().add2(a,b).mulScalar(0.5);
        Utils3.debugSphere({position:b,scale:0.1,timeout:timeout})
        const cube = new pc.Entity();
        cube.addComponent('render',{type:'box'});
        cube.setLocalScale(new pc.Vec3(0.05,0.05,force.length()));
        cube.moveTo(mid);
        cube.render.material = Materials.red;
        pc.app.root.addChild(cube);
        cube.setRotation(Quaternion.LookRotation(force));
        if (autoDestruct) setTimeout(function(){cube.remove()},timeout);    
        return cube;

    },
    debugSphere : function(options){
        const { position,scale=1.0,color=pc.Color.RED,timeout=4000,autoDestruct=true} = options;
         var entity = new pc.Entity();
        if (autoDestruct) setTimeout(function(){entity.remove()},timeout);    
        // Add a new Model Component and add it to the Entity.
        //entity.addComponent("model", { type: 'sphere' });
        entity.addComponent("render", { type: 'sphere' });
        
        // Create a new Standard material
        var material = new pc.StandardMaterial();

        // Update the material's diffuse and specular properties
        material.diffuse.set(color.r,color.g,color.b);
        material.specular.set(0,0,0);
        material.opacity = color.a; // Set the transparency to 0.5 (50% transparent)
        material.blendType = pc.BLEND_NORMAL; // Set the blending mode to normal blending

        // Notify the material that it has been modified
        material.update();
        // set material
        pc.app.root.addChild(entity);
        entity.render.material = material;

        entity.setPosition(position);
        entity.enabled = true;
        entity.setLocalScale(scale,scale,scale);

        // Add to the Hierarchy

        // Store in a list for some random duration before deleting
        // this.entities.push({
        //     entity: entity,
        //     timer: pc.math.random(0, this.lifetime)
        // });
        return entity;
    }
};

// Unity love
function FindObjectsOfTypeAll(scriptName){
    return pc.app.root.findByName("Root").find(
        function(node){ 
            return  node.script && node.script[scriptName];
        }
    );
}

/* function GetComponentsInChildren(sourceEntity, componentName){
    var components = [];
    var nodes = sourceEntity.find(
        function(node){ 
            return node[componentName];
        }
    );
    for(var i=0;i<nodes.length; i++){
        var  n = nodes[i];
        components.push(n[componentName]);
    }
    return components;
} */

function GetScriptsInChildren(sourceEntity, scriptName){
    var scripts = [];
    var nodes = sourceEntity.find(
        function(node){ 
            return node.script && node.script[scriptName];
        }
    );
    for(var i=0;i<nodes.length; i++){
        var  n = nodes[i];
        scripts.push(n.script[scriptName]);
    }
    return scripts;
}

function getAllProperties(obj){
    var curr = null;
    // because some properties, e.g. those added with attributes.add, are not enumerable.
    var allProps = []
      , curr = obj;
    do{
        var props = Object.getOwnPropertyNames(curr);
        props.forEach(function(prop){
            if (allProps.indexOf(prop) === -1);
                allProps.push(prop);
        });
    }
    while(curr = Object.getPrototypeOf(curr));
    return allProps;
}

var Vector3 = {
    Angle : function(vecA,vecB){
        vecA = vecA.normalize();
        vecB = vecB.normalize();
        var dot = vecA.dot(vecB);
        var angleInRadians = Math.acos(dot);
        var angle = angleInRadians * pc.math.RAD_TO_DEG;
        return angle;
    }, 
    JsonSchema : [{
        name: 'x',
        type: 'number',
        default: 1
    }, {
        name: 'y',
        type: 'number',
        default: 1
    }, {
        name: 'z',
        type: 'number',
        default: 1
    }]
};

const kEpsilon = 0.000001;

        // Is the dot product of two quaternions within tolerance for them to be considered equal?
function IsEqualUsingDot(dot)
{
    // Returns false in the presence of NaN values.
    return dot > 1.0 - kEpsilon;
}

var Quaternion = {
    LookRotation : function(dir){
        // given a vector3 return a quaternion rotation 
        var m = new pc.Mat4();
        var r = new pc.Quat();
        
        // Make the hit entity point in the direction of the hit normal
        this.setMat4Forward(m, dir, pc.Vec3.UP);
        r.setFromMat4(m);
        return r;
    
    },
    FromToRotation(fromVector, toVector)
    {
        fromVector.normalize();
        toVector.normalize();

        let dot = new pc.Vec3().dot(fromVector, toVector);
        let angle = Math.acos(dot) * pc.math.RAD_TO_DEG;
        let axis = new pc.Vec3().cross(fromVector, toVector).normalize();

        return Quaternion.AngleAxis(angle, axis);
    },
    AngleAxis(angle, axis) // float, vec3
    {
        let halfAngle = angle * 0.5;
        let sinHalfAngle = Math.sin(halfAngle * Mathf.Deg2Rad);

        let rotation = new pc.Quat();
        rotation.x = axis.x * sinHalfAngle;
        rotation.y = axis.y * sinHalfAngle;
        rotation.z = axis.z * sinHalfAngle;
        rotation.w = Math.cos(halfAngle * pc.math.DEG_TO_RAD);

        return rotation;
    },
    setMat4Forward : function (mat4, forward, up) {
        var x, y, z;

        x = new pc.Vec3();
        y = new pc.Vec3();
        z = new pc.Vec3();

        
        
        // Inverse the forward direction as +z is pointing backwards due to the coordinate system
        z.copy(forward).mulScalar(-1);
        y.copy(up).normalize();
        x = x.cross(y, z).normalize();
        y = y.cross(z, x);

        var r = mat4.data;

        r[0]  = x.x;
        r[1]  = x.y;
        r[2]  = x.z;
        r[3]  = 0;
        r[4]  = y.x;
        r[5]  = y.y;
        r[6]  = y.z;
        r[7]  = 0;
        r[8]  = z.x;
        r[9]  = z.y;
        r[10] = z.z;
        r[11] = 0;
        r[15] = 1;

        return mat4;
        
    },
    Angle : function(a,b) {
        let vec_a = new pc.Vec4(a.x,a.y,a.z,a.w);
        let vec_b = new pc.Vec4(b.x,b.y,b.z,b.w);
        let dot = vec_a.dot(b); // Dot(a, b);
        return IsEqualUsingDot(dot) ? 0.0 : Math.acos(Math.min(Math.abs(dot), 1.0)) * 2.0 * Mathf.Rad2Deg;
    }, 
   
   
};


function GenerateRandomFromSeed (seed) {
    let state = seed;

    return function() {
        // LCG parameters (these values are typical)
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);

        // Update the state using the LCG algorithm
        state = (a * state + c) % m;

        // Normalize the value to the range [0, 1)
        return state / m;
    };
}

function RandomArrayFromSeed(seed, N) {
    const randomGenerator = GenerateRandomFromSeed(seed);

    // Initialize the array
    const randomNumbers = [];

    // Generate N deterministic random numbers
    for (let i = 0; i < N; i++) {
        randomNumbers.push(randomGenerator());
    }

    return randomNumbers;
}


// let's directly mess with Math!
var Mathf = {
    Lerp : function  (start, end, amt){
        // console.log('lerp start:'+start+', end:'+end+', amt:'+amt);
        var result = (1-amt)*start+amt*end;
        // console.log('result:'+result);
        return result;
    },
    Clamp : function(min,max,val){
        return Math.max( min, Math.min(val, max) );
    },
    Rad2Deg : 57.29578,

};



function normalizeArray(arr) {
    // Find the maximum and minimum values in the array
    var minVal = Math.min(...arr);
    var maxVal = Math.max(...arr);

    // Normalize each element in the array
    for (var i = 0; i < arr.length; i++) {
        arr[i] = (arr[i] - minVal) / (maxVal - minVal);
    }
}


function getValueAtFractionalIndex(arr, index) {
    let wholeIndex = Math.floor(index);
    let fraction = index - wholeIndex;

    if (wholeIndex >= arr.length - 1) {
        return arr[arr.length - 1];
    }

    return arr[wholeIndex] * (1 - fraction) + arr[wholeIndex + 1] * fraction;
}

function toSquare2DArray(arr) {
    console.log('2d');
    let size = Math.sqrt(arr.length);
    if (size % 1 !== 0) {
        throw new Error("Array length must be a perfect square.");
    }
    let newArr = new Array(size);
    for (let i = 0; i < size; i++) {
        newArr[i] = arr.slice(i*size, (i+1)*size);
    }
    return newArr;
}

function unFlattenVec3Arr(positions){
    // Output array of pc.Vec3 objects
    let vec3Array = [];
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      const vec3 = new pc.Vec3(x, y, z);
      vec3Array.push(vec3);
    }
    return vec3Array;
}

function getValueAtFractionalIndex2D(arr, xIndex, yIndex) {
    let xWholeIndex = Math.floor(xIndex);
    let xFraction = xIndex - xWholeIndex;

    let yWholeIndex = Math.floor(yIndex);
    let yFraction = yIndex - yWholeIndex;

    if (xWholeIndex >= arr.length - 1 || yWholeIndex >= arr.length - 1) {
        return arr[arr.length - 1][arr.length - 1];
    }

    let y0 = arr[xWholeIndex][yWholeIndex] * (1 - xFraction) + arr[xWholeIndex + 1][yWholeIndex] * xFraction;
    let y1 = arr[xWholeIndex][yWholeIndex + 1] * (1 - xFraction) + arr[xWholeIndex + 1][yWholeIndex + 1] * xFraction;

    return y0 * (1 - yFraction) + y1 * yFraction;
}

function getHeightByFractionalIndexFrom2DVec3Arr(arr, xIndex, yIndex) {
    let xWholeIndex = Math.floor(xIndex);
    let xFraction = xIndex - xWholeIndex;

    let yWholeIndex = Math.floor(yIndex);
    let yFraction = yIndex - yWholeIndex;

    if (xWholeIndex >= arr.length - 1 || yWholeIndex >= arr.length - 1) {
        return arr[arr.length - 1][arr.length - 1];
    }

    let y0 = arr[xWholeIndex][yWholeIndex].y * (1 - xFraction) + arr[xWholeIndex + 1][yWholeIndex].y * xFraction;
    let y1 = arr[xWholeIndex][yWholeIndex + 1].y * (1 - xFraction) + arr[xWholeIndex + 1][yWholeIndex + 1].y * xFraction;

    return y0 * (1 - yFraction) + y1 * yFraction;
}

function reshape(verts) {
    // [0,1,2,6,7,8] => [[0,1,2],[6,7,8]]
    let result = [];
    for(let i = 0; i < verts.length; i += 3) {
        result.push([verts[i], verts[i + 1], verts[i + 2]]);
    }
    return result;
}

function findExtents(verts) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for(let i = 0; i < verts.length; i++) {
        let x = verts[i][0], y = verts[i][1], z = verts[i][2];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
    }

    return [
        new pc.Vec3(minX, minY, minZ), // Lower-left-front corner
        new pc.Vec3(maxX, maxY, maxZ), // Upper-right-back corner
    ];
}

function getRandomVec3WithinExtents(extents) {
    let min = extents[0];
    let max = extents[1];

    let randomX = Math.random() * (max.x - min.x) + min.x;
    let randomY = Math.random() * (max.y - min.y) + min.y;
    let randomZ = Math.random() * (max.z - min.z) + min.z;

    return new pc.Vec3(randomX, randomY, randomZ);
}

function arrayRotate(arr, amt) {
    if (amt < 0){
        amt = -amt;
        for (let i=0;i<amt;i++){
            arr.unshift(arr.pop());
        }
    } else {
        for (let i=0;i<amt;i++){
            arr.push(arr.shift());
        }
    }
  return arr;
}

function transpose2DArray(array) {
  const numRows = array.length;
  const numCols = array[0].length;

  // Create a new 2D array with transposed dimensions
  const transposedArray = new Array(numCols).fill(null).map(() => new Array(numRows));

  // Fill the transposed array with the elements from the original array
  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numRows; j++) {
      transposedArray[i][j] = array[j][i];
    }
  }

  return transposedArray;
}


function slideArray(arr,amt){
    if (amt < 0){
        amt = -amt;
        for (let i=0;i<amt;i++){
            arr.shift();
            arr.push(0);
        }
    } else {
        for (let i=0;i<amt;i++){
            arr.pop();
            arr.unshift(0);
        }

    }
        // shift removes one from left
        // push adds one from right
        // pop removes one from right

    return arr;
}



function Hoop(p=pc.Vec3.ZERO){
    return;
    
    const clone = myTemplates['hoop'].clone();
    clone.enabled = true;
    pc.app.root.addChild(clone);
    clone.rigidbody.teleport(p, new pc.Vec3(0,90,90));
    return clone;

}

function ApplyTextureAssetToMeshInstance(options){
    const {meshInstance, textureAsset, opacity} = options;
    const material = new pc.StandardMaterial();

    material.diffuseMap = textureAsset.resource;
    // These two lines will cause the depth shader to fail.
    if (opacity) {
        material.opacityMap = textureAsset.resource; // Set opacity map to the same texture
        material.blendType = pc.BLEND_NORMAL; //pc.BLEND_ADDITIVE_ALPHA;// BLEND_NORMAL; // Set blend type to enable transparency
    }

    meshInstance.material = material; 
    material.update();
    return material;
}

function ApplyTextureAssetToEntity(options){
// entity,textureAsset){
    const { textureAsset, entity, blend_mode = pc.BLEND_NORMAL, scaleTexture = false, scaleFactor = 10} = options;
//    console.log("apptext:"+entity.name+", j:");
    var material = null;
    
    entity.getComponentsInChildren('render').forEach((render, x) => {
        render. meshInstances.forEach((meshInstance, y) => { 
            material = ApplyTextureAssetToMeshInstance({meshInstance:meshInstance,textureAsset:textureAsset});
            material.name = "applied_"+meshInstance.name;
            if (scaleTexture){
                const s  = entity.getLocalScale();
                material.diffuseMapTiling.set(s.x/scaleFactor,s.z/scaleFactor);
            }
            /*
            material = new pc.StandardMaterial();
            // Sometimes it doesn't set material blendtype to the proper one for each meshinstance. So now let's just make a NEW material for each meshinstance??
            console.log("render :"+x+", mesh:"+y+" for "+entity.name);

            material.diffuseMap = textureAsset.resource;
            material.opacityMap = textureAsset.resource; // Set opacity map to the same texture
            material.blendType = blend_mode; //pc.BLEND_ADDITIVE_ALPHA;// BLEND_NORMAL; // Set blend type to enable transparency

            meshInstance.material = material; 
            material.update();*/
        })

    });
    return material;
}

function ApplyTextureFromFileSource(entity,source){
    return new Promise(function(resolve) {
        // Create new texture asset
        var textureAsset = new pc.Asset("MyTexture", "texture", { url: source });
        pc.app.assets.add(textureAsset);
        pc.app.assets.load(textureAsset);
        textureAsset.ready(function () {
            var material = new pc.StandardMaterial();
            material.diffuseMap = textureAsset.resource;
            material.opacityMap = textureAsset.resource; // Set opacity map to the same texture
            material.blendType = pc.BLEND_NORMAL; // Set blend type to enable transparency
        
            material.update();
            entity.render.meshInstances.forEach(function(meshInstance) { meshInstance.material = material; });
            resolve('Texture loaded!');
        });
        textureAsset.on('error', function (err) {   console.error("Texture load failed:"+err);});
      });
}

function Room(){
 // Floor
 // Floor
    var floorPosition = new pc.Vec3(0, 0, 0);
    var floorScale = new pc.Vec3(10, 0.1, 10);
    Cube(floorPosition, floorScale);

    // Walls
    var wall1Position = new pc.Vec3(-5, 2.5, 0);
    var wall1Scale = new pc.Vec3(0.1, 5, 10);
    Cube(wall1Position, wall1Scale);

    var wall2Position = new pc.Vec3(5, 2.5, 0);
    var wall2Scale = new pc.Vec3(0.1, 5, 10);
    Cube(wall2Position, wall2Scale);

    var wall3Position = new pc.Vec3(0, 2.5, -5);
    var wall3Scale = new pc.Vec3(10, 5, 0.1);
    Cube(wall3Position, wall3Scale);



}

class MeshUtil {
    constructor(){}
    GetVertsFromEntityMesh(args){
        const { entity } = args;
        let mesh = entity.render.meshInstances[0].mesh;
        let numVerts = mesh.vertexBuffer.numVertices
        let positions = new Float32Array(numVerts * 3); 
        mesh.getPositions(positions);
        var worldPositions = [];
        for (var i = 0; i < positions.length; i += 3) {
            var localPosition = new pc.Vec3(positions[i], positions[i + 1], positions[i + 2]);
            var worldPosition = entity.localToWorldPos(localPosition);
            worldPositions.push(worldPosition);
        }
        return worldPositions;
    }
    Triangle3(p){
        return Triangle2(p.x,p.y,p.z);
    }
    Triangle2(a,b,c){
        let app = pc.app;
        const positions = new Float32Array([a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z]);
        const uvs = new Float32Array([0,0,0,1,1,1]);

        var vertexFormat = new pc.VertexFormat(pc.app.graphicsDevice, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 },
            { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_UINT8, normalize: true }
        ]);

        var vertexBuffer = new pc.VertexBuffer(pc.app.graphicsDevice, vertexFormat, 16*16);
        let index = 0;

        // Interleave position and color data
        // Generate array of indices to form triangle list - two triangles per grid square
        const indexArray = [0,1,2];

        // helper function to update required vertex / index streams
        function updateMesh(mesh, initAll) {
            mesh.setPositions(positions);
            mesh.setNormals(pc.calculateNormals(positions, indexArray));
            if (initAll) {
                mesh.setUvs(0, uvs);
                mesh.setIndices(indexArray);
            }
            mesh.update(pc.PRIMITIVE_TRIANGLES);
        }
        const mesh = new pc.Mesh(app.graphicsDevice);
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
        const entity = new pc.Entity("Triangle");
        entity.addComponent("render", {
            meshInstances: [meshInstance],
        });

        // Assign the material to the mesh instance
        entity.render.meshInstances.forEach(function(meshInstance) {
            meshInstance.material = red;
        });

        /*var node = new pc.GraphNode();
        var collisionMeshInstance = new pc.MeshInstance(node, mesh, physicsMaterial);
        var collisionModel = new pc.Model();
        collisionModel.graph = node;
        collisionModel.meshInstances.push(collisionMeshInstance);

        entity.addComponent('collision', {type:'mesh'});
        entity.collision.model = collisionModel;

        entity.addComponent('rigidbody', {
            friction: 0.5,
            type: 'static'
        });*/

        app.root.addChild(entity);
        //entity.rigidbody.teleport(new pc.Vec3(100,1,100))
        return entity;
    }
}
window.meshUtil = new MeshUtil();
function Clouds(pos=Game.player.getPosition(),count=10,size=10,scale=2){
    let cloudGroup =  new pc.Entity("cloudGroup");
    pc.app.root.addChild(cloudGroup);
//    cloudGroup.setPosition(pos.clone().add(new pc.Vec3(size,scale-1,size).mulScalar(scale/2))); // center-ish
    console.log("Cloudgroup??"+pc.app.root.findByName("cloudGroup")); 
   for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let s = new pc.Vec3(1, 1, 1).mulScalar(Math.random() + scale);
            let y = Math.random()/3 + 1;
            let p = pos.clone().add(new pc.Vec3(i,y,j).mulScalar(scale));
        //    console.log("pos: "+pos.trunc()+", y:"+y+", i:"+i+", scale;"+scale);
            let cld = Utils.Cube({position:p,scale:s});
            cld.render.enabled = false;
              cld.reparent(cloudGroup);
            cld.setPosition(p);
        }
    }
   
   let cloudCollider = new pc.Entity("CloudCollider");
    cloudCollider.addComponent('collision',{type:'box',halfExtents: new pc.Vec3(size*scale/2, scale, size*scale/2)});
    cloudCollider.addComponent('rigidbody',{type:'kinematic'});
    cloudGroup.addChild(cloudCollider);
    cloudCollider.rigidbody.teleport(pos.clone().add(new pc.Vec3(size,scale-1,size).mulScalar(scale/2)));
    
    
    let cloudParticles = new pc.Entity("CloudParticles");
    let extra = 1.1;
    const scaleCurve = new pc.Curve([scale, scale*2.1]);
    cloudParticles.addComponent("particlesystem", {
        numParticles: size*size*3,
        lifetime: 1,
        rate: .001,
        rate2: .001,
        emitterExtents: new pc.Vec3(size*scale*extra, 1, size*scale*extra),
        scaleGraph: scaleCurve,
        colorMap: assets.textures.fuzzk.resource,
    });
    cloudGroup.addChild(cloudParticles);
    cloudParticles.setPosition(pos.clone().add(new pc.Vec3(size,scale-1,size).mulScalar(scale/2)));
}




function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.
  a.sort();
  b.sort();
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
