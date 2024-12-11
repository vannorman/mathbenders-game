var castleArchitecture = {
    walls : [],
    buildWalls(options) {
        const seedAsset = options.seedAsset || Game.Instantiate[Constants.Templates.CastleWall]();
        const centroid = options.centroid || new pc.Vec3(-1000, 20, -32);
        const radius = options.radius || 50; 
        const sides = options.sides || 5;
        const openings = options.openings || 5;
        const wallLength = seedAsset.findComponent('render').meshInstances[0].mesh.aabb.halfExtents.max() * 2;
        const points = this.getPoints({center:centroid,radius:radius,sides:sides});
        let allWalls = []
        for (let i=0;i<points.length;i++){
            const a = points[i];
            const b = i == points.length-1 ? points[0] : points[i+1];
            const dir = b.clone().sub(a).normalize();
            const dist = pc.Vec3.distance(a,b);
            const numWalls = dist / wallLength;
            for (let j=0;j<numWalls;j++){
                const pos = a.clone().add(dir.clone().mulScalar(wallLength*j));
                wall = seedAsset.cloneWithMesh();
                const rot = new pc.Quat().setFromDirections(wall.right,dir);
                wall.moveTo(pos,rot.getEulerAngles());
                Utils.adjustMeshToGround({entity:wall});
                allWalls.push(wall);
                castleArchitecture.walls.push(wall);
                const col = new pc.Entity('wallCollider');
                wall.addChild(col);
                col.setLocalPosition(new pc.Vec3(3,3,-0.5));
                col.setLocalRotation(pc.Quat.IDENTITY);
                // Not sure why but if I do this same frame it "Stretches" the cloned mesh! ;-P
                // setTimeout(function(){col.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(3,3.5,0.5)});},2000);
                // Set up collision groups and masks

                col.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_STATIC});
                Utils.AddToNonCollidingGroup(col.rigidbody,Constants.Layers.Walls);
                //pc.app.root.addChild(col);
                //wall.children[0].rigidbody.type = 'static';
            }
        }
        let removed = Utils.SelectNFromArray({arr:allWalls,count:openings});
        removed.forEach(x => x.destroy());
        seedAsset.destroy();

    },
    getPoints(options){
        const { center = pc.Vec3.ZERO, sides = 5, radius = 20 } = options;
        const points = [];
        const angleIncrement = (2 * Math.PI) / sides;
        for (let i = 0; i < sides; i++) {
            const angle = i * angleIncrement;
            const x = center.x + radius * Math.cos(angle);
            const z = center.z + radius * Math.sin(angle);
            points.push(new pc.Vec3(x, center.y, z));
        }
        return points;
    },

}
