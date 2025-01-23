var SinePopIn = pc.createScript('sinePopIn');
SinePopIn.attributes.add('popAmount', { type: 'number', default: 0.1 });
SinePopIn.attributes.add('popTime', { type: 'number', default: 0.15 });

SinePopIn.prototype.initialize = function(){
    this.startTime = Date.now();
    this.startScaleX = this.entity.getLocalScale().x;
    //this.entity.setLocalScale(0,0,0);
    // dislike but, special case for numberinfo ..
    // alternative strategy is to simply have the numberinfo have its own sinepop fn..
    this.on('enable',function(){this.startTime = Date.now();});
};



SinePopIn.prototype.update = function(dt){
    const t = Date.now() - this.startTime;
    // normalize the wave over pi since sin(x) from 0 to pi is the wave we want
    const amp = Math.sin(t/1000*Math.PI/this.popTime); // need to go from 0 to 1 
    const scale = this.startScaleX  + amp * this.popAmount;
    //console.log("t:"+t+", amp:"+amp.toFixed(2)+", thispop:"+this.popAmount+", scale;"+scale.toFixed(2));
    this.entity.setLocalScale(new pc.Vec3(scale,scale,scale)); //pc.Vec3.ONE.mulScalar(scale));
    if (t >= this.popTime * 1000){
       this.entity.setLocalScale(pc.Vec3.ONE.mulScalar(this.startScaleX));
       this.entity.script.destroy('sinePop');
    }
};


