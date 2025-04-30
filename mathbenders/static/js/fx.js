Fx = {
    Poof(options={}){
        const {scale=1,size=1,position=Player.entity.getPosition(),positionalAudio=false}=options;
        let particles = new pc.Entity("Poof");
        pc.app.root.addChild(particles);
        particles.moveTo(position);
        const scaleCurve = new pc.Curve([scale, scale*2.1]);
        particles.addComponent("particlesystem", {
            numParticles: 1,
            lifetime: 0.2,
            rate: .001,
            rate2: .001,
            emitterExtents: new pc.Vec3(1, 1, 1),
            // scaleGraph: scaleCurve,
            colorMap: assets.textures.fuzzk.resource,
            loop:false,
        });
        AudioManager.play({
            source:PickRandomFromObject(assets.sounds.poofs),
            position:position,
            positional:positionalAudio,
            pitch:Math.random()/2+0.5,
            volume:0.8,

        })

    },
     Explosion(options={}){
        const {position=Game.player.getPosition(),startScale=1,endScale=5,duration=2}=options;
        const ent = new pc.Entity();
        ent.addComponent('render', { type: 'sphere'  });
        ent.render.material = Materials.redAlpha;
        const startTime = Date.now();
        const growthInterval = setInterval(function(){
            const time = Date.now();
            const timePassed = (time - startTime)/1000;
            const newScale = Math.lerp(startScale, endScale, (timePassed/duration)*60);
            ent.setLocalScale(pc.Vec3.ONE.clone().mulScalar(newScale));
            Game.e = ent;
            if (timePassed > duration || ent.localScale.x >= endScale){
                clearInterval(growthInterval);
                ent.destroy();
            }
        });
        pc.app.root.addChild(ent);
        ent.moveTo(position);
        return ent;

    },
    Shatter(options){
        const {scale=1,size=1,position=Game.player.getPosition()}=options;
        let particles = new pc.Entity("Shatter");
        pc.app.root.addChild(particles);
        particles.moveTo(position);
        const scaleCurve = new pc.Curve([scale, scale*2.1]);
        particles.addComponent("particlesystem", {
            numParticles: 1,
            lifetime: 0.2,
            rate: .001,
            rate2: .001,
            emitterExtents: new pc.Vec3(1, 1, 1),
            // scaleGraph: scaleCurve,
            colorMap: assets.textures.fuzzk.resource,
            loop:false,
        });
        return;
        particles.addComponent("particlesystem", {
            numParticles: size*size*3,
            lifetime: 1,
            rate: .001,
            rate2: .001,
            emitterExtents: new pc.Vec3(size*scale, 1, size*scale),
            scaleGraph: scaleCurve,
            colorMap: assets.textures.fuzzk.resource,
        });
    }  ,
    SmokeParticles(options={}){
        const {scale=1,size=1,position=Game.player.getPosition()}=options;
        let particles = new pc.Entity("Smoke");
        pc.app.root.addChild(particles);
        particles.moveTo(position);


        const colorCurve = new pc.CurveSet([
            [0,1,1,0],
            [0,1,1,0],
            [0,1,1,0],
        ]);

        // make particles fade in and out
        const alphaCurve = new pc.Curve(
            [0, 0, 0.05, 1, 0.5, 0.8, 0.8, 0.4, 0.85, 0.3, 0.9, 0.1, 1, 0]
            );

        // gradually make sparks bigger
        const scaleCurve = new pc.Curve(
            [0, 0.2, 1, 2]
        );

        // rotate sparks 360 degrees per second
        const angleCurve = new pc.Curve([0, 10]);
        const angleCurve2 = new pc.Curve([10, 0]);

        particles.addComponent("particlesystem", {
            numParticles: 100,
            lifetime: 4,
            rate: .02,
            rate2: .03,
            emitterExtents: pc.Vec3.ZERO,
            colorMap: assets.textures.smoke.resource,
            scaleGraph: scaleCurve,
            startAngle:0,
            startAngle2:360,
            colorGraph: colorCurve,
            rotationSpeedGraph: angleCurve,
            rotationSpeedGraph2: angleCurve2,
            alphaGraph:alphaCurve,
            loop:true,
        });

        return particles;
    },
}

/*
        const colorCurve = new pc.CurveSet([
            [0, 0, 0.5, 0.65, 1,0.9],  // R value - [time0, val0, time1, val1, time2, val2] This goes from 0 to 0.65 to 0.9 r value over 0 to 0.5 to 1 seconds
            [0, 0,1,1], // G value - [time0, val0, time1, val1] This goes from 0 to 1 green val over 0 to 1 s
            [0, 0,1,1],
        ]);
*/

