class NumberInfoManager {
    constructor(){
    
    }

    static collisionPairs = []; // Keep a running list of all collisions to avoid duplicate interactions.
   
    static GetCollisionResolutionOffline(collisionData){
        // We've checked duplicates and are ready to calculate the result of combining two numbers.
        const { obj1, obj2 } = collisionData;

        let midpoint = obj1.getPosition().clone().add(obj2.getPosition()).mulScalar(0.5);
        // Ensure kinematic wins in dynamic+kinematic combo
        let wasKin1 = false;
        let wasKin2 = false;
        if (obj1.rigidbody && obj1.rigidbody.type == pc.RIGIDBODY_TYPE_KINEMATIC) {
            midpoint = obj1.getPosition();
            wasKin1 = true;
        } else if (obj2.rigidbody && obj2.rigidbody.type == pc.RIGIDBODY_TYPE_KINEMATIC) {
            midpoint = obj2.getPosition();
            wasKin2 = true;
        }
        const rbType = (wasKin1 || wasKin2) ? pc.RIGIDBODY_TYPE_KINEMATIC : pc.RIGIDBODY_TYPE_DYNAMIC;
        // const templateNameToClone = wasKin1 ? obj1.name : obj2.name; 
        const templateInstanceToClone = wasKin1 ? obj1._templateName : obj2._templateName;
        const rot = wasKin1 ? obj1.getEulerAngles() : wasKin2 ? obj2.getEulerAngles : pc.Vec3.ZERO;

        // Did both numbers have "destroy after seconds"? If so, this new one has it too
        const destroyAfterSecondsScript = (obj1.script.destroyAfterSeconds && obj2.script.destroyAfterSeconds) ? true : false;
        const destroyAfterSeconds = destroyAfterSecondsScript ? Math.max(obj1.script.destroyAfterSeconds.seconds,obj2.script.destroyAfterSeconds.seconds) : 0;

        // If two objs collide and one wasn't pick-uppable, then the result is not pick-uppable
        let pickup = true;
        if (!obj1.script.pickUpItem || !obj2.script.pickUpItem) pickup = false;
        var resultVelocity = pc.Vec3.ZERO;
        if (obj1.rigidbody?.type == pc.RIGIDBODY_TYPE_DYNAMIC && obj2.rigidbody?.type == pc.RIGIDBODY_TYPE_DYNAMIC) {
            resultVelocity = obj1.rigidbody.linearVelocity.clone().add(obj2.rigidbody.linearVelocity).mulScalar(0.5);
        }


        // Determine resulting frac from add
        const frac1 = obj1.script.numberInfo.fraction;
        const frac2 = obj2.script.numberInfo.fraction;
        const resultFrac = Fraction.Add(frac1,frac2);
        const resultData = {
            resultFrac : resultFrac,
            rigidbodyType : rbType,
            resultVelocity : resultVelocity,
            templateNameToClone : templateNameToClone,
            rotation : rot,
            position : JsonUtil.Vec3ToJson(midpoint), // because we pass to server and back, server prefers json over vec3 obj
            maxNumber : Math.abs(frac1.numerator/frac1.denominator),
            destroyAfterSecondsScript : destroyAfterSecondsScript,
            destroyAfterSeconds : destroyAfterSeconds,
        }
        //console.log(resultData);
        return resultData;
    }
}

Object.freeze(NumberShape = {
    Sphere : "Sphere",
    Cube : "Cube",
    None : "None",
});

