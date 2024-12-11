var LightningGenerator = pc.createScript('lightningGenerator');
//LightningGenerator.attributes.add('eventHappenedThisSwing', {type:'bool',default:false});


// why my line render dont work?

LightningGenerator.prototype.initialize = function() {
    const N = 50; // Total number of nodes
    const amplitude = 0.5; // Amplitude of the zigzag
    
    this.points = [];
    for (let i = 0; i < N; i++) {
        const x = i;
        const y = Math.sin(i) * amplitude;
        this.points.push(new pc.Vec3(x, y, 0));
    }

    this.currentIndex = 0;
};




LightningGenerator.prototype.update = function(dt) {
    if (this.currentIndex < this.points.length - 1) {
        const start = this.points[this.currentIndex];
        const globalStart = this.entity.localToWorldPos(start);
        const end = this.points[this.currentIndex + 1];
        const globalEnd = this.entity.localToWorldPos(end);
        
        pc.app.drawLine(globalStart, globalEnd, pc.Color.RED, false);
        
        this.currentIndex++;
    }
    const startt = Game.player.getPosition();
    const endd = Game.portal.getPosition();
    pc.app.renderLine(startt,endd, pc.Color.RED);
//    console.log("st:"+startt+", end;"+endd);
    pc.app.drawLine(startt,endd,pc.Color.RED,false,pc.LAYERID_WORLD)
};

