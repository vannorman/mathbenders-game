var MachineNumberFaucet = pc.createScript('machineNumberFaucet');
MachineNumberFaucet.attributes.add('fraction', { type: 'object', default: {'numerator':2,'denominator':1} });

MachineNumberFaucet.prototype.initialize = function(){
    if (this.fraction == undefined){
        this.fraction = new Fraction(-1,1);
    }
    this.lastDripTime = -5000;
    this.drippedNumbers = []
    GameManager.subscribe(this,this.onGameStateChange);
    this.isEnabled=false;
    this.disable();


}

MachineNumberFaucet.prototype.setFraction = function(frac){
    this.fraction = Fraction.ReduceOverIntegers(frac);
};
MachineNumberFaucet.prototype.enable = function(){
    this.isEnabled=true;
}
MachineNumberFaucet.prototype.disable = function(){
    this.isEnabled=false;
}
MachineNumberFaucet.prototype.onGameStateChange = function(state){
    switch(state){
    case GameState.RealmBuilder:
        this.disable();
        break;
    case GameState.Playing:
        this.enable();
        break;
    }
 
}
MachineNumberFaucet.prototype.update = function(dt){
    // Eytan : Instead of checking in each behavior that is part of GameMode Normal, we should have this object belong to a category of Normal and only execute all those objects during Normal mode (avoid checks in each obj's update)
    if (!this.isEnabled) return;
    const timeSinceDrip = pc.now() - this.lastDripTime;
    

    if (timeSinceDrip > 5000 && this.drippedNumbers.length < 6 && !this.drippedNumberIsNear()) {
        this.lastDripTime = pc.now();
        const dripPosition = this.entity.getPosition().add(this.entity.left).add(new pc.Vec3(0,1.5,0));
        const options = {
            position : dripPosition,
            numberInfo : {
                fraction : {
                    numerator:this.fraction.numerator,
                    denominator:this.fraction.demoninator
                },
            }
        } 
        const n = new NumberSphere({
            properties:{NumberSphere:this.fraction},
            position:dripPosition
            });

        const faucet = this;
        n.entity.on('destroy', function() {
            for (let i=0;i<faucet.drippedNumbers.length;i++){
                if (n.entity.getGuid() == faucet.drippedNumbers[i].getGuid()){
                    faucet.drippedNumbers.splice(i,1);
                }
            }
        });
        this.drippedNumbers.push(n.entity);
    }
}

MachineNumberFaucet.prototype.drippedNumberIsNear = function() {
    const nearDist = 2;
    for(let i=0;i<this.drippedNumbers.length;i++){
        const x = this.drippedNumbers[i];
        let p1 = x.getPosition();
        let p2 = this.entity.getPosition();
        if (pc.Vec3.distance(p1,p2) < nearDist) {
            //console.log('dripped number near, pass');
            this.lastDripTime = pc.now();
            return true;
        }
    };
    // console.log('no');
    return false;
}

