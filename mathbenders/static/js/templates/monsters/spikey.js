import Template from '../template.js';
import {PropertyMap,QuantityProperty} from '../properties.js';

export class Spikey extends Template {
    static _icon = assets.textures.ui.icons.spikey;
    timer = 0; 
    //growlFn=(pos)=>{console.log("growl:"+pos);};
    originPoint=pc.Vec3.ZERO;
    movementRange=5;
    currentDirection=pc.Vec3.ZERO;
    setup(args={}){
        this.entity.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_DYNAMIC});
        let s = new NumberSphereGfxOnly();
        this.entity.addComponent('collision',{type:'sphere',radius:0.5});
        let spikeyClothes = assets.models.creatures.spikey.resource.instantiateRenderEntity();
        s.entity.addChild(spikeyClothes);
        this.entity.addChild(s.entity);
        s.entity.setLocalPosition(pc.Vec3.ZERO);
        spikeyClothes.setLocalPosition(pc.Vec3.ZERO);
        this.originPoint = this.entity.getPosition();

        const $this=this;
        $this.growlFn=(pos)=>{
            AudioManager.play({
                source:PickRandomFromObject(assets.sounds.spikeySounds),
                position:pos,
                positional:true
            });
        }

        pc.app.on('update',function(dt){
            $this.update(dt);
        });


    }

    get randomInterval(){
        const i = Math.random() * 3 + 2; // Random interval between 2-5 seconds
        return i;

    }

    update(dt){
        return;
        this.timer -= dt;
        // If the timer reaches zero, change direction and reset timer
        if (this.timer <= 0) {
            this.growlFn(this.entity.getPosition());
            this.currentDirection = new pc.Vec3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
            this.timer = this.randomInterval;
        }
        
        // Calculate distance from origin point
        var distance = this.entity.getPosition().sub(this.originPoint).length();
        
        // If creature is too far from origin, move towards it
        if (distance > this.movementRange) {
            var toOrigin = this.originPoint.clone().sub(this.entity.getPosition()).normalize();
            this.currentDirection = toOrigin;
        }
        
        // Apply force in the current direction of movement
        var force = this.currentDirection.clone().length() * 10 * dt;// (10*dt); // You can adjust the force value
        this.entity.rigidbody.applyImpulse(force);
    }
}


export class SpikeyGroup extends Template {
    static _icon = assets.textures.ui.icons.spikey;
    _quantity = 3;
    static propertiesMap = [
         new PropertyMap({  
            name : QuantityProperty.constructor.name,
            property : QuantityProperty,
            onChangeFn : (template,value) => {  template.quantity = value; },
            getCurValFn : (template) => { return template.quantity },
            min:1,
            max:7,
         }),
    ];

    get quantity(){ 
        return this._quantity;
    }
    set quantity(value) { 
        console.log("set q:"+value);
        this._quantity = value;
    }
    ResetGroup(){
        this.DestroyGroup();
        this.CreateGroup();
    }

    DestroyGroup(){
        this.entity.destroy();
    }

    gatherLooseRigidbodies(){
        this.spikeys.forEach(x=>{
            x.entity.moveTo(this.randomSpikeyPos);
            x.entity.rigidbody.linearVelocity=pc.Vec3.ZERO;
        });
        // if they fell away, reset them to be close to the center of the group
    }
    onBeginDragByEditor(){
        super.onBeginDragByEditor();
        this.freezeRigidbodies(); 

        this.gatherLooseRigidbodies();
    }
    onEndDragByEditor(){
        super.onEndDragByEditor();
        this.unfreezeRigidbodies(); 
    }

    CreateGroup(q){
        console.log("this q:"+this._quantity);
        this.spikeys=[];
        for (let i=0;i<this._quantity;i++){
            console.log("create group  # "+i);
            let p = this.gandomSpikeyPos;
            let s = new Spikey({position:p});
            this.entity.addChild(s.entity);
            this.spikeys.push(s);
            //s.moveTo(p); // addchild changes local pos?
        } 
    }

    get randomSpikeyPos(){
        let p = this.entity.getPosition().clone().add(new pc.Vec3(0,10,0));
        p.add(pc.Vec3.onUnitSphere().clone().flat().mulScalar(this.range));
        return p;
    }

    freezeRigidbodies(){
        this.spikeys.forEach(x=>{
            x.entity.rigidbody.type = pc.RIGIDBODY_TYPE_STATIC;
        });
    }
    
    unfreezeRigidbodies(){
        this.spikeys.forEach(x=>{
            x.entity.rigidbody.type = pc.RIGIDBODY_TYPE_DYNAMIC;
        });
    }

    setup(){
        this.quantity = 3;
        this.range=5;
        this.CreateGroup();
        let visibleSpikey = new NumberSphereGfxOnly({position:this.entity.getPosition()});
        this.entity.addChild(visibleSpikey.entity);
        let spikeyClothes = assets.models.creatures.spikey.resource.instantiateRenderEntity();
        visibleSpikey.entity.addChild(spikeyClothes);
        let s = 3;
        visibleSpikey.entity.setLocalScale(s,s,s);
        visibleSpikey.entity.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(s/2,s/2,s/2)});
        visibleSpikey.entity.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_STATIC});
        visibleSpikey.entity.moveTo(this.entity.getPosition().clone().add(new pc.Vec3(0,3,0)));
        this.visibleSpikey=visibleSpikey;
        console.log("Group create");
    }
    
    onGameStateChange(state){
        switch(state){
        case GameState.RealmBuilder: break;
        case GameState.Playing: this.gatherLooseRigidbodies(); break;
        default:break;
        }

    }

}
