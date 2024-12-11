
var DestroyAfterSeconds = pc.createScript('destroyAfterSeconds');
DestroyAfterSeconds.attributes.add('seconds', { type: 'number', default:3 }); 

DestroyAfterSeconds.prototype.update = function(dt){
    this.seconds -= dt;
    if (this.seconds <= 0){
        this.entity.destroy();
    }
};
