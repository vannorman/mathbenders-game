const Physics = {
    // Awkward - not sure how to detect colliders without a 100ms delay and callback.
    // E.g. there is no Physics.OverlapSphere as in Unity.
    OverlapSphere(opts={}){
        const { point = new pc.Vec3(0, 0, 0), radius = 5, callback } = opts;
        const d1 = radius*radius;
        let bodies = [];
        pc.app.root.findComponents('rigidbody').forEach(body =>{
            const d2 = body.entity.getPosition().distanceToSquared(point);
            if (d2 < d1){
                bodies.push([body,d2]);
            }
        });
        return bodies;
    },

/*    OverlapSphere : async function(opts={}){

        const { point = new pc.Vec3(0, 0, 0), radius = 5, callback } = opts;
        var triggerEntity = new pc.Entity();

        triggerEntity.addComponent('model', {
            type: 'sphere'  // This creates a visual sphere to represent the trigger
        });

        triggerEntity.addComponent('collision', {
            type: 'sphere',
            radius: radius,  // Set the radius of the sphere
            isTrigger: true   // Set the collider as a trigger
        });

        triggerEntity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(radius*2));

        triggerEntity.moveTo(point);
        cols = [];
        triggerEntity.collision.on('triggerenter', function (otherEntity) {
            cols.push(otherEntity);
            console.log("Trigger enter!");
        });
        pc.app.root.addChild(triggerEntity);
        await delay(100);
        console.log("Destr");
        callback(cols);
        triggerEntity.destroy();

    }*/ 
}
