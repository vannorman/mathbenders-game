const ObjectProperties = pc.createScript("objectProperties");
ObjectProperties.attributes.add('objId', { type: 'string' });
ObjectProperties.attributes.add('objectProperties', { type: 'object' }); // as it's instantiated with specific options like scale, save these options for serializing this object later.


ObjectProperties.prototype.initialize = function(){
   this.debugText = Utils.AddTextFloater({floaterOffset:new pc.Vec3(0,2.0,0),color:new pc.Color(1.0,0.8,0.8),text:"debug",parent:this.entity,localPos:pc.Vec3.ZERO,scale:0.07}).element;
    // this.debugText.entity.addLabel('debugText');
    this.debugText.entity.enabled=false;
   cb = this.entity;

//    this.nowPos = this.entity.getPosition();
//    this.lastPos = this.entity.getPosition();
};



ObjectProperties.prototype.update = function(dt){

//    this.debugText.text = this.objState + "\n" + this.ownerId.substr(0,6) + "\n" + this.entity.getPosition().clone().trunc();
};

ObjectProperties.prototype.setObjectProperties = function(properties){
    const subProperties = this.entity.getScriptsWithAttribute('setProperties');
    subProperties.forEach(x => {
        x.setProperties(properties);
        // ni.setFraction(JsonUtil.JsonToFraction(props.numberInfo.fraction));
    });
    if (this.entity.rigidbody) {
        this.entity.rigidbody.type = properties.rigidbodyType;
    }
    this.entity.setPosition(JsonUtil.JsonToVec3(properties.position));
    this.entity.setEulerAngles(JsonUtil.JsonToVec3(properties.rotation));
    this.entity.enabled = properties.enabled;
}

ObjectProperties.prototype.getObjectProperties = function(){
    var properties = this.objectProperties;
    subProperties = this.entity.getScriptsWithAttribute('getProperties');
    subProperties.forEach(x => {
        properties = x.getProperties(properties); // append / replace the existing properties
    });
    properties.position = JsonUtil.Vec3ToJson(this.entity.getPosition());
    properties.rotation = JsonUtil.Vec3ToJson(this.entity.getEulerAngles());
    properties.enabled = this.entity.enabled;
    const rigidbodyVelocity = this.entity.rigidbody ? JsonUtil.Vec3ToJson(this.entity.rigidbody.linearVelocity) : null;
    properties.rigidbodyVelocity = rigidbodyVelocity;
    properties.rigidbodyType = this.entity.rigidbody ? this.entity.rigidbody.type : "None";
    
    return this.objectProperties;
}



