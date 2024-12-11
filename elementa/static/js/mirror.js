var Mirror = {
    objects : [],
    addToMirrorPool(sourceEntity,staticObjSource,staticObjTarget){ 
        const newObj = sourceEntity.clone();
        pc.app.root.addChild(newObj);
        newObj.stripBehaviors();
        const sourceTracker = new pc.Entity("sourceTracker");
        staticObjSource.addChild(sourceTracker);
        const targetTracker = new pc.Entity("targetTracker");
        staticObjTarget.addChild(targetTracker);
        const newMirroredObject = {
            entity : newObj,
            sourceEntity : sourceEntity,
            staticObjSource : staticObjSource,
            staticObjTarget : staticObjTarget,
            sourceTracker : sourceTracker,
            targetTracker : targetTracker,
        }
        this.objects.push(newMirroredObject);
    },
    update(dt){
        this.objects.forEach(x => {
            const d = pc.Vec3.distance(x.sourceEntity.getPosition(),x.staticObjSource.getPosition()) ;
            if (d < 15){
                if (!x.entity.enabled) x.entity.enabled = true;
                // Match source to main cam rot and pos
                x.sourceTracker.setPosition(x.sourceEntity.getPosition());
                x.sourceTracker.setRotation(x.sourceEntity.getRotation()); 
                
                // Set target locals equal to source locals
                x.targetTracker.setLocalPosition(x.sourceTracker.getLocalPosition());
                x.targetTracker.setLocalRotation(x.sourceTracker.getLocalRotation());

                // Match our follow object (this entity) to target globals
                x.entity.setPosition(x.targetTracker.getPosition());
                x.entity.setRotation(x.targetTracker.getRotation());
            } else if (x.entity.enabled) {
                
                x.entity.enabled = false;
            }
        }); 
    },
}

    
