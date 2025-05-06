// Hotkeys for debug. X, C, G, U, etc.
var showPositions = false;
var shownPositions = [];
pc.app.on("update", function (dt) {
    shownPositions.forEach(x=>{
        if (x && x.element){
            x.element.text = x.getPosition().trunc();

        }

    });

    if (Game && Game.axis && pc.app.keyboard.wasPressed(pc.KEY_A) && pc.app.keyboard.isPressed(pc.KEY_CONTROL)) { 
        Game.axis.enabled = !Game.axis.enabled;
        Game.axisText.enabled = !Game.axisText.enabled;
        Game.axis.moveTo(Game.Player.getPosition().add(new pc.Vec3(1,1,1))); 
    }

});

Game.performanceLevel = 0;

$(document).on("keydown", function (e) {
    if (moveMode){
        const d = pc.app.keyboard.isPressed(pc.KEY_SHIFT) ? 0.5 : 0.05;
        if (pc.app.keyboard.wasPressed(pc.KEY_Q)){
            mo.y += d;
            moo.setLocalPosition(mo);
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_A)){
            mo.y -= d;
            moo.setLocalPosition(mo);
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_LEFT)){
            mo.x -= d;
            moo.setLocalPosition(mo);
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_RIGHT)){
            mo.x += d;
            moo.setLocalPosition(mo);
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_UP)){
            mo.z += d;
            moo.setLocalPosition(mo);
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_DOWN)){
            mo.z -= d;
            moo.setLocalPosition(mo);
        }
 
    }
    if (rotateMode){
        const d = pc.app.keyboard.isPressed(pc.KEY_SHIFT) ? 45 : 5;
        if (pc.app.keyboard.wasPressed(pc.KEY_LEFT)){
            ro.y -= d;
            roo.setLocalEulerAngles(ro);
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_RIGHT)){
            ro.y += d;
            roo.setLocalEulerAngles(ro);
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_UP)){
            ro.x += d;
            roo.setLocalEulerAngles(ro);
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_DOWN)){
            ro.x -= d;
            roo.setLocalEulerAngles(ro);
        }
 
    }
    if (moveAnchorMode){
        const d = pc.app.keyboard.isPressed(pc.KEY_SHIFT) ? 0.05 : 0.01;
        if (pc.app.keyboard.wasPressed(pc.KEY_LEFT)){
            ma[0] -= d;
            ma[2] -= d;
            mao.anchor = ma;
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_RIGHT)){
            ma[0] += d;
            ma[2] += d;
            mao.anchor = ma;
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_UP)){
            ma[1] += d;
            ma[3] += d;
            mao.anchor = ma;
        }

        if (pc.app.keyboard.wasPressed(pc.KEY_DOWN)){
            ma[1] -= d;
            ma[3] -= d;
            mao.anchor = ma;
        }
    }

    if (pc.app.keyboard.isPressed(pc.KEY_SHIFT) && pc.app.keyboard.wasPressed(pc.KEY_P)){
        console.log(ma)
    }


    if (pc.app.keyboard.wasPressed(pc.KEY_1) && pc.app.keyboard.isPressed(pc.KEY_C)) { 

        // Press C1 to place wall in front
        const p = Game.player.getPosition();
        const dir = Camera.main.entity.parent.forward.flat().normalize();
        const left = Camera.main.entity.parent.left.flat().normalize();
        const right = Camera.main.entity.parent.right.flat().normalize();
        const leftPos = p.clone().add(dir.clone().mulScalar(5)).add(left.clone().mulScalar(10)).trunc();
        const rightPos= p.clone().add(dir.clone().mulScalar(5)).add(right.clone().mulScalar(9.75)).trunc();
        const rot = Quaternion.LookRotation( Camera.main.entity.forward.flat()).getEulerAngles().trunc();
        const leftCubeOptions ={
            position:leftPos, 
            rotation:rot, 
            scale:new pc.Vec3(15,8,1)
        }
        const rightCubeOptions = {
            position:rightPos,
            rotation: rot, 
            scale:new pc.Vec3(15,8,1)
        }
        const leftCube = Utils.Cube(leftCubeOptions);
        const rightCube = Utils.Cube(rightCubeOptions);
        
        const numberWallPos = p.clone().add(dir.clone().mulScalar(5)).add(right.clone().mulScalar(-1.75));
        const numberWallOptions = {
            position: numberWallPos,
            rotation:rot,
            x:4,y:3,z:1, 
        }
        Game.Instantiate[Constants.Templates.NumberWall]({position:numberWallPos,rotation:rot.eulerAngles});

        const faucetPos = p.clone().add(dir.clone().mulScalar(2)).add(right.clone().mulScalar(4)).add(new pc.Vec3(0,-0.5,0));
        const faucetOptions = {
            position: faucetPos,
            rotation:new pc.Vec3(-90,0,0),
            fraction:new Fraction(-1,1),
        }
       Game.Instantiate.faucet(faucetOptions); 

    }


    
    var numOpts = { position : Player.droppedPosition,  numberInfo : { fraction : { numerator:-1, denominator:1 }, } };

    if (pc.app.keyboard.isPressed(pc.KEY_CONTROL)) { 
        if (pc.app.keyboard.wasPressed(pc.KEY_P)){
            // move anchor mode activated.
            moveMode = !moveMod;
            console.log("Rotate:"+moveMode);
            
        }
         if (pc.app.keyboard.wasPressed(pc.KEY_R)){
            // move anchor mode activated.
            rotateMode = !rotateMode;
            console.log("Rotate:"+rotateMode);
            
        }
         if (pc.app.keyboard.wasPressed(pc.KEY_M)){
            // move anchor mode activated.
            moveAnchorMode = !moveAnchorMode;
            console.log("Move anchor:"+moveAnchorMode);
            
        }
        if (pc.app.keyboard.wasPressed(pc.KEY_1)){
            numOpts.numberInfo.fraction.numerator = 1; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -1; Game.Instantiate.NumberSphere(numOpts);
        }
         if (pc.app.keyboard.wasPressed(pc.KEY_2)){
            numOpts.numberInfo.fraction.numerator = 2; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -2; Game.Instantiate.NumberSphere(numOpts);
        }
         if (pc.app.keyboard.wasPressed(pc.KEY_3)){
            numOpts.numberInfo.fraction.numerator = 3; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -3; Game.Instantiate.NumberSphere(numOpts);
        }
         if (pc.app.keyboard.wasPressed(pc.KEY_4)){
            numOpts.numberInfo.fraction.numerator = 4; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -4; Game.Instantiate.NumberSphere(numOpts);
        }
         if (pc.app.keyboard.wasPressed(pc.KEY_5)){
            console.log('20');
            numOpts.numberInfo.fraction.numerator = 20; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -20; Game.Instantiate.NumberSphere(numOpts);
        }
         if (pc.app.keyboard.wasPressed(pc.KEY_6)){
            console.log('50');
            numOpts.numberInfo.fraction.numerator = 50; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -50; Game.Instantiate.NumberSphere(numOpts);
        }
         if (pc.app.keyboard.wasPressed(pc.KEY_7)){
            console.log('100');
            numOpts.numberInfo.fraction.numerator = 100; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -100; Game.Instantiate.NumberSphere(numOpts);
        }
          if (pc.app.keyboard.wasPressed(pc.KEY_8)){
            console.log('500');
            numOpts.numberInfo.fraction.numerator = 500; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -500; Game.Instantiate.NumberSphere(numOpts);
        }
          if (pc.app.keyboard.wasPressed(pc.KEY_9)){
            console.log('2000');
            numOpts.numberInfo.fraction.numerator = 2000; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -2000; Game.Instantiate.NumberSphere(numOpts);
        }
           if (pc.app.keyboard.wasPressed(pc.KEY_0)){
            console.log('10000');
            numOpts.numberInfo.fraction.numerator = 10000; Game.Instantiate.NumberSphere(numOpts);
            numOpts.numberInfo.fraction.numerator = -10000; Game.Instantiate.NumberSphere(numOpts);
        }
    }

    let ee = String.fromCharCode(e.which);

    // other places keydown is detected and handled is 
    // fogShader
    // thirdPersonController
    // inGameGui

    let shiftKey = e.shiftKey
    if (pc.app.keyboard.isPressed(pc.KEY_V)){ 
        // view debug handled in claudeFogOutlineShader.js
    }
    if (pc.app.keyboard.isPressed(pc.KEY_C)){ 
        // cam swap is handled in thirdPersonController.js

    }
    if (ee == '0'){
        Game.worldAngryA /= 2.0;
        console.log("A: "+Game.worldAngryA);
        // good value is B 0.16 A .05
        // if A lerp from 0 to 0.5 and back it's nice
    } 
    if (ee == 'P'){
        Game.performanceLevel ++;

        switch(Game.performanceLevel){
            case 0: 
                Camera.main.entity.script.create('groundFogShader'); // This is where fog gets added as fog is part of this shader.
                break;  // was already here on start so this isn't the first thing that happens when you press P.
            case 1: 
                Levels.CreateAlienWorld1();
                break;
            case 2: 
                Levels.CreateManifold1();
                break;
            case 3:
                Levels.CreatePerlinHills();
                break;

            default:break;
        }
        Game.debugText.text = "Perf:"+Game.performanceLevel;
//        showPositions = !showPositions;
//        if (showPositions) {
//            pc.app.root.getComponentsInChildren('networkObjectInfo').forEach(x=>{
//                const showPos = Utils.AddTextFloater({
//                    floaterOffset:new pc.Vec3(0,2.0,0),color:new pc.Color(1.0,0.8,0.8),
//                    text:"pos",parent:x.entity,localPos:pc.Vec3.ZERO,scale:0.07})
//                shownPositions.push(showPos);
//            });
//
//        } else {
//            shownPositions.forEach(x => x.destroy());
//            shownPositions = [];
//        }
        
    }
     if (ee == 'F'){
        const num = pc.app.keyboard.isPressed(pc.KEY_CONTROL) ? -1000 : -2;
        const options = {
            position : Player.droppedPosition,
            properties : {
                NumberSphere : new Fraction(num,1),
            }
        }
        const ns = new NumberSphere(options);
        
    }
     if (ee == 'G'){

//        let cw = new CastleWallFormed({position:Player.droppedPosition}); 
//        cw.formToTerrain();
//        pc.app.root.getComponentsInChildren('cameraWallHandler')[0].enabled=false;
            let p = new CastleTurret({position:Player.droppedPosition});

        
    }
    if (ee == 'Z'){
        // wont be pickupabble because not network instantiate.
  //      let p = player.droppedPosition;
//        cb = Game.Instantiate.NumberCube({position:p});
    }
    if (ee == 'C'){
        const num = pc.app.keyboard.isPressed(pc.KEY_CONTROL) ? 1000 : 2;
        const frac = new Fraction(-num,1);
        const options = {
            position : Player.droppedPosition,
            properties : {
                NumberSphere : frac
            }
        } 
        const ns = new NumberSphere(options);
      }
     if (ee == 'X'){
        const num = pc.app.keyboard.isPressed(pc.KEY_CONTROL) ? 1000 : 2;
        const frac = new Fraction(num,1);
        const options = {
            position : Player.droppedPosition,
        } 
        const ns = new NumberSphere(options);
     }
    if (ee == 'M'){
        const p = Player.droppedPosition;
        const r = new pc.Vec3(270,0,0);
        const m = new MultiblasterPickup({position:p});
//        Game.Instantiate.multiblaster({position:p,rotation:r});
    }
    if (ee == 'B'){
//        let p = Player.droppedPosition;
//        cb = Game.bow(p);
        let rp = function(){ return pc.Vec3.onUnitSphere().flat()}; 
        let numTrees = 10;
        window.batchGroup = pc.app.batcher.addGroup("Trees", false, 200);
        window.trees = [];
        for (i=0;i<numTrees;i++){
            let a = new Tree1({position:Player.entity.getPosition().add(rp().mulScalar(Math.random()*20))});
            window.trees.push(a);
        }

        setTimeout(function(){
            console.log('bg');
            for (i=0;i<numTrees;i++){
                window.trees[i].entity.children[0].render.batchGroupId=0
            }
        },10);


    }
    if (ee == 'N'){

    }
    if (ee == 'L'){
        let p=Player.droppedPosition.clone().add(pc.Vec3.UP);
        cb = Game.Instantiate.spikey();
        cb.moveTo(p);
    }
    if (ee == 'R'){
        realmEditor.RealmData.Levels.forEach(lev=>{
            lev.templateInstances.forEach(t=>{
                if (t.wall) t.wall.enabled = !t.wall.enabled;
            });
        });
    }
    if (ee == 'V'){
        const p = Player.droppedPosition.clone().add(pc.Vec3.UP);
        const r = new pc.Vec3(-180,0,0);
        let s = new SwordPickup({position:p})
    }
    if (ee == 'K'){
        console.log('killall');
        Game.inventory.killAll();
        Network.killAll();
        pc.app.root.getComponentsInChildren('numberInfo').filter(x=>{x.entity.rigidbody.type != pc.RIGIDBODY_TYPE_KINEMATIC }).forEach(x=>{x.destroy()});
    }
    if (ee == 'N'){
//        let p=player.droppedPosition.clone().add(pc.Vec3.UP);
  //      cb = Game.Instantiate.sheep({position:p});
//        Game.organic1.seed = Math.random();
  //      Game.organic1.Rebuild();
        
   }
    // Terrain randomization controls?
