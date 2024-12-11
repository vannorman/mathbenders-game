var RealmBuilderUndoRedo = {
//    previousStatesRegistry : [], // undo/Redo
//    futureStatesRegistry : [], // Undo/redo - "kernel" or sky state is between these two arrays in time series
    /*
    // ========================   
    //      Undo and Redo
    // ========================   
    CaptureAndRegisterState(){
        const state = {
            objects : []
        }
        this.PlacedObjects.forEach(item=>{
            const objData = {
                position : item.entity.getPosition().trunc(), // todo: JSONify it
                rotation : item.entity.getRotation().trunc(),
                templateName : item.templateName,
            }
            state.objects.push(objData);
        });
        let prevState = this.previousStatesRegistry[this.previousStatesRegistry.length-1];
        if (JSON.stringify(prevState) === JSON.stringify(state)){
            // state didn't change, don't update it.
        } else {
            this.previousStatesRegistry.push(state);

        }
    },
    Undo(){
        if (this.previousStatesRegistry.length > 0){
            let prevState = this.previousStatesRegistry.pop(); 
            this.futureStatesRegistry.push(prevState);
            this.LoadState(prevState);
        }
    },
    Redo(){
        if (this.futureStatesRegistry.length > 0){
            let nextState = this.futureStatesRegistry.pop();
            this.previousStatesRegistry.push(nextState);
            this.LoadState(nextState);
        }
    },

    LoadState(state){
        console.log("load state:"+JSON.stringify(state));
        // Clear all existing objects 
        this.PlacedObjects.forEach(x=>{x.entity.destroy();}); // breaks when comparing "in-game" entities vs "in-memory" placed items
        this.PlacedObjects = [];
        state.objects.forEach(x=>{
            const entity = this.InstantiateObjectForBuilder({template:x.templateName});
            entity.setRotation(new pc.Quat(x.rotation.x,x.rotation.y,x.rotation.z,x.rotation.w));
            entity.setPosition(new pc.Vec3(x.position.x,x.position.y,x.position.z));
        });

    },
    */



}
