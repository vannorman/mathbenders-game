var NumberWall = pc.createScript('numberWall');
NumberWall.attributes.add('properties', { type: 'object' });
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

    const props = this.properties.numberWallProperties;

    props.existingWallObjects.forEach(x =>{x.destroy();x.remove();});
    props.existingWallObjects = [];

    const size=props.size;
    for(let x=0;x<size.x;x++){ for(let y=0;y<size.y;y++){ for(let z=0;z<size.z;z++){
        const s = 1.1;
        const p = this.entity.getPosition().clone().add(new pc.Vec3(x*s,y*s,z*s));
        const c = props.createCubeFn(p);
        this.entity.addChild(c);
        this.properties.numberWallProperties.existingWallObjects.push(c);
        c.setLocalPosition(new pc.Vec3(x*s,y*s+s/2.0,z*s));

    }}};
    this.entity.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
    this.entity.name='numberwall';
};

NumberWall.prototype.setProperties = function(props) {
    let mergedProps = {...this.properties, ...props }; // union of a and b, b with same value will overwrites a
    this.properties = mergedProps;
}

NumberWall.prototype.getProperties = function(props) {
    const properties = Object.assign(props, this.properties);
}


