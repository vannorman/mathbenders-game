var SinePulsate = pc.createScript('sinePulsate');
SinePulsate.attributes.add('pulsateAmount', { type: 'number', default: 0.02 });
SinePulsate.attributes.add('pulsateTime', { type: 'number', default: 1.35 });
SinePulsate.attributes.add('startScale', { type: 'vec3', });

SinePulsate.prototype.initialize = function(){
    this.startTime = Date.now();
    this.startScale = this.startScale ?? this.entity.getLocalScale();

    // dislike but, special case for numberinfo ..
    // alternative strategy is to simply have the numberinfo have its own sinepop fn..
    this.on('destroy',function(){
        this.entity.setLocalScale(this.startScale);
    });
};



SinePulsate.prototype.update = function(dt){
    const t = Date.now() - this.startTime;
    // normalize the wave over pi since sin(x) from 0 to pi is the wave we want
    const amp = Math.sin(t/1000*Math.PI/this.pulsateTime); // need to go from 0 to 1 
    const scale = this.startScale.x + amp * this.pulsateAmount;
    this.entity.setLocalScale(new pc.Vec3(scale,scale,scale)); //pc.Vec3.ONE.mulScalar(scale));
};


