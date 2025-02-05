/*class PlayerCollisionDetector {
    // Should I be broadcasting on every collision?
    // Or only on collided with "playerpickup" script?
    // PlayerPickup script which lives on entities should be the one broadcasting ... 
    constructor(){
        this.listeners = [];
    }
    playerCollidedWtih(obj){
        this.collidedObject = obj;
        this.notifyListeners();

    }

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
        }
    }

    notifyListeners() {
        this.listeners.forEach(({ listener, callback }) => {
         //   console.log("calling "+callback+" on  "+listener);
            callback.call(listener, this.collidedObj);
        })
    }

    subscribe(listener, callback) {
        this.listeners.push({ listener, callback });
    }

    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    } 
}
*/