//    if (ee == '5'){ Game.organic1.numPoints += 10; Game.organic1.Rebuild(); }
//    if (ee == 'T'){ Game.organic1.numPoints -= 10; Game.organic1.Rebuild(); }
//    if (ee == '6'){ Game.organic1.minPointDist += 0.5; Game.organic1.Rebuild(); }
//    if (ee == '7'){ Game.organic1.linesPerPointMax += 1; Game.organic1.Rebuild(); }
//    if (ee == 'U'){ Game.organic1.linesPerPointMax -= 1; Game.organic1.Rebuild(); }
    if (ee == 'Y'){
        if (GameManager.state == GameState.RealmBuilder){
            GameManager.setState(GameState.Playing);
        } else {
            GameManager.setState(GameState.RealmBuilder);

        }
    }
   if (ee == 'J'){
        cb.rotate(new pc.Vec3(0,45,0)); 
        console.log(cb.forward.trunc()+","+cb.right.trunc()+","+cb.up.trunc());
    }
    if (ee == ')'){
        
        // Inverse transform test. Note rigidbody sync needed.
        let a = Cube(Player.droppedPosition2);
        let p = Player.droppedPosition2.clone().add(pc.Vec3.RIGHT);
        let b = Utils.Cubec(p,pc.Color.BLUE);
     //   let b = Cube(p);
        b.reparent(a);
        b.rigidbody.teleport(p);
        a.rigidbody.teleport(a.getPosition(),new pc.Vec3(0,45,0))
        b.rigidbody.syncEntityToBody();
        pc.app.root.addChild(a);
        cb=b;
    }
     if (ee == 'Y'){ if (the_rotated) { rx+=45; the_rotated.setLocalEulerAngles(rx,ry,rz);}} 
     if (ee == 'U'){ if (the_rotated) { ry+=45; the_rotated.setLocalEulerAngles(rx,ry,rz);}} 
     if (ee == 'I'){ if (the_rotated) { rz+=45; the_rotated.setLocalEulerAngles(rx,ry,rz);}} 


});

const Generator = {
    organic1 : {
        // Neat lil fn builds an organic random looking garden wall thingie
        numPoints : 100,
        minPointDist : 3,
        linesPerPointMin : 1, 
        linesPerPointMax : 5,
        Rebuild () {
            Game.cubesParent.destroy();
            const options = {
                seed : Game.organic1.seed,
                numPoints : Game.organic1.numPoints,
                minPointDist : Game.organic1.minPointDist,
                linesPerPointMin : Game.organic1.linesPerPointMin, 
                linesPerPointMax : Game.organic1.linesPerPointMax,
                centroid:new pc.Vec3(50,-4,5050),
            }
            Utils.LinesWithinPlane(options);
            console.log('rebuild:'+JSON.stringify(options));
     
        },
        seed : 0.0,

    },
 
}

const ma = [0,0,0,0]
var moveAnchorMode = false;
const ro = new pc.Vec3(0,0,0);
var rotateMode = false;
const mo = new pc.Vec3(0,0,0);
var moveMode = false;

const r = {
    get o(){ return realmEditor.currentLevel.templateInstances[0]; }
}

let rx=ry=rz=0;
let the_rotated=null;
function Rotate(e){
    the_rotated=e;
}
