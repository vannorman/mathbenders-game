var MachinePortal = pc.createScript('machinePortal');
MachinePortal.attributes.add('group', { type: 'entity' });
MachinePortal.attributes.add('audioManager', { type: 'object' });
MachinePortal.attributes.add('portalSound', { type: 'object' });
MachinePortal.attributes.add('onCrossFn', { type: 'function' });

MachinePortal.prototype.initialize = function () {
    // Note: No rigidbody is needed to detect trigger/collision events
    this.entity.script.create('machineCrossingDetector',{attributes:{
        requiredFn : (x) => {  return ( (x.rigidbody ? x.rigidbody.type == 'dynamic' ? true : false : false) )},
        Cross : this.Cross,
        context : this,
    }});
}

MachinePortal.prototype.Cross = function (options={}){
    console.log("Cross.");
    const { obj,direction=true,context } = options;
    if (direction) {
        // TODO: LevelBuilder flow breaks if you link the unlink two portals; context dest still there; some random pos?
        context.dest = context.group.getComponentsInChildren('portal')[0].dest; // duplicated between "machinePortal" and "portal"
        if (!context.dest) return;

        let pos = context.dest.getPosition();
//        context.onCrossFn(pos,obj);

        let localPos = context.group.worldToLocalPos(obj.getPosition());
        let destPos = context.dest.localToWorldPos(localPos);
        let fudge= new pc.Vec3(0,0.1,0); // i have no idea
        fudge.add(context.dest.forward);
        // console.log(context.group);
        //fudge.add(context.group.script.portalPlane.forward.mulScalar(-1));
        obj.rigidbody.teleport(destPos.add(fudge))
        
        let fromTo = new pc.Quat().setFromDirections(context.group.forward,context.dest.forward);
        let newVel = fromTo.transformVector(obj.rigidbody.linearVelocity);
        obj.rigidbody.stop();
        obj.rigidbody.applyImpulse(newVel);

        // When player traverses, flip portal 180 degrees (so it "faces" the correct way again for re-traversal.)
        // Update: This no longer works when pairing and unpairing "live portals", because we cannot guarantee which side player is on or whether they have traversed already.

        if (obj.getComponentsInChildren('thirdPersonController').length == 1){

            // Note, eulres y must be set in postUpdate or you will see one frame of difference
            let yaw = new pc.Vec3().getYawAngle(context.group.forward,context.dest.forward);
            Player.controller.eulers.y -= yaw;


            // Rotate the portals
//            context.group.children[0].rotate(180); // this shouldn't ever rotate; leave the entrance (first place player encounters) alone
//            context.dest.children[0].rotate(180); // this needs to rotate exactly once at startup and never again so no rotations after that

        }

    } else {
        console.log("bckwds");
    }
    delete(this.crossingObjs[obj.getGuid()]); // "This" refers to the CrossingDetector script instance
}



