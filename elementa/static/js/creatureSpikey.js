var CreatureSpikey = pc.createScript('creatureSpikey');
// Used for pickup detection and fx only

CreatureSpikey.attributes.add('onPickupFn', { type: 'object' });
CreatureSpikey.attributes.add('type', { type: 'string', default:'none' });
CreatureSpikey.attributes.add('subCreatureSpikey', { type: 'object'});
CreatureSpikey.attributes.add('movementRange', { type: 'number', default: 10 });
CreatureSpikey.attributes.add('originPoint', { type: 'vec3', default: new pc.Vec3(0, 0, 0) });
CreatureSpikey.attributes.add('growlFn', { type: 'object'});

CreatureSpikey.prototype.initialize = function(){
    this.timer = 0;
    this.currentDirection = Utils.getRandomUnitVector().flat(); 
    this.entity.addComponent('collision',{type:'sphere',radius:0.5});
    this.entity.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_DYNAMIC});
    this.entity.script.create('numberInfo',{attributes:{type:NumberInfo.Sphere}});

//    this.subCreatureSpikey.name = this.subCreatureSpikey.entity.name + "script";
}

CreatureSpikey.CreateGroup = function(pos,count){
    for(var i=0;i<count;i++){
        
    }
}

CreatureSpikey.prototype.getRandomInterval = function() {
    return Math.random() * 3 + 2; // Random interval between 2-5 seconds
};

CreatureSpikey.prototype.update = function (dt) {
   // Update the timer
    this.timer -= dt;
    
    // If the timer reaches zero, change direction and reset timer
    if (this.timer <= 0) {
        this.growlFn(this.entity.getPosition());
        this.currentDirection = new pc.Vec3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        this.timer = this.getRandomInterval();
    }
    
    // Calculate distance from origin point
    var distance = this.entity.getPosition().sub(this.originPoint).length();
    
    // If creature is too far from origin, move towards it
    if (distance > this.movementRange) {
        var toOrigin = this.originPoint.clone().sub(this.entity.getPosition()).normalize();
        this.currentDirection = toOrigin;
    }
    
    // Apply force in the current direction of movement
    var force = this.currentDirection.scale(10*dt); // You can adjust the force value
    this.entity.rigidbody.applyImpulse(force);
}
