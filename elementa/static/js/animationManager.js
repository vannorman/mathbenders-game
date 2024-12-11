var AnimationManager = {
   AddAnimations(options) { 
        const { 
            entity = null, 
        } = options;
        if (entity == null){
            console.log('%c NO ENTITY ANIM','color:red');
            return;
        }
         entity.addComponent('anim',{activate:true});  
    // create an anim state graph
        const animStateGraphData = {
            layers: [
                {
                    name: "locomotion",
                    states: [
                        { name: "START", },
                        { name: "Idle", speed: 1.0, },
                        { name: "StrafeLeft", speed: 1.0, },
                        { name: "Walk", speed: 1.0, },
                        { name: "Jump", speed: 1, },
                        { name: "Jog", speed: 1.0, },
                        { name: "StandingArguing", speed: 1.0, },
                        { name: "StandingArguing2", speed: 1.0, },
                        { name: "END", }, 
                    ], transitions: [ {
                            from: "START", to: "Idle", time: 0, priority: 0,
                        }, {
                            from: "ANY",    to: "Idle", time: 0.0,  priority: 0,    exitTime: 0.0,
                            conditions: [ { parameterName: "state", predicate: pc.ANIM_LESS_THAN_EQUAL_TO, value: 0, }, ],
                        }, {
                            from: "ANY",to: "StrafeRight", time: 0.0, priority: 0, exitTime: 0.0, 
                            conditions: [{ parameterName: "state", predicate: pc.ANIM_EQUAL_TO, value: 4, }, ],
                         }, {
                            from: "ANY",to: "StrafeLeft", time: 0.0, priority: 0, exitTime: 0.0, 
                            conditions: [{ parameterName: "state", predicate: pc.ANIM_EQUAL_TO, value: 3, }, ],
                        }, {
                            from: "ANY", to: "Walk", time: 0.0, priority: 0, 
                            conditions: [{ parameterName: "state", predicate: pc.ANIM_EQUAL_TO, value: 1, }, ],
                        }, {
                            from: "ANY", to: "Jog", time: 0.0, priority: 0,
                            conditions: [{ parameterName: "state", predicate: pc.ANIM_EQUAL_TO, value: 2, }, ],
                        }, {
                            from: "ANY", to: "StandingArguing", time: 0.0, priority: 0,
                            conditions: [{ parameterName: "state", predicate: pc.ANIM_EQUAL_TO, value: 5, }, ],
                        }, {
                            from: "ANY", to: "StandingArguing2", time: 0.0, priority: 0,
                            conditions: [{ parameterName: "state", predicate: pc.ANIM_EQUAL_TO, value: 6, }, ],
                        }, {
                            from: "ANY", to: "Jump", time: 0.6, priority: 1, exitTime: 0,
                            conditions: [ { parameterName: "jump", predicate: pc.ANIM_EQUAL_TO, value: true, }, ],
                        },
                    ],
                },
            ],

            parameters: {
                state: {
                    name: "state",
                    type: pc.ANIM_PARAMETER_INTEGER,
                    value: 0,
                },
                jump: {
                    name: "jump",
                    type: pc.ANIM_PARAMETER_TRIGGER,
                    value: false,
                },
            },
        };

        // load the state graph into the anim component
        entity.anim.loadStateGraph(animStateGraphData);

        // assign the loaded animation assets to each of the states present in the state graph
        const locomotionLayer = entity.anim.baseLayer;
        locomotionLayer.assignAnimation( "Idle", assets.animations.idle.resource.animations[0].resource);
        locomotionLayer.assignAnimation( "StrafeLeft", assets.animations.strafeleft.resource.animations[0].resource);
        locomotionLayer.assignAnimation( "StrafeRight", assets.animations.straferight.resource.animations[0].resource);
        locomotionLayer.assignAnimation( "Walk", assets.animations.walk.resource.animations[0].resource);
        locomotionLayer.assignAnimation( "Jog", assets.animations.run.resource.animations[0].resource);
        locomotionLayer.assignAnimation( "StandingArguing", assets.animations.standing_arguing.resource.animations[0].resource);
        locomotionLayer.assignAnimation( "StandingArguing2", assets.animations.standing_arguing2.resource.animations[0].resource); // because we have two different humanoid styles and must apply a different animation between "mascot" and "mrfaceless" skeleton characters
        locomotionLayer.assignAnimation( "Jump", assets.animations.jump.resource.animations[0].resource);


    }
}




    /* // before locomotion we did this one 
    const animStateGraphData = {
        layers: [{ 
            name: "characterState", 
            states: [
                { name: "START", },
                { name: "Movement",
                    speed: 1.0,
                    loop: true,
                    blendTree: {
                        type: "1D",
                        parameter: "blend",
                        children: [
                            { name: "Idle", point: 0.0, }, 
                            { name: "Walk", point: 0.5, speed: 0.85 },
                            { name: "Run", point: 1.0, speed: 0.85 },
                        ],
                    },
               },
            ],
            transitions: [{
                from: "START",
                to: "Movement",
            },],
        },],
        parameters: {
            blend: {name: "blend",type: "FLOAT",value: 0, },
        },
    };
    this.playerGraphics.anim.loadStateGraph(animStateGraphData);

    const characterStateLayer = this.playerGraphics.anim.baseLayer;
    characterStateLayer.assignAnimation("Movement.Idle", assets.animations.idle.resource.animations[0].resource);
    characterStateLayer.assignAnimation("Movement.Walk", assets.animations.walk.resource.animations[0].resource);
    characterStateLayer.assignAnimation("Movement.Run", assets.animations.run.resource.animations[0].resource);
    */


