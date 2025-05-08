const TerrainWorldPositions = {
    intToBase2Array(i) {
        let result = [0, 0, 0];
        let value = i;

        for (let index = 2; index >= 0; index--) {
            let digit = value % 2;
            let rollover = Math.floor(value / 8);

            result[index] = digit + rollover;
            value = Math.floor(value / 2);
        }

        return result;
    },
    worldPositionAtTerrainIndex(i){
        let arr = TerrainWorldPositions.intToBase2Array(i);
        let spacing = 5000;
        arr = [arr[0] * spacing, arr[1] * spacing, arr[2] * spacing];
        return new pc.Vec3(arr[0],arr[1],arr[2]);
    }
}

const Materials = {
    createMaterial(color,emissive=new pc.Color(0,0,0)) {
        const material = new pc.StandardMaterial();
        material.diffuse = color;
        material.emissive = emissive;
        // we need to call material.update when we change its properties
        material.update();
        return material;
    },
    createMaterialAlpha(color){
        const material = new pc.StandardMaterial();
        material.emissive = color;
        // we need to call material.update when we change its properties
        material.blendType = pc.BLEND_NORMAL;
        material.opacity = color.a;
        material.update();
        return material;
 
    },
    get red(){ return Materials.createMaterial(new pc.Color(1,0,0))},
    get orange(){ return Materials.createMaterial(new pc.Color(1,.6,.3),new pc.Color(1,0,0))},
    get yellow() { return this.createMaterial(new pc.Color(1, 1, 0))},
    get green() { return this.createMaterial(new pc.Color(0.3, 1, 0.3))},
    get blue() { return this.createMaterial(new pc.Color(0, 0, 1))},
    get liteblue() { return this.createMaterial(new pc.Color(0, 0.4, 1))},
    get liteblue2() { return this.createMaterial(new pc.Color(0, 0.7, 1))},
    get purple(){ return Materials.createMaterial(new pc.Color(1,0,1))},
    get redAlpha(){ return Materials.createMaterialAlpha(new pc.Color(1,0,0,0.25))},
    get gray(){ return this.createMaterial(new pc.Color(0.3, 0.3, 0.3))},
    get darkgray(){ return this.createMaterial(new pc.Color(0.15, 0.15, 0.15))},

    get white() { return this.createMaterial(pc.Color.WHITE )},
    get black() { return this.createMaterial(new pc.Color(00,00,00))},
    get brown() { return this.createMaterial(new pc.Color(0.5,0.2,0.2))},
    createCelMaterial(options = {}) {
    const { isNegative = false } = options;

    const vert = assets.shaders.cel_shader_object_vert.resource;
    const frag = assets.shaders.cel_shader_object_frag.resource;

    const material = new pc.ShaderMaterial({
        vertexCode: vert,
        fragmentCode: frag,
        attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aNormal: pc.SEMANTIC_NORMAL,
            aUv: pc.SEMANTIC_TEXCOORD0
        },
        name: 'celMaterial'
    });

    // Set parameters
    material.setParameter('uSunDir', Game.sunDir.data);//Game.sunDir.clone().normalize().data);
    material.setParameter('uIsNegative', isNegative);
    // Optional texture binding
    // material.setParameter('uTexture', yourTexture.resource);

    // Optional cameraPos usage in shader — not needed in this shader
    pc.app.on('update', () => {
        material.setParameter('uCameraPos', Camera.main.entity.getPosition().data);
    });

    material.update(); // 💥 Important in ShaderMaterial

    return material;
},
   get celWhite() { return this.createCelMaterial()},
    get celBlack() { return this.createCelMaterial({isNegative:true})},
} 


// TODO rename this as Elementa Constants or something other than "Constants"
const Constants = {
    CollisionLayers : {
        FixedObjects : pc.BODYGROUP_USER_1, 
    },
    Layers : {
        Terrain : pc.BODYGROUP_USER_1, // fixed object
        Portal : pc.BODYGROUP_USER_2,
        Walls : pc.BODYGROUP_USER_3,
        Bullets : pc.BODYGROUP_USER_4,
    },
    Tags : {
        Portal : 'Portal',
        BuilderItem : 'BuilderEditableItem',
        Tree : 'Tree',
        Terrain : 'Terrain',
        PlayerCanPickUp : 'PlayerCanPickUp',
        PlayerCanInteract : 'PlayerCanInteract',
//        MultiblasterBullet : 'MultiblasterBullet',
    },
    Templates : {
        // Hmm.. would rather define these as new PlacedItem(name:CastleWall,props:...) inside Prefabs - @Eytan
        CastleWall : 'CastleWall',
        NumberHoop : 'NumberHoop',
        CastleTurret : 'CastleTurret',
        NumberWall : 'NumberWall',
        Zooka : 'Zooka',
        Portal : 'Portal',
        Multiblaster : 'Multiblaster',
        NumberFaucet : 'NumberFaucet',
        PlayerStart : 'PlayerStart',
    },
    Resolution : {
        width : 800,
        height : 500,
        get aspectRatio() {
            return this.width/this.height;
        },

    },
     Direction : Object.freeze({
        Left : 'Left',
        Right : 'Right',
        None : 'None',
    }),


}
// Some templates care about each other and so need to subscribe to a "all templates successfully loaded" event.
const RealmEditorState = Object.freeze({
    Initializing : 'Initializing',
    GameLoading : 'GameLoading',
    GameLoaded : 'GameLoaded',
    Enabling : 'Enabling',
});


