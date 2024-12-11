JsonUtil = {
    vecToArr(vec){
        arr = [];
        if (vec.x) arr.push(vec.x);
        if (vec.y) arr.push(vec.y);
        if (vec.z) arr.push(vec.z);
        if (vec.w) arr.push(vec.w);
        return arr;

    },
    ArrayToVec3(arr){
        return new pc.Vec3(arr[0],arr[1],arr[2]);
    },
    JsonToFraction(obj){
        return new Fraction(obj.numerator,obj.denominator);
    },
    JsonToVec3(obj){
        if(obj==undefined) {
            console.log("NULL json to vec3 obj: "+JSON.stringify(obj));
            stackTrace();
            return;
        }
        return new pc.Vec3(obj.x,obj.y,obj.z);
    },
    Vec3ToJson(pos){
        const p = pos.trunc().clone();
        return {x : parseFloat(p.x), y: parseFloat(p.y), z: parseFloat(p.z)};
    },
}
