export default class HeldItem {
    constructor(args={}){
        const {
            entity,
            position = new pc.Vec3(0.7,0.3,-1.2),
            rotation=pc.Vec3.ZERO,
            scale=1 
        } = args;
        this.entity = entity;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    onHeld(){
        this.entity.setLocalPosition(this.position);
        this.entity.setLocalEulerAngles(this.rotation);
        this.entity.setLocalScale(new pc.Vec3(this.scale,this.scale,this.scale));
    }
}
