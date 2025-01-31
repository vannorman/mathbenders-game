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

    createInventory(){
        this.inventory = new Inventory();

    }
  
}

