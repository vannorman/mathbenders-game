// Superclass of all Realm builder modes. Any new realm builder mode should extend this class
export default class RealmBuilderMode {

    constructor(params) {
        this.realmBuilder = params.realmBuilder;
    }

    onMouseMove() {
      console.log('super onMouseMove', this.constructor.name); 
    }

    onMouseUp() {}

    onMouseDown() {}

    onMouseScroll() {}

    onEnter() { console.log('preparation code for mode'); }

    onExit() { console.log('clean up code to run'); }

}
