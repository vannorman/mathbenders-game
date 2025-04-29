export default class UndoRedo  {

    #undoBtn;
    #redoBtn;
    #previousStatesRegistry=[];
    get prevStatesLn() {return this.#previousStatesRegistry.length;};
    #futureStatesRegistry=[];
    get futureStatesLn() {return this.#futureStatesRegistry.length;};
    #currentState;
    enabled;    
    constructor(opts={}){
        const {realmEditor}=opts;
        this.realmEditor=realmEditor;
        const $this = this;
        this.#undoBtn = UI.SetUpItemButton({
            parentEl:this.realmEditor.gui.mapPanel,
            width:45,height:45,
            anchor:[0.08, 0.02, 0.08, 0.02],
            pivot:[0.5,0],
            mouseDown:function(){
                if ($this.enabled){
                    $this.Undo();
                }
            }, 
            cursor:'pointer',
            textureAsset:assets.textures.ui.builder.undo,
            hoverValidationFn:()=>{return $this.prevStatesLn > 0},
        });
        this.#redoBtn = UI.SetUpItemButton({
            parentEl:this.realmEditor.gui.mapPanel,
            width:45,height:45,
            anchor:[0.2, 0.02, 0.2, 0.02],
            pivot:[0.5,0],
            mouseDown:function(){
                if ($this.enabled){
                    $this.Redo();
                }
            }, 
            cursor:'pointer',
            textureAsset:assets.textures.ui.builder.redo,
            hoverValidationFn:()=>{return $this.futureStatesLen > 0},
        });


        // Hacky and simple way to capture states
        // Every mouse up and mouse down, UNLESS we're on the UNDO/REDO buttons.
        pc.app.mouse.on(pc.EVENT_MOUSEDOWN, function(){
            if (this.enabled && !Mouse.isMouseOverEntity(this.#undoBtn) && !Mouse.isMouseOverEntity(this.#redoBtn)){
                //this.CaptureAndRegisterState()
            }
        }, this);
        pc.app.mouse.on(pc.EVENT_MOUSEUP, function(){
            if (this.enabled && !Mouse.isMouseOverEntity(this.#undoBtn) && !Mouse.isMouseOverEntity(this.#redoBtn)){
                // this.CaptureAndRegisterState()
            }
        }, this);
        
        GameManager.subscribe(this,this.onGameStateChange);


    }
    onGameStateChange(state) {
        switch(state){
        case GameState.RealmBuilder:
            this.enabled=true;
            break;
        case GameState.Playing:
            this.enabled=false;
            break;
        }
    } 
    captureCurrentState(){
        this.#currentState =  JsonUtil.cleanJson(JSON.stringify(this.realmEditor.currentLevel)).templateInstances;
    }
    CaptureAndRegisterState(){
        let lastCur = this.#currentState == undefined ? [] : JSON.parse(JSON.stringify(this.#currentState));
        let newCur = JSON.stringify(JsonUtil.cleanJson(JSON.stringify(this.realmEditor.currentLevel)).templateInstances);
        let prevState = JSON.stringify(this.#previousStatesRegistry[this.#previousStatesRegistry.length-1]);
        this.captureCurrentState();
        if (newCur === JSON.stringify(lastCur)){
            // The state didn't change. Do nothing.
        } else if (prevState === newCur){
            // The current state is already stored as the last saved state. Do nothing.
        } else {
            // The current state changed, and is not equal to the last saved state. 
            // Push the old current state into prev states
            // Save the new current state
            this.#previousStatesRegistry.push(lastCur);
            this.logStates();

        }
        this.updateBtnGfx();

    }
    Undo(){
        if (this.#previousStatesRegistry.length > 0){
            let prevState = this.#previousStatesRegistry.pop(); 
            this.#futureStatesRegistry.push(this.#currentState);
            this.LoadState(prevState);
            this.captureCurrentState();
        }
        this.updateBtnGfx();
        this.logStates();
    }
    Redo(){
        if (this.#futureStatesRegistry.length > 0){
            let nextState = this.#futureStatesRegistry.pop();
            this.#previousStatesRegistry.push(this.#currentState);
            this.LoadState(nextState);
            this.captureCurrentState();
        }
        this.updateBtnGfx();
        this.logStates();
    }

    updateBtnGfx(){
        // 
        if (this.#previousStatesRegistry.length == 0) {
           this.#undoBtn.element.color = pc.Color.GRAY; 
        }else{
           this.#undoBtn.element.color = pc.Color.WHITE; 
        }
        if (this.#futureStatesRegistry.length == 0){
           this.#redoBtn.element.color = pc.Color.GRAY; 

        } else {
           this.#redoBtn.element.color = pc.Color.WHITE; 

        }
    }

    logStates(){
        let a = "";
        this.#previousStatesRegistry.forEach(x=>{a+="["+x.length+"],";});
        a += " >["+this.#currentState?.length+"]<, ";
        this.#futureStatesRegistry.forEach(x=>{a+="["+x.length+"],";})
        // console.log(a);

    }

    LoadState(state){
        // Note: "state" == "realmEditor.levels[x].templateInstances"
        // Clear all existing objects 
        realmEditor.currentLevel.ClearPlacedTemplateInstances();

        JsonUtil.cleanJson(JSON.stringify(state)).forEach(x=>{
            let obj = this.realmEditor.InstantiateTemplate({
                level:realmEditor.currentLevel,
                ItemTemplate:templateNameMap[x.templateName],
                properties:x.properties,
                position:x.position.add(realmEditor.currentLevel.terrain.centroid),
                rotation:x.rotation,
            });
            // this.CaptureAndRegisterState();

        });


    }



}
