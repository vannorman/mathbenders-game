var MachineCrossingDetector = pc.createScript('machineCrossingDetector');
MachineCrossingDetector.attributes.add('directionIndex', { type: 'integer', default:2 }); // [x, y, z] =>index  0,1,2 
MachineCrossingDetector.attributes.add('halfwayDist', { type: 'float', default:0 }); 
MachineCrossingDetector.attributes.add('requiredFn', { type: 'function'}); //, default:0 }); 
MachineCrossingDetector.attributes.add('Cross', { type: 'function'}); //, default:0 }); 
MachineCrossingDetector.attributes.add('context', { type: 'object'}); //, default:0 }); 

MachineCrossingDetector.prototype.initialize = function () {
    // Note: No rigidbody is needed to detect collision/trigger events
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    this.entity.collision.on('triggerleave', this.onTriggerExit, this);
    this.entity.collision.on('triggerstay', this.onTriggerStay, this);
    this.crossingObjs = {};
    if (!Game.mcd) Game.mcd = []
    Game.mcd.push(this);
    this.entity.tags.add(Constants.Tags.Portal);
};


MachineCrossingDetector.prototype.onTriggerEnter = function (other) {
    if (this.requiredFn(other)) {
        dir = this.p(other) > this.halfwayDist ? true : false;
        this.crossingObjs[other.getGuid()] = {dir:dir,p:this.p(other)};
    }
};

MachineCrossingDetector.prototype.onTriggerExit = function (other) {
    if (this.crossingObjs[other.getGuid()]){
        delete(this.crossingObjs[other.getGuid()]);
    }
};

MachineCrossingDetector.prototype.onTriggerStay = function (other) {
    // console.log("other local z:"+this.entity.worldToLocalPos(other.getPosition()).z);
};

MachineCrossingDetector.prototype.p = function (other) {
    if (other == null) return;
    switch(this.directionIndex){
        case 0: return this.entity.worldToLocalPos(other.getPosition()).x;
        case 1: return this.entity.worldToLocalPos(other.getPosition()).y;
        case 2: return this.entity.worldToLocalPos(other.getPosition()).z;
        default: console.log("WRONG DIR INDEX:"+this.directionIndex); return null;
    }
};

MachineCrossingDetector.prototype.update = function (dt) {
    for (const [key, value] of Object.entries(this.crossingObjs)) {
        let co = pc.app.root.findByGuid(key);
        let o = this.crossingObjs[key];
        if (o.dir == true && this.p(co) < this.halfwayDist) {
            this.Cross({obj:co,direction:dir,context:this.context});
        } else if (o.dir == false && this.p(co) > this.halfwayDist) {
            this.Cross({obj:co,direction:dir,context:this.context});
        }
        o.p = this.p(co);
    }
};
