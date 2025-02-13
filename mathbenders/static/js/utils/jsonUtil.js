JsonUtil = {
    stringify(obj){
        return JSON.stringify(obj);
    },
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
    cleanJson(jsonString){
        if (!jsonString) return JSON.parse("{}")
        jsonString = jsonString.replaceAll("'",'"')
        jsonString = jsonString.replaceAll("True",'true')
        jsonString = jsonString.replaceAll("False",'false')
        let parsedJson = JSON.parse(jsonString);
        parsedJson = JsonUtil.transformFractions(parsedJson);
        parsedJson = JsonUtil.transformVec3s(parsedJson);
        return parsedJson;

    },


    transformVec3s(obj,depth=0) {
        if (depth>20) return null; //oopes
        if (Array.isArray(obj)) {
            // Recurse into arrays
            return obj.map(JsonUtil.transformVec3s);
        } else if (typeof obj === "object" && obj !== null) {
            // Check if this object has a key "Fraction" with an object value
            if (Object.keys(obj).length == 1 && "Vec3" in obj && typeof obj.Vec3 === "object") {
                return new pc.Vec3(obj.Vec3.x,obj.Vec3.y,obj.Vec3.z);
            } else {
            }

            // Recurse into all object properties
            let newObj = {};
            for (let key in obj) {
                newObj[key] = JsonUtil.transformVec3s(obj[key],++depth);
            }
            return newObj;
        }
        return obj; // Return as is for primitive types
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
                newObj[key] = JsonUtil.transformFractions(obj[key],++depth);
            }
            return newObj;
        }
        return obj; // Return as is for primitive types
    },
 
}
