class DebugAxis {
    constructor(){
        // Game.axis = Game.Instantiate.axis({position:Game.player.getPosition()})
        // Game.axis.setLocalScale(.0005,.0005,.0005);
        
        


        // Hover text displaying the position of the axis at all times.
        let options = {
            floaterOffset:new pc.Vec3(0,2.0,0),
            color:new pc.Color(1.0,0.8,0.8),text:"debug",
            parent:Game.axis,
            localPos:pc.Vec3.ZERO,
            scale:0.07
        }
        Game.axisText = Utils.AddTextFloater(options);
        
        // attach a function to the text that will update its position.
//        pc.app.on('update', function(){ 
//           let pos = Game.axis.getPosition();
//            pos = Utils3.TruncVec3(pos);
//            Game.axisText.element.text = pos;
//        });
//        Game.axis.enabled=false;
//        Game.axisText.enabled=false;
    }
}

class DebugFps {
    constructor(){
        Game.fpsMeter = new pc.Entity();
        Game.fpsMeter.addComponent('script');
        Game.fpsMeter.script.create('fpsMeter');
        pc.app.root.addChild(Game.fpsMeter);
    }
}

