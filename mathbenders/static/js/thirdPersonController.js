var ThirdPersonController = pc.createScript('thirdPersonController');

ThirdPersonController.attributes.add('camera', { type: 'entity', title: 'Camera' });
ThirdPersonController.attributes.add('pivot', {type: 'entity'});
ThirdPersonController.attributes.add('playerGraphics', {type: 'entity'});
ThirdPersonController.attributes.add('moveSpeed', { type: 'number', default: 4, title: 'Move Speed' });
ThirdPersonController.attributes.add('lookSpeed', { type: 'number', default: 1, title: 'Turn Speed' });

ThirdPersonController.prototype.initialize = function () {
    //console.log("INIT 3rd person controller prototype");
    // Enable the mouse to control the camera rotation
    pc.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    pc.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    // Initialize the character's movement direction
    this.direction = new pc.Vec3(); 
    this.eulers = new pc.Vec3();
    this.force = new pc.Vec3();
    this.jumpTimer = 0;
    this.jumpInterval = 0.4;
    this.walkSpeed = 4;
    this.runSpeed = 12;
    this.moveSpeed = 0;
    this.ghostBonus = 8;
    this.jumpPower = 10;
    this.maxSpeed = 18;
    this.ghostMode = false;
    this.lookDownMax = -61;
    this.lookUpMax = 66;
    this.initAnimations();

    // Debug camera thru portals
    this.camSwap = false;
    this.camPos = Camera.main.entity.getLocalPosition().clone();
    this.camRot = Camera.main.entity.getLocalRotation().clone();

    this.frozen = false;
};

ThirdPersonController.prototype.initAnimations = function(){
    this.entity.addChild(this.playerGraphics);
    this.playerGraphics.setLocalPosition(0,-0.5,0);

    AnimationManager.AddAnimations({entity:this.playerGraphics});

    
};


ThirdPersonController.prototype.postUpdate = function (dt) {
    if (this.frozen) {
        this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
        return;
    }
    this.preventTerrainFall();
    var app = this.app;

    // Debug camera for portals
    if (app.keyboard.isPressed(pc.KEY_C)){ 
        if (!this.camSwap){ 
            this.camSwap = true;
            if (Camera.main && Game.portalCam) {
                Camera.main.entity.moveTo(Game.portalCam.getPosition(),Game.portalCam.getEulerAngles());
                Camera.main.entity.script.cameraWallHandler.enabled=false;
            }
        }
        return;
    }
    
    if (this.camSwap){
        this.camSwap = false;
        Camera.main.entity.script.cameraWallHandler.enabled=true;
        Camera.main.entity.setLocalPosition(this.camPos);
        Camera.main.entity.setLocalRotation(this.camRot);
    }

    const speed = this.entity.rigidbody.linearVelocity.flat().length();
    if (speed > 0.5 && app.keyboard.isPressed(pc.KEY_A)) { 
        this.playerGraphics.anim.setInteger("state", 3);
    } else if (speed > 0.5 && app.keyboard.isPressed(pc.KEY_D)) { 
        this.playerGraphics.anim.setInteger("state", 4);
    } else if (speed <= 0.5) {
        this.playerGraphics.anim.setInteger("state", 0);
    } else if (speed > 0.5 && speed <= 5.5) {
        this.playerGraphics.anim.setInteger("state", 1);
    } else if (speed > 5.5) {
        this.playerGraphics.anim.setInteger("state", 2);
    }
    if (speed > 0.1) {
        // which direction should player appear to be facing?
        this.playerGraphics.setLocalEulerAngles(0,180+this.eulers.y,0);
    }




    this.jumpTimer -= dt;
    // on update the eulers
    this.pivot.setLocalEulerAngles(this.eulers.x, this.eulers.y, 0);
    // movement
    var x = 0;
    var z = 0;
    var right = this.camera.right;
    var forward = this.camera.forward;

    // Use W-A-S-D keys to move player
    // Check for key presses
    if (app.keyboard.wasPressed(pc.KEY_Q)){ 
        this.ghostMode = !this.ghostMode;
        this.entity.rigidbody.enabled = !this.ghostMode;
        this.entity.rigidbody.applyImpulse(this.entity.rigidbody.linearVelocity.mulScalar(-1))
    }

    
    if (app.keyboard.isPressed(pc.KEY_A)){ 
        x -= right.x;
        z -= right.z;
    }

    if (app.keyboard.isPressed(pc.KEY_D)) {
        x += right.x;
        z += right.z;
    }

    if (app.keyboard.isPressed(pc.KEY_W)) {
        x += forward.x;
        z += forward.z;
    }

    if (app.keyboard.isPressed(pc.KEY_S)) {
        x -= forward.x;
        z -= forward.z;
    }
    
    
    
  

    this.moveSpeed = app.keyboard.isPressed(pc.KEY_SHIFT) ? this.runSpeed : this.walkSpeed; 
    
    let groundVelocity = pc.Vec3.ZERO;
    if ((x !== 0 || z !== 0)){ //&& this.checkIfOnGround()) {
        let onGroundSpeed = this.checkIfOnGround() ? 1 : 0.4;
        this.force.set(x, 0, z).normalize().scale(this.moveSpeed * onGroundSpeed);
        let flatSpeed = Utils3.flattenVec3(this.entity.rigidbody.linearVelocity).length();
        if (flatSpeed <= this.maxSpeed ){
            const velocityLerpSpeed = 1;
            const targetVel = this.force;
            groundVelocity = this.entity.rigidbody.linearVelocity;
            groundVelocity = new pc.Vec3().lerp(groundVelocity,targetVel,velocityLerpSpeed);
            //console.log('vel:'+vel.trunc()+', target:'+targetVel.trunc());
            // this.entity.rigidbody.applyForce(this.force);
        }
    }

    let jumped = false;
    if (app.keyboard.isPressed(pc.KEY_SPACE)) {
        if (this.ghostMode){
            let boost = app.keyboard.isPressed(pc.KEY_SHIFT) ? 1 : .1;
            this.entity.translate(0,boost,0);
        } else if (this.checkIfOnGround() && this.jumpTimer <= 0){
            this.playerGraphics.anim.setTrigger("jump");
            this.playerGraphics.anim.layers[0].activeStateCurrentTime = 1;
            jumped = true;
            this.jumpTimer = this.jumpInterval;
        }
    }
    const ct = this.playerGraphics.anim.layers[0].activeStateCurrentTime.toFixed(2);
//    if (ct > 0.8 && ct < 1.1) console.log('ct:'+ct);
//    Game.debugText.text = this.playerGraphics.anim.getInteger('state')+" : "+ct;
    if (this.ghostMode){
        this.force.set(x, 0, z).normalize().scale(this.moveSpeed * this.ghostBonus * dt);
        this.entity.translate(this.force.x,this.force.y,this.force.z);
    } else if (this.checkIfOnGround()){
        const ySpeed = jumped ? this.jumpPower : this.entity.rigidbody.linearVelocity.y;
        const airVelocity = new pc.Vec3(0,ySpeed,0);
        const finalVel = new pc.Vec3().add2(groundVelocity,airVelocity);
        this.entity.rigidbody.linearVelocity = finalVel;
    }
    this.entity.rigidbody.linearDamping = this.checkIfOnGround() == true && !jumped ? 0.82 : 0; 

    // sometimes we fall too fast and as a result we pass through important colliders like the ground
    // hacky solution is to detect our y speed and implement an increasing linear damping over that so that we fall slower and dont exceed

    let maxFallVel = -40;
    if (this.entity.rigidbody.linearVelocity.y < maxFallVel) {
        let amountOverMax = Math.abs(this.entity.rigidbody.linearVelocity.y) + maxFallVel;
        let fallDampSpread = 10;
        this.entity.rigidbody.linearDamping = Math.lerp(0.82,2.0,amountOverMax/fallDampSpread);
     }
//    console.log("y vel:"+this.entity.rigidbody.linearVelocity.y);

};
ThirdPersonController.prototype.onMouseDown = function (e) {
    if (Player.entity.enabled && this.entity.enabled) {
        Mouse.LockCursor();
    }
}

