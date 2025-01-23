var NumberWall = pc.createScript('numberWall');
NumberWall.attributes.add('properties', { type: 'object' }); // to remove
NumberWall.attributes.add('fraction1', { type:'object', default:new Fraction(1,2) });
NumberWall.attributes.add('fraction2', { type:'object', default:new Fraction(1,2) });
NumberWall.attributes.add('size', { type:'integer', array:true, default:[2,3,1]});

// schema is assumed. TODO: Formalize and validate schema.
// Schema: properties : { numberWallProperties : { size : {x:1,y:1,z:1}, existingWallObjects : [], createCubeFn : ()=>{return cube})


// NumberWall.attributes.add('size', { type: 'vec3', default: new pc.Vec3(4,2,1) });
// NumberWall.attributes.add('createCubeFn', { type : 'object', });

NumberWall.prototype.initialize = function() {
    Game.nw = this;
};

NumberWall.prototype.rebuildWall = function(){
    // clear existing wall.
    this.entity.children.forEach(x => {x.destroy();x.remove();});

    this.existingWallObjects.forEach(x =>{x.destroy();x.remove();});
    this.existingWallObjects = [];

    const size=this.size;
    for(let x=0;x<size.x;x++){ for(let y=0;y<size.y;y++){ for(let z=0;z<size.z;z++){
        const s = 1.1;
        const p = this.entity.getPosition().clone().add(new pc.Vec3(x*s,y*s,z*s));
        const c = props.createCubeFn(p);
        this.entity.addChild(c);
        this.existingWallObjects.push(c);
        c.setLocalPosition(new pc.Vec3(x*s,y*s+s/2.0,z*s));

    }}};
    this.entity.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
    this.entity.name='numberwall';
};


