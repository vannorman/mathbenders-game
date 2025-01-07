import {AssetPrefab, PrimitivePrefab} from "./prefabs";

// The following could be defined in their own files and then
// bundled together in an index.js for use in other modules.
// Ideally, the system which templatizes/instantiates prefabs should
// work as expected, not requiring any change, and anytime you want a new prefab,
// you would add an entry to the prefabs array at the bottom.
const misterBallFacelessPrefab = new AssetPrefab({
    asset: assets.models.mr_ball_faceless,
    scale: new pc.Vec3(0.05, 0.05, 0.05),
    initialize: (face) => {
        let scale3 = new pc.Vec3(0.025, 0.025, 0.025);
        face.addComponent("rigidbody", {type: pc.RIGIDBODY_TYPE_KINEMATIC, restitution: 0.5,});
        face.addComponent("collision", {type: "box", halfExtents: pc.Vec3.ONE.mulScalar(1 / 2)});
        face.setLocalScale(scale3);
        ApplyTextureAssetToEntity({textureAsset: assets.textures.mr_faceless_clothing, entity: face})
        AnimationManager.AddAnimations({entity: face});
        face.anim.setInteger("state", 6);
        return face;
    }
});

const mascot = new AssetPrefab({
    asset: assets.models.mascot,
    initialize: (mascot) => {
        mascot.addComponent("rigidbody", {type: pc.RIGIDBODY_TYPE_DYNAMIC, restitution: 0.5,});
        mascot.addComponent("collision", {type: "box", halfExtents: scale3.mulScalar(1 / 2)});
        return mascot;
    }
});

const numberFixedCube = new PrimitivePrefab({
    type: 'box',
    initialize: (cube) => {
        cube.addComponent("rigidbody", {type: pc.RIGIDBODY_TYPE_KINEMATIC, restitution: 0.5});
        cube.addComponent("collision", {type: "box", halfExtents: cube.getLocalScale().clone().mulScalar(1 / 2)});
        cube.addComponent('script');
        cube.script.create('numberInfo', {
            attributes: {
                destroyFxFn: (x) => {
                    Fx.Shatter(x);
                    AudioManager.play({source: assets.sounds.shatter});
                },
                fraction: new Fraction(2, 1),
            }
        });
        cube.script.numberInfo.Setup();
        return cube;
    }
});

const numberRocket = new PrimitivePrefab({
    type: 'sphere',
    initialize: (sphere) => {
        sphere.addComponent("rigidbody", {
            type: pc.RIGIDBODY_TYPE_DYNAMIC,
            restitution: 0.5,
            linearDamping: .85
        });
        const s = sphere.getLocalScale.x;
        sphere.name = 'NumberRocket';
        sphere.addComponent("collision", {type: "sphere", halfExtents: new pc.Vec3(s / 2, s / 2, s / 2)});
        sphere.addComponent('script');
        sphere.script.create('nogravity');
        sphere.script.create('destroyAfterSeconds');
        let fraction = new Fraction(2, 1);
        sphere.script.create('numberInfo', {
            attributes: {
                destroyFxFn: (x) => {
                    Fx.Shatter(x);
                    AudioManager.play({source: assets.sounds.shatter});
                },
                fraction: fraction,
                ignoreCollision: true,
            }
        });
        sphere.script.numberInfo.Setup();
        return sphere;
    }
});


export default [
    misterBallFacelessPrefab,
    mascot,
    numberFixedCube,
    numberRocket
];