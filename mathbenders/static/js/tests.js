class TestManager {
    // DISLIKE having all of the levelData in a single Test object, I should have levelDataTemplates
    delay = ms => new Promise(res => setTimeout(res, ms));

    constructor(){

    }

    async SineTerrain(options) {

        const { testLocation = pc.Vec3.ZERO } = options;
        // const levelData = TestManager.LevelDataTemplates.SineTerrain;
        // const terrain = terrain.Generate(levelData);
        // console.log("Ran:");
        await delay(2000);

        // return [ terrain, testLocation ];
    }
}


