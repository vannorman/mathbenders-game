import Template from '../template.js';
import {PropertyMap,FractionProperty,QuantityProperty} from '../properties.js';
import {NumberSphereRaw } from '../numbers.js';

// Should be able to have these in a different file. don't understand proper hierarchy of class, extend,  etc.
export class Spikey extends NumberSphereRaw {
    static _icon = assets.textures.ui.icons.spikey;
    timer = 0; 
    static combinationHierarchy = 3;
    //growlFn=(pos)=>{console.log("growl:"+pos);};
    originPoint=pc.Vec3.ZERO;
    movementRange=5;
    currentDirection=pc.Vec3.ZERO;
    static propertiesMap = [
         new PropertyMap({  
            name : this.name, // if this changes, data will break // Should be Fraction1?
            property : FractionProperty, 
            onChangeFn : (template,value) => { template.setFraction(value); }, 
            onInitFn : (template,value) => { template.fraction = value; },
            getCurValFn : (template) => { return template.getFraction(); }, 
         }),
    ]
     setup(args={}){
        super.setup(args);
    }
    constructor(args={}){
        super(args);
        let spikeyClothes = assets.models.creatures.spikey.resource.instantiateRenderEntity();
        this.entity.addChild(spikeyClothes);
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

        pc.app.on('update',this.update,this);
        this.script.type = NumberInfo.Type.Creature;
    }

    get randomInterval(){
        const i = Math.random() * 3 + 2; // Random interval between 2-5 seconds
        return i;

    }

    static { Game.f = 10 };
    update(dt){
        this.timer -= dt;
        // If the timer reaches zero, change direction and reset timer
        if (this.timer <= 0) {
            //console.log("im alive:"+this.uuid.substr(0,5));
            this.timer = this.randomInterval * 5;
            if (isNaN(this.entity.getPosition().x)){ console.log("N"); return;}
            this.growlFn(this.entity.getPosition());
            this.currentDirection = new pc.Vec3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        }

        // Give it a chance to redirect efforts toward player, if player is close enough
        var distToPlayer = Player.entity.getPosition().sub(this.entity.getPosition()).length();
        if (distToPlayer < 10){
            this.currentDirection = Player.entity.getPosition().sub(this.entity.getPosition()).normalize();
        }

        // Calculate distance from origin point
        var distance = this.entity.getPosition().sub(this.originPoint).length();
        // If creature is too far from origin, move towards it
        if (distance > this.movementRange) {
            this.currentDirection = this.originPoint.clone().sub(this.entity.getPosition()).normalize();
        }


        // Apply force in the current direction of movement

        var force = Game.f * 30 * dt;// (10*dt); // You can adjust the force value
        const force3d = this.currentDirection.clone().normalize().mulScalar(force);
        this.entity.rigidbody.applyForce(force3d);
        Utils3.debugForce({entity:this.entity,force:force3d});
    }

    entityWasDestroyed(){
    //    console.log("This was destroyed:"+this.uuid);
        super.entityWasDestroyed();
        pc.app.off('update',this.update,this);
    }



}


export class SpikeyGroup extends Template {
    fraction;
    static _icon = assets.textures.ui.icons.spikey;
    range=5;
    setup(args={}){}
    static propertiesMap = [
         new PropertyMap({  
            name : "SpikeyGroupQuantity",
            property : QuantityProperty,
            onChangeFn : (template,value) => {  template.quantity = value; template.Rebuild(); },
            onInitFn : (template,value) => { template.quantity = value; },
            getCurValFn : (template) => { return template.quantity },
            min:1,
            max:7,
         }),
    ];

    Rebuild(){
        this.DestroyGroup();
        this.CreateGroup();
    }

    DestroyGroup(){
        this.spikeys.forEach(x=>{x.entity.destroy();})
    }

    gatherLooseRigidbodies(){
        this.spikeys.forEach(x=>{
            x.entity.moveTo(this.randomSpikeyPos);
            if (x.entity.rigidbody){
                x.entity.rigidbody.linearVelocity=pc.Vec3.ZERO;
                x.entity.rigidbody.angularVelocity=pc.Vec3.ZERO;

            }
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

    CreateGroup(){
        this.spikeys=[];
        for (let i=0;i<this.quantity;i++){
            let p = this.randomSpikeyPos;
            const args = {
                position : p,
                properties : {
                    Spikey : this.fraction
                }
            } 
            const s = new Spikey(args);
            s.entity.on('destroy',function(){ this.spikeyDestroyed(s.entity); },this);
            this.entity.addChild(s.entity);
            this.spikeys.push(s);
            //s.moveTo(p); // addchild changes local pos?
        } 
    }

    spikeyDestroyed(entity){
        this.spikeys = this.spikeys.filter(x=>{return x.entity.getGuid()!==entity.getGuid()});
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
        this.gatherLooseRigidbodies();
        this.spikeys.forEach(x=>{
            x.entity.rigidbody.type = pc.RIGIDBODY_TYPE_DYNAMIC;
            x.originPoint = x.entity.getPosition();
        });
    }

    constructor(args){
        super(args);
        // @Eytan; awkward competition for who sets properties when and from where.
        // When dragging a new item instantiated from editor, it has no properties and relies on defaults.
        // When reloading a level from saved data, it inflates each one with properties and must let those values override defaults.
        this.quantity = this.quantity ?? 2; 

        this.fraction = this.fraction ?? new Fraction(-2,1);
        this.CreateGroup();
        let frac = this.fraction;
        let visibleSpikey = new NumberSphereGfxOnly({position:this.entity.getPosition(),properties:{NumberSphereGfxOnly:frac}});
        this.entity.addChild(visibleSpikey.entity);
        let spikeyClothes = assets.models.creatures.spikey.resource.instantiateRenderEntity();
        visibleSpikey.entity.addChild(spikeyClothes);
        let s = 3;
        visibleSpikey.entity.setLocalScale(s,s,s);
        visibleSpikey.entity.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(s/2,s/2,s/2)});
        visibleSpikey.entity.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_STATIC});
        visibleSpikey.entity.moveTo(this.entity.getPosition().clone().add(new pc.Vec3(0,3,0)));
        this.visibleSpikey=visibleSpikey;

        pc.app.on('update',this.update,this);
    }

    entityWasDestroyed(){
        super.entityWasDestroyed();
        this.spikeys.forEach(x=>{x.entity.destroy()});
        this.spikeys=[];
        pc.app.off('update',this.update);
    }

    tick=0;
    update(dt){
        this.tick++;
        if (this.tick > 105){
            this.tick=0;
            this.spikeys.forEach(x=>{
                if (pc.Vec3.distance(x.entity.getPosition(),this.entity.getPosition()) > this.range * 10){
                    x.entity.moveTo(this.randomSpikeyPos);
                    x.entity.rigidbody.linearVelocity=pc.Vec3.ZERO;
                    x.entity.rigidbody.angularVelocity=pc.Vec3.ZERO;

                }
            });
        }
    }
    
    onGameStateChange(state){
        super.onGameStateChange(state);
        switch(state){
        case GameState.RealmBuilder: this.visibleSpikey.entity.enabled=true; break;
        case GameState.Playing: this.visibleSpikey.entity.enabled=false; this.gatherLooseRigidbodies(); break;
        default:break;
        }

    }

}

