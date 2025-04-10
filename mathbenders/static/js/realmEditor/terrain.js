

export default class Terrain {
    

    // Each "Level" (with mutiple Levels per Realm) has a Terrain associated with it.
    // The Terrain is created when the Level is created, and can be modified using BuilderPanel Terrain.
    // Terrains cannot be created or destroyed independently of Levels.
    constructor(args={}){
        let data = {
            name : "New Terrain", 
            heightTruncateInterval : Math.random()*.1, // 0 : smooth, 1 : blocky
            textureOffset : Math.round((Math.random()-0.5)*32),
            heightScale : Math.random()*0.5+0.5, // how tall hills
            seed : Math.random(),  
            dimension : Math.round(Math.random()*32)+8, // x^2 verts
            sampleResolution : Math.random()/100, // higher values : more coarse terrain
            size : 128 + Math.round(Math.random()*128),
            waterLevel : 1,
            // Overlay a second terrain
            resolution2 : 0,
            heightScale2 : 0,
            exp : 0,
            /// realmEditor @Eytan should I be passing realmEditor everywhere here or is accessing the global ok?
       };
       const { realmEditor } = args;
       this.realmEditor=realmEditor;
       console.log('re?');
       if (args.data){
            Object.keys(args.data).forEach(k => {
                data[k] = args.data[k];
            });
        }

        // data.textureOffset -= 128; // normalize 0-256 range to -128 to 128; shouldn't be hardcoded here but i don't have <0 range for this slider yet
        this._data = data;
        this.placeTreeFn = null;
    }

    postGenerationFunction() { 
        const mat = Shaders.GrassDirtByHeight({yOffset:this.centroid.y+this._data.textureOffset,waterLevel:this._data.waterLevel});
        this.entity.render.meshInstances[0].material = mat;
    }
    
    toJSON(){ 
        const data = JSON.parse(JSON.stringify(this._data));
        data.terrainInstance 
        return data;
    }
    
    get entity(){ return this._entity; }
    set entity(value){ this._entity = value; }
    get centroid() {
        if (!this._data.centroid){
            this._data.centroid = Terrain.getCentroid();
        }
        return this._data.centroid;
    }
    get data(){
        this._data.centroid = this.centroid;
        return this._data; 
    }

    get scale(){
        if (this.entity.render) return this.entity.render.meshInstances[0].aabb.halfExtents.length();
        else return 10;
    }
    
    generate(source="none"){
        // console.log("%c load ter:"+source+" at:"+this.data.centroid.trunc(),'color:#5af;font-weight:bold;');
        this.realmEditor.clearTrees();
        this.entity = TerrainGenerator.Generate(this.data);
        this.postGenerationFunction();
        //setTimeout(function(){realmEditor.placeTrees({numTrees:1})},100);
    }
   
    RegenerateWithDelay(opts={}){
        const {delay=500,realmEditor} =opts;
        this.clearTimeouts();
        const $this = this;
        this.regenerateTimeoutFn = setTimeout(function(){
            $this.Regenerate({realmEditor:realmEditor}); 
        },delay)
//        console.log("reg del");
    }

    Regenerate(args){
        // console.log("regen ter");
        const {realmEditor} = args;
        this.entity.destroy();
        this.clearTimeouts();
        this.generate(this.data);
        const terrainPos = this.entity.getPosition();    
        realmEditor.camera.translate({source:'regen',targetPivotPosition:terrainPos, targetZoomFactor:this.scale*2.2});
    } 

    clearTimeouts(){
        clearInterval(this.placeTreeFn);
        clearTimeout(this.placeTreeTimeoutFn);
        clearTimeout(this.regenerateTimeoutFn);
    }

    destroy(){
        Terrain.relinquishCentroid(this._data.centroid);
        this.clearTimeouts();
        this.entity.destroy();

    }

    // CENTROID MANAGEMENT
    // When placing terrains, they all exist in the same "scene" and so must be spaced away from each other.
    // To manage placement of new, deletion of old, and reshuffling of terrain positions
    // we use "centroids", a static list of vec3 defining a 3d grid where at most one terrain fits on each vec3.
    static spacing = 1000;
    static centroids = [];
    static {
        const dim = 4;
        const arr = Array.from({ length: dim }, () => Array.from({ length: dim }, () => Array.from({length:dim})));
        arr.forEach((layer, x) => layer.forEach((row, y) => row.forEach((element, z) => {
            Terrain.centroids.push(new pc.Vec3(x-1,y-1,z-1).mulScalar(Terrain.spacing)); 
            // -1,-1,-1 to 1,1,1 (a total of 27 positions in a 3x3x3 cube) 
        })))

    }
    static getCentroid () {
        if (Terrain.centroids.length <= 0){ //this.centroids.index - 1) {
            console.log("%c ERROR : Too many terrains!","color:red,font-weight:bold");
            return new pc.Vec3(0,150,0); // a spacing likely to be visually seen by the user as an error
        }
        return Terrain.centroids.pop();//[this.index++];
    }
    static relinquishCentroid(centroid){
        // Terrain will call this when it's destroyed.
        Terrain.centroids.push(centroid);
    }
}


