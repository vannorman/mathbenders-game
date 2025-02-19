'use strict';
let perlin = {
    rand_vect: function(){
        let theta = this.deterministicFloatGenerateNext() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    },
    dot_prod_grid: function(x, y, vx, vy){
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect();
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    },
    smootherstep: function(x){
        return 6*x**5 - 15*x**4 + 10*x**3;
    },
    interp: function(x, a, b){
        return a + this.smootherstep(x) * (b-a);
    },
    deterministicFloatSeed : 42, // can be any integer, change this to change the seed
    deterministicFloatGenerateNext : function () {
        // deterministically random, so we can reproduce the same terrain over and over (for tiling)
        // Depends on CurrentSeed (which counts up over each time this is called)
        this.deterministicFloatSeed = (1103515245 * this.deterministicFloatSeed + 12345) % 2147483648; // LCG algorithm
        return this.deterministicFloatSeed / 2147483648; // Normalize to range [0, 1)
    },
    seed: function(){
        this.gradients = this.savedGradients[0];
        this.memory = {};
    },
    get: function(x, y) {
        if (this.memory.hasOwnProperty([x,y])){
            return this.memory[[x,y]];
        }
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid(x, y, xf,   yf);
        let tr = this.dot_prod_grid(x, y, xf+1, yf);
        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        let v = this.interp(y-yf, xt, xb);
        this.memory[[x,y]] = v;
        return v;
    },
    savedGradients : [
        {
        "0,-1": { "x": 0.6841375465489022, "y": -0.7293530128833696 },
        "1,-1": {  "x": 0.9273491340279068, "y": -0.3741972522850634 },
        "0,0": {        "x": 0.3142761723878929, "y": -0.9493316003742925 },
        "1,0": {        "x": 0.7980393553363141, "y": 0.6026053329787252 },
        "0,1": {        "x": -0.826313338986665, "y": -0.5632106762240119 },
        "1,1": { "x": -0.9803560951934263, "y": -0.19723571334091033 }
        },
    ],
    get2dPerlinArr : function(options){
        const { dim, sampleResolution, deterministicFloatSeed = 0.5 } = options;
        this.gradients=[];
        this.memory = {};
        this.deterministicFloatSeed = Math.round(deterministicFloatSeed*10000); // integer
        let heights2d = []
        for (let i=0;i<dim;i++){
            heights2d[i] = []
            for (let j=0;j<dim;j++){
                heights2d[i][j] = this.get(0.5 + sampleResolution * i, 0.5 + sampleResolution * j);
            }
        }
        return heights2d
    }
}

perlin.seed();

// usage:
// perlin.seed(); perlin.gradients = gradients1 (for consistent same noise); perlin.get(x,y)
// now make it tile, by starting at 0.5, upper limit of 1, make landscape as big as you like I guess, not sure how much noise there is between 0,1 or how to zoom out 