ThirdPersonController.prototype.onMouseMove = function (e) {
    if (pc.Mouse.isPointerLocked() == false) return;
    this.eulers.y -= this.lookSpeed * e.dx;
    this.eulers.x -= this.lookSpeed * e.dy;
    this.eulers.x %= 360;
    // clamp btw -21 and 47
    let min = this.lookDownMax; // -41;
    let max = this.lookUpMax; //46;
    this.eulers.x = clamp(this.eulers.x,min,max); 
};

ThirdPersonController.prototype.preventTerrainFall = function(){
    // return;    // performance todo mask by rigidbody bodygroup https://forum.playcanvas.com/t/raycast-question/13770/10
    var from = this.entity.getPosition();
    var to = new pc.Vec3().add2(from,new pc.Vec3(0,-20,0));

    // Raycast between the two points and return the closest hit result
    var results = this.app.systems.rigidbody.raycastAll(from, to);

    // If there was a hit, store the entity
    for (var i in results) {
        let result = results[i];
        for(var i in Game.terrains){
            let ter = Game.terrains[i];
            if (result.entity.getGuid()  == ter.getGuid()){
                let hitPoint = result.point;
                let pp = Game.player.getPosition();
                let dist = new pc.Vec3().sub2(hitPoint,pp).length();
                console.log("d:"+dist);
                
            }
        }
    }
    // console.log('noground, nohit');
}

ThirdPersonController.prototype.checkIfOnGround = function () {
   var from = this.entity.getPosition();
    var to = new pc.Vec3().add2(from,new pc.Vec3(0,-1.05,0));
    // Raycast between the two points and return the closest hit result
    var result = this.app.systems.rigidbody.raycastFirst(from, to);

    // If there was a hit, store the entity
    if (result) {
        var dist = Math.abs(result.point.y - from.y);
        if (dist > 1.8) {
            // console.log('noground, dist:'+dist);
            return false;}
        else return true;
    }
    // console.log('noground, nohit');
    return false;
}; 
