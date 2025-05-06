var MachineNumberWall = pc.createScript('machineNumberWall');
MachineNumberWall.attributes.add('fraction1', { type:'object', default:new Fraction(1,1) });
MachineNumberWall.attributes.add('fraction2', { type:'object', default:new Fraction(1,1) });
MachineNumberWall.attributes.add('size', { type:'integer', array:true, default:[2,1,1]});



MachineNumberWall.prototype.initialize = function() {
    this.existingWallObjects=[];
};



MachineNumberWall.prototype.setFraction1 = function(frac){

    this.fraction1 = Fraction.ReduceOverIntegers(frac);
    this.rebuildWall();
}

MachineNumberWall.prototype.setFraction2 = function(frac){
    this.fraction2 = Fraction.ReduceOverIntegers(frac);
    this.rebuildWall();

}

MachineNumberWall.prototype.setSize = function(size){
    this.size = size;
    this.rebuildWall();
}


MachineNumberWall.prototype.rebuildWall = function(){
    // clear existing wall.
    this.existingWallObjects.forEach(x =>{x.destroy();x.remove();});
    this.existingWallObjects = [];

    function createCube(pos,frac){
        const args = {
            rigidbodyType:pc.RIGIDBODY_TYPE_KINEMATIC,
            properties: // awkward: this is actually defining property value map, or "values"; not "properties"
            {
                position:pos,
                FractionModifier : frac,
            }
        }
        // console.log(args);
        let cube = new NumberCube(args);
        return cube.entity;//Game.Instantiate.NumberCubeFixed(args);

                      
    }
    let count = 0;
    const size = {x:this.size[0],y:this.size[1],z:this.size[2]};
    for(let x=0;x<size.x;x++){ for(let y=0;y<size.y;y++){ for(let z=0;z<size.z;z++){
        const s = 1.1;
        const p = this.entity.getPosition().clone().add(new pc.Vec3(x*s,y*s,z*s));
        const frac = count % 2 == 0 ? this.fraction1 : this.fraction2;
        const c = createCube(p,frac);
        this.entity.addChild(c);
        this.existingWallObjects.push(c);
        c.moveTo(this.entity.getPosition().clone().add(new pc.Vec3(x*s,y*s+s/2.0,z*s)));
        count++;
    }}};
    // this.entity.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
    this.onChangeFn();
};


