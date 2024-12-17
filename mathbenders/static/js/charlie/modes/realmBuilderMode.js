// Superclass of all Realm builder modes. Any new realm builder mode should extend this class
export default class RealmBuilderMode {

    constructor(params) {
        this.realmEditor = params.realmEditor;
    }

    onMouseMove() {
    //  console.log('superc onMouseMove', this.constructor.name); 
    }

    onMouseUp() {}

    onMouseDown() {}

    onMouseScroll() {}

    onEnter() { 
        console.log('preparation code for mode'); 
    }

    onExit() { 
        console.log('clean up code to run'); 
    }

}
