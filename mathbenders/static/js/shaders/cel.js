pc.script.create('toon', function (app) {
    // Creates a new Toon instance
    var Toon = function (entity) {
        this.entity = entity;        
    };

    Toon.prototype = {
        initialize: function () {
            
            // get the ramp texture
        },
       
        // Create material which uses light direction and ramp texture to set diffuse color
        update: function (dt) {
            /// spin the entity
            this.entity.rotate(0, 20*dt, 0);
            
            // update the light direction
            this.lightDir.copy(this.entity.getPosition()).sub(this.light.getPosition()).normalize().scale(-1);
            this.toonMaterial.setParameter('lightDirection', this.lightDir.data);
        }
    };

    return Toon;
});

