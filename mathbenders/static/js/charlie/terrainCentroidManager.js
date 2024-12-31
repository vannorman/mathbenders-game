export default class TerrainCentroidManager {
    constructor(args={}){
        const { terrainSpacing = 1000 }  = args;
        this.terrainSpacing = terrainSpacing;
        this.centroids = [];

        const dim = 4;
        const arr = Array.from({ length: dim }, () => Array.from({ length: dim }, () => Array.from({length:dim})));
        arr.forEach((layer, x) => layer.forEach((row, y) => row.forEach((element, z) => {
            this.centroids.push(new pc.Vec3(x-1,y-1,z-1).mulScalar(this.terrainSpacing)); 
            // -1,-1,-1 to 1,1,1 (a total of 27 positions in a 3x3x3 cube) 
        })))
    }
    getCentroid () {
        if (this.centroids.length <= 0){ //this.centroids.index - 1) {
            console.log("%c ERROR : Too many terrains!","color:red,font-weight:bold");
            return new pc.Vec3(0,150,0); // a spacing likely to be visually seen by the user as an error
        }
//        console.log("%c CENTROID : "+(this.index + 1),"color:#0a0")
        return this.centroids.pop();//[this.index++];
    }
    relinquishCentroid(centroid){
        // Terrain will call this when it's destroyed.
        this.centroids.push(centroid);
    }
}


