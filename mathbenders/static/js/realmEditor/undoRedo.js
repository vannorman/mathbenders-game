export default class UndoRedo  {

    #undoBtn;
    #redoBtn;
    #previousStatesRegistry=[];
    #futureStatesRegistry=[];
    
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
                $this.Undo();
            }, 
            cursor:'pointer',
            textureAsset:assets.textures.ui.builder.undo,
        });
        this.#redoBtn = UI.SetUpItemButton({
            parentEl:this.realmEditor.gui.mapPanel,
            width:45,height:45,
            anchor:[0.2, 0.02, 0.2, 0.02],
            pivot:[0.5,0],
            mouseDown:function(){
                $this.Redo();
            }, 
            cursor:'pointer',
            textureAsset:assets.textures.ui.builder.redo,
        });

 
 

    }
    
    CaptureAndRegisterState(){
        const state = JSON.parse(JSON.stringify(realmEditor.currentLevel)).templateInstances;
        let prevState = this.#previousStatesRegistry[this.#previousStatesRegistry.length-1];
        if (JSON.stringify(prevState) === JSON.stringify(state)){
            // state didn't change, don't update it.
        } else {
            this.#previousStatesRegistry.push(state);
        }
    }
    Undo(){
        if (this.#previousStatesRegistry.length > 0){
            let prevState = this.#previousStatesRegistry.pop(); 
            this.#futureStatesRegistry.push(prevState);
            this.LoadState(prevState);
        }
    }
    Redo(){
        if (this.#futureStatesRegistry.length > 0){
            let nextState = this.#futureStatesRegistry.pop();
            this.#previousStatesRegistry.push(nextState);
            this.LoadState(nextState);
        }
    }

    LoadState(state){
        // Note: "state" == "realmEditor.levels[x].templateInstances"
        console.log("load state:"+JSON.stringify(state));
        // Clear all existing objects 
        realmEditor.currentLevel.ClearPlacedTemplateInstances();

        JsonUtil.cleanJson(JSON.stringify(state)).forEach(x=>{
            let obj = this.realmEditor.InstantiateTemplate({
                level:realmEditor.currentLevel,
                ItemTemplate:templateNameMap[x.templateName],
                properties:x.properties,
                position:x.position.add(realmEditor.currentLevel.terrain.centroid),
                rotation:x.rotation,
                captureState:false,
            });
            // this.CaptureAndRegisterState();

        });

    }



}
