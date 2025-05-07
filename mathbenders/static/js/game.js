GameState = Object.freeze({
    None : 'None',
    RealmBuilder : 'RealmBuilder',
    Playing : 'Playing',
});


class Listener {
    constructor(){
        this.state = 'NONE';
        this.listeners = [];
    }

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            // console.log("notify:"+this.listeners.length+" from:"+this.constructor.name);
            this.notifyListeners();
        }
    }

    notifyListeners() {
        this.listeners.forEach(({ listener, callback }) => {
            callback.call(listener, this.state);
        })
    }

    subscribe(listener, callback) {
        this.listeners.push({ listener, callback });
    }

    unsubscribe(listener) {
        this.listeners = this.listeners.filter(x => {return x.listener != listener});
    } 
}
class GameManagerClass extends Listener {
    // tODO: Use a game namespace such as Game.GameManager then window.GameManager = new Game.GameManager
    constructor(){
        super();
        this.state = GameState.None;
        this.listeners = [];
    }
    setState(state){}

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.notifyListeners();
        }
    }

    notifyListeners() {
        this.listeners.forEach(({ listener, callback }) => {
         //   console.log("calling "+callback+" on  "+listener);
            callback.call(listener, this.state);
        })
    }

    subscribe(listener, callback) {
        this.listeners.push({ listener, callback });
    }

    unsubscribe(listener) {
        this.listeners = this.listeners.filter(x => {return x.listener != listener});
    } 
}

window.GameManager = new GameManagerClass();

var Game = {
    _sun : null,
    get sun(){
        if(!Game._sun) {
            const light = new pc.Entity("Sun (DirectionalLight)");
            light.addComponent("light", {
                type: "directional",
                color: new pc.Color(1, 1, 1),
                castShadows: true,
                intensity:1.6,
                shadowBias:0.5,
                shadowResolution:2048,
            });
            light.setLocalEulerAngles(45, 30, 0);
            pc.app.root.addChild(light);
            Game._sun = light;
        }
        return Game._sun;
    },
    get sunDir() { return Game.sun.up; },
    
   LoadGame(){
        pc.app.systems.rigidbody.gravity.set(0, -25, 0); // -20 seems to work better than default -9.8 
        window.Mouse = new MouseClass();
        let fpsMeter = new DebugFps();
        let uiCam = new UiCamera();
        this.uiCam = uiCam;
        // let debug = new pc.Entity();
        // debug.addComponent('script'); debug.script.create('debugPhysics'); this.debug = debug.script.debugPhysics;

    },
    printLoadTime(color,message){
        var loadTime = Date.now() - Game.startTime; 
        console.log("%c LOADED: "+loadTime+" "+message,"color:"+color);
        //window.performance.timing.domContentLoadedEventEnd- window.performance.timing.navigationStart;
    },
    startTime : Date.now(),
}

    const assetListLoader = new pc.AssetListLoader(
        Utils2.getFlatObjectValues(assets),
        pc.app.assets
    );
    Game.printLoadTime('green',"game.js start load assets");
    assetListLoader.load(() => { 
        Game.printLoadTime('red',"game.js assets done");
        Game.LoadGame(); 
    }); 
    $('#loading').hide();
