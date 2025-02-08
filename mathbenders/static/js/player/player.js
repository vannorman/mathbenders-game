import Inventory from "./inventory/base.js";

class PlayerClass {
    entity;
    pivot;
    camera;
    inventory;

    constructor(args={}){
        const { startingPosition = pc.Vec3.ZERO } = args;
        // TODO: Remove global refs e.g. to Game.
        // TODO: separate 

        // root player entity
        this.entity = new pc.Entity("Player");
        pc.app.root.addChild(this.entity);
        let rb = this.entity.addComponent("rigidbody",{
            type:pc.BODYTYPE_DYNAMIC,
            angularFactor:pc.Vec3.ZERO,
            linearDamping: 0.8,
            }); 
        this.entity.addComponent("collision",{type:'sphere'}); // Without , this defaults to a 1x1x1 box shape
        
        // this.entity.script.create('recordPosition');
 
        // camrea pivot
        let pivot = new pc.Entity("pivot");
        this.entity.addChild(pivot);
        this.pivot = pivot;

        
        this.camera = new PlayerCamera({
            pivot:pivot,
            playerEntity:this.entity
        });

        // Player graphics 
        this.graphics = assets.models.mascot.resource.instantiateRenderEntity();
        ApplyTextureAssetToEntity({entity: this.graphics, textureAsset:assets.textures.gadget});
        pc.app.root.addChild(this.graphics);
        this.graphics.setLocalScale(new pc.Vec3(0.01,0.01,0.01));
        
        // Player controller
        this.entity.addComponent('script');
        this.controller = this.entity.script.create('thirdPersonController',{
            attributes:{
                camera:this.camera.entity,
                pivot:pivot,
                playerGraphics:this.graphics,
            }
        });



    //     Game.inventory = this.Inventory; // legacy

        let handEntity = new pc.Entity();
        pc.app.root.addChild(handEntity);
        handEntity.reparent(Game.player);
        handEntity.setLocalPosition(0, 0, 1);
        this.hand = handEntity;
        this.entity.script.create('playerPickup',{attributes:{
            handEntity:this.hand,
            hasOwnership:(obj)=>{ 
                return ObjectRegistry.playerHasOwnership(obj); 
            }
        }});




        this.entity.moveTo(startingPosition.clone());//.add(new pc.Vec3(rx,0.5+ry,rz)));
        
        GameManager.subscribe(this,this.onGameStateChange);
        Game.player = this.entity;


        // GUI screen for player
        // PlayerMessenger, Inventory etc.
        this.screen = new pc.Entity();

        this.screen.addComponent("screen", {
            referenceResolution: new pc.Vec2(1280, 720),
            scaleBlend: 0.5,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true,
        });

        pc.app.root.addChild(this.screen);

        this.inventory = new Inventory({Player:this});

    }



    freeze(){
        Player.entity.rigidbody.enabled = false;
    }
    unfreeze(){
        Player.entity.rigidbody.enabled = true;
    }

    onGameStateChange(state) {
        switch(state){
        case GameState.RealmBuilder:
            //console.log("Playerturning off for levelbuilder mode.");
            this.disable();
            break;
        case GameState.Playing:
//            console.log("Player turning on for playing mode.");
            this.enable();
            break;
        }
    }


    enable(){
        if (!this.inventory){
            console.log('noinv');
        }
        this.inventory.show();
        this.entity.enabled = true;
        this.controller.enabled = true;
        this.camera.self.enabled=true;
        this.unfreeze();

    }

    disable(){
        this.inventory.hide();
        this.entity.enabled = false;
        this.controller.enabled = false;
        this.camera.self.enabled=false;
        this.freeze();
    }

//    get playerController(){ return  this.entity.getComponentsInChildren('thirdPersonController')[0] }
    get throwPosition() {
        const dir = Utils3.flattenVec3(Camera.main.entity.forward);
        const p = this.entity.getPosition().clone().add(dir).add(dir);
        p.add(new pc.Vec3(0,1,0));
        return p;
    }

    get droppedPosition() {
        if (!Camera.main) return pc.Vec3.ZERO;
        const dir = Utils3.flattenVec3(Camera.main.entity.forward);
        const p = this.entity.getPosition().clone().add(dir).add(dir);
        return p;
    }

    get droppedPosition2() {
        if (!Camera.main) return pc.Vec3.ZERO;
        let dir = Utils3.flattenVec3(Camera.main.entity.forward);
        let p = this.entity.getPosition().clone().add(dir.mulScalar(5));
        return p;
    }
    get droppedPosition3() {
        if (!Camera.main) return pc.Vec3.ZERO;
        const dir = Utils3.flattenVec3(Camera.main.entity.forward);
        const p = this.entity.getPosition().clone().add(dir.mulScalar(5)).add(new pc.Vec3(0,-0.5,0));
        return p;
    }
   get droppedPositionGrounded(){
        var from = Camera.main.entity.getPosition();
        var to = Camera.main.entity.getPosition().clone().add(Camera.main.entity.forward.mulScalar(1000));
        // Raycast between the two points and return the closest hit result
        var result = pc.app.systems.rigidbody.raycastFirst(from, to);

        // If there was a hit, store the entity
        if (result) {
            return result.point;
        } else {
            console.log("noground");
            return to;
        }

    }

    interactWithNumber({entity:entity}){
        const selectedItem = this.inventory.getSelectedItem();

        if (selectedItem instanceof Gadget) {
            // console.log(`Number ${entity.script.numberInfo.fraction} loaded into ${selectedItem.name}`);
            selectedItem.loadNumber(number);
        } else { 
            // console.log(`Number ${entity.script.numberInfo.fraction} added to inventory`);
            this.inventory.collectTemplate(entity._template);
        }
    }

    pickUpItem({entity:entity}){
        this.inventory.collectTemplate(entity._template);
    }

    throwItem(Template,props){
        if (!Template.isThrowable) { console.log('cant throw:'+Template); return false; }

        const thrownItem = new Template({position:this.throwPosition,properties:props});
        // Note, 
        const forceMultiplier = Template.name == "NumberSphere" ? 1.6 : 1; // awkward
        thrownItem.entity.rigidbody.linearVelocity = this.getThrownItemVelocity();
     
        return true;
            
    }

    getThrownItemVelocity(){ 
        const throwSpeed = 10;
        return Camera.main.entity.forward.clone().mulScalar(throwSpeed);//.add(new pc.Vec3(0,Game.tf,0));
    }


    interactWithObject({entity:entity}){
        const template = entity._template;
        if (template instanceof GadgetPickup){
            const gadget = template.constructor.onCollect();
            this.inventory.collectTemplate(gadget);
        }
        console.log("obj.");
    }

}

window.Player = new PlayerClass();
PlayerMessenger.build(); 
PlayerMessenger.Say("Welcome to the Secret of Infinity game (prototype)");
Player.entity.moveTo(Game.c.getPosition());
