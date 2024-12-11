var m;
var Prefabs = {
    // Note: Duplicated functionality in Prefabs.SomeFuncToCreateItem and Game.Instantiate[someTemplate] // Network.Insatnatite
   TemplatizePrefabs () {
        // NOTE: These are for (mostly) single/sole assets only and not groups/combinations of assets.

         Game.templatize({asset:assets.models.mr_ball_faceless,isPrimitive:false,scale3:new pc.Vec3(0.05,0.05,0.05),extraFn:(face)=>{
    //        console.log("fn?");
            let scale3 = new pc.Vec3(0.025,0.025,0.025);
            face.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_KINEMATIC, restitution: 0.5, });
            face.addComponent("collision", { type: "box", halfExtents: pc.Vec3.ONE.mulScalar(1/2) });
            face.setLocalScale(scale3);
            ApplyTextureAssetToEntity({textureAsset:assets.textures.mr_faceless_clothing,entity:face})
            AnimationManager.AddAnimations({entity:face});
            face.anim.setInteger("state",6);
    //        ApplyTextureAssetToEntity({textureAsset:assets.textures.mr_faceless_clothing});
            return face;
        }});
         Game.templatize({asset:assets.models.mascot,isPrimitive:false,templateName:'Mascot',scale3:pc.Vec3.ONE,extraFn:(mascot)=>{
    //        console.log("fn?");
            mascot.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_DYNAMIC, restitution: 0.5, });
            mascot.addComponent("collision", { type: "box", halfExtents: scale3.mulScalar(1/2) });
            return mascot;
        }});
       Game.templatize({isPrimitive:true,templateName:'NumberCubeFixed',primitiveType:"box",scale3:pc.Vec3.ONE,extraFn:(cube)=>{
            cube.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_KINEMATIC, restitution: 0.5, });
            cube.addComponent("collision", { type: "box", halfExtents: cube.getLocalScale().clone().mulScalar(1/2)});
            cube.addComponent('script');
            // Do we need to run this fn AFTER instantiation? What about setting the value of the frac after instantiation rather than attaching a fresh numberinfo each time?
            cube.script.create('numberInfo',{attributes:{
                destroyFxFn:(x)=>{Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter});},
                fraction:new Fraction(2,1),
                }});
            cube.script.numberInfo.Setup();
            return cube;
        }});
       Game.templatize({isPrimitive:true,templateName:Constants.Templates.NumberWall,scale3:pc.Vec3.ONE,extraFn:(wall)=>{
            // presents a unique data challenge around "Instantiate" because we want to pass in x,y,z size for this numberwall
            // But the way we've set up this template, it already HAS a size
            // This is because this template is nested; it contains x y z size of numbercubes by default.
            // Solution: Push NumberWall building functionality to a sub-script that will be attached to the object
            // Provide a way for that subscript to destroy and rebuild its wall. 
            // Create the idea of a graphics/representation event that is fired when levelbuilder places an object so the wall will show up
            // and be able to be rebuilt while in levelbuilding mode (gfx only).




            const options = {};
            const {
                position=pc.Vec3.ZERO,
                } = options;
            wall.addComponent('script'); 
            wall.script.create('numberWall');

            const properties = {
                numberWallProperties : {
                    fraction : new Fraction(1,1),
                    createCubeFn:(p)=>{
                        const options2 = {
                            rigidbodyType:pc.RIGIDBODY_TYPE_KINEMATIC,
                            position:p,
                            numberInfo:{
                                fraction:new Fraction(1,1), // any way to store this without duplication from above in this obj?
                            }
                        }
//                        console.log("net inst:"+JSON.stringify(options2));
                        return Game.Instantiate.NumberCubeFixed(options2);
                        
                    }, 
                    size : {
                        x:4,
                        y:3,
                        z:1
                    },
                    existingWallObjects : [],
                }
            }
            wall.script.numberWall.setProperties(properties);
            wall.script.numberWall.rebuildWall();


        }});


        Game.templatize({isPrimitive:true,templateName:'NumberCube',primitiveType:"box",scale3:pc.Vec3.ONE,extraFn:(cube)=>{
            cube.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_DYNAMIC, restitution: 0.5, });
            cube.addComponent("collision", { type: "box", halfExtents: cube.getLocalScale().clone().mulScalar(1/2)});
            cube.addComponent('script');
            cube.script.create('pickUpItem');
            cube.script.create('numberInfo',{attributes:{
                destroyFxFn:(x)=>{Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter});},
                fraction:new Fraction(2,1),
                }});
            cube.script.numberInfo.Setup();
            return cube;
        }});

        Game.templatize({isPrimitive:true,templateName:'NumberRocket',primitiveType:"sphere",scale3:pc.Vec3.ONE,extraFn:(sphere)=>{
                sphere.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_DYNAMIC, restitution: 0.5, linearDamping : .85 });
                const s = sphere.getLocalScale.x;
                sphere.name = 'NumberRocket';
                sphere.addComponent("collision", { type: "sphere", halfExtents: new pc.Vec3(s/2, s/2, s/2)});
                sphere.addComponent('script');
                sphere.script.create('nogravity');
                sphere.script.create('destroyAfterSeconds');
                let fraction = new Fraction(2,1);
                sphere.script.create('numberInfo',{attributes:{
                    destroyFxFn:(x)=>{Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter});},
                    fraction:fraction,
                    ignoreCollision:true,
                    }});
                sphere.script.numberInfo.Setup();
            return sphere;
        }});

        Game.templatize({isPrimitive:true,templateName:'NumberSphere',primitiveType:"sphere",scale3:pc.Vec3.ONE,extraFn:(sphere)=>{
                sphere.addComponent("rigidbody", { type: pc.RIGIDBODY_TYPE_DYNAMIC, restitution: 0.5, linearDamping : .85 });
                const s = sphere.getLocalScale.x;
                sphere.addComponent("collision", { type: "sphere", halfExtents: new pc.Vec3(s/2, s/2, s/2)});
                sphere.addComponent('script');
                sphere.script.create('pickUpItem',{});
                let fraction = new Fraction(2,1);
                sphere.script.create('numberInfo',{attributes:{
                    destroyFxFn:(x)=>{Fx.Shatter(x);AudioManager.play({source:assets.sounds.shatter});},
                    fraction:fraction,
                    }});
                sphere.script.numberInfo.Setup();
                // ShaderTools.setupCelShader(sphere);
                
               

            return sphere;
        }});

        Game.templatize({ isPrimitive:true,hasEmptyParent:true,emptyParentOffset:new pc.Vec3(0,0,0.5),templateName:Constants.Templates.PlayerStart,scale:1.5,extraFn:(startParent)=>{
            startParent.addComponent("collision", { type: "sphere", halfExtents: new pc.Vec3(6,6,6)});
            startParent.addComponent('render', { type: 'sphere'  });
            startParent.render.material = Materials.green;
            startParent.setLocalScale(6,6,6);
            function onGameStateChange(state) {
                switch(state){
                case GameState.RealmBuilder:
                    // ("enable save/load so we can start worldbuilding.")
                    //console.log("Levelbuilder on");
                    startParent.enabled=true;
                    break;
                case GameState.Playing:
                    //console.log("Levelbuilder off");
                    Game.player.moveTo(startParent.getPosition().clone().add(pc.Vec3.UP.clone().mulScalar(3)));
                    startParent.enabled=false;
                    break;
                }
            }
            GameManager.subscribe(startParent,onGameStateChange);
            startParent.tags.add(Constants.Templates.PlayerStart);
            pc.app.root.findByTag(Constants.Templates.PlayerStart).forEach(other => {
                if (other.getGuid() !== startParent.getGuid()) other.destroy(); // only one start 
            });
            return startParent; 

       }});
        Game.templatize({ asset:assets.numberHoop,hasEmptyParent:true,emptyParentOffset:new pc.Vec3(0,0,2),templateName:assets.numberHoop.name,scale:1.5,extraFn:(hoopParent)=>{
            const hoop = hoopParent.children[0]; // no check here for hasEmptyParent?
            hoop.addComponent('script');
            hoop.script.create('machineHoop',{
                attributes:{
                    onCrossFn : (pos)=>{ 
                        AudioManager.play({source:assets.sounds.popHoop,position:pos});
                        Fx.Shatter({position:pos});
                    },
                    hoopMeshRenderAsset : assets.numberHoop.resource.renders[1],
                    hoopTextureAsset : assets.textures.hoop,

                    }});
            hoop.setEulerAngles(new pc.Vec3(-90,0,0));                        
            hoop.script.machineHoop.init();

       }});
// assets2
//        Game.templatize({asset:assets.textures.skyboxes.skybox_space, scale:500, extraFn:(skybox)=>{
//            skybox.getComponentsInChildren('render')[0].layers = [pc.LAYERID_SKYBOX];//meshInstances[0].material = mat;
//            skybox.name="space2";
//            
//        }})
        // Game.templatize({asset:assets.skybox_city,scale:1});
        Game.templatize({asset:assets.skybox_city,templateName:'sky2',scale:.3, extraFn:(skybox) => {
            let mat = Terrain.NoFogMaterial({texture:assets.textures.skyboxes.space2});
            m=mat;
            skybox.getComponentsInChildren('render')[0].meshInstances[0].material = mat;
    
        }});
        Game.templatize({asset:assets.tree,scale:1, extraFn: (tree) => {
            tree.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
            const col = new pc.Entity('treeCollider');
            col.setPosition(tree.getPosition());
            col.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(0.5,3.5,0.5)});
            col.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
            tree.addChild(col);
        }});
         Game.templatize({asset:assets.models.structures.house2,scale:2.0, extraFn:(house,asset) => { 
            house.setLocalEulerAngles(-90,0,0);
            Game.addMeshCollider(house,asset,pc.RIGIDBODY_TYPE_KINEMATIC);
            ApplyTextureAssetToEntity({entity:house,textureAsset:assets.textures.structures.village_houses});
         }});

         Game.templatize({icon:assets.textures.ui.icons.sword,asset:assets.models.gadgets.sword,scale:1.0,extraFn: (sword) => { 
            sword.addComponent('script');
            sword.script.create('gadgetSword',{attributes:{ 
                onSelectFn:()=>{AudioManager.play({source:assets.sounds.swordDraw});},
                onFireFn:()=>{AudioManager.play({source:assets.sounds.swordSwing});},
                onPickupFn:()=>{AudioManager.play({source:assets.sounds.swordDraw});},
                
                }});
            sword.script.gadgetSword.init(); //hacky af way to make sure init happens even if obj is disabled.
        }});
        
        Game.templatize({icon:assets.textures.ui.icons.bow,asset:assets.models.gadgets.bow,scale:0.1, extraFn:(bow) => { 
            bow.addComponent('script'); 
            bow.script.create('gadgetBow',{attributes:{
                onFireFn:()=>{AudioManager.play({source:assets.sounds.multiblasterFire});},
                onSelectFn:()=>{AudioManager.play({source:assets.sounds.getGadget});},
                onPickupFn:()=>{AudioManager.play({source:assets.sounds.getGadget});},
                camera:Camera.main.entity,
                }}); 
        }});
         
        Game.templatize({icon:assets.textures.ui.icons.zooka,asset:assets.models.gadgets.zooka,scale:1.0, extraFn:(zooka) => { 
            zooka.addComponent('script'); 
            zooka.script.create('gadgetZooka',{attributes:{
                onFireFn:()=>{AudioManager.play({source:assets.sounds.missile,position:pc.Vec3.ZERO,volume:0.4,pitch:1,positional:false});},
                // createBulletFn:(p)=>{return Network.Instantiate.NumberSphere({position:p});}, // not sure why we passed this in as fn?
                //onSelectSound:()=>{AudioManager.play({source:assets.sounds.getGadget});},
                onPickupFn:()=>{AudioManager.play({source:assets.sounds.getGadget});},
                camera:Camera.main.entity,
                }}); 
         }});


        Game.templatize({icon:assets.textures.ui.icons.multiblaster,asset:assets.models.gadgets.multiblaster,templateName:Constants.Templates.Multiblaster,scale:1.0, extraFn:(blaster) => { 
            blaster.addComponent('script'); 
            blaster.script.create('gadgetMultiblaster',{attributes:{
                onFireFn:()=>{AudioManager.play({source:assets.sounds.multiblasterFire,position:pc.Vec3.ZERO,volume:0.4,pitch:1,positional:false});},
                // createBulletFn:(p)=>{return Network.Instantiate.NumberSphere({position:p});}, // not sure why we passed this in as fn?
                //onSelectSound:()=>{AudioManager.play({source:assets.sounds.getGadget});},
                onPickupFn:()=>{AudioManager.play({source:assets.sounds.getGadget});},
                camera:Camera.main.entity,
                }}); 
         }});
//        Game.templatize({asset:assets.gothicChurchCeiling,scale:10,extraFn:(gothic,asset) => {Game.addMeshCollider(gothic,asset,pc.RIGIDBODY_TYPE_KINEMATIC)}});
        Game.templatize({asset:assets.axis,scale:.01,extraFn:(axis) => { 
            axis.setEulerAngles(0,0,0); 
            }});
        Game.templatize({hasEmptyParent:true,asset:assets.models.faucet,templateName:Constants.Templates.NumberFaucet,scale:2,extraFn:(emptyParent,asset,options) => {
            const faucet = emptyParent.children[0];
            faucet.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(0.75,0.75,4)}); 
            faucet.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
            const renders = faucet.getComponentsInChildren('render');
            renders[0].enabled=false;
            renders[3].enabled=false;
            renders[1].meshInstances[0].material=Materials.red;
            renders[1].meshInstances[1].material=Materials.gray;
            renders[1].meshInstances[3].material=Materials.gray;
            renders[2].meshInstances[0].material=Materials.red;
            renders[2].meshInstances[1].material=Materials.gray;
            renders[2].meshInstances[2].material=Materials.white;
            // DISLIKE this could have been avoided with a proper artist on-team to make GLB with the correct colors already! jeez
            faucet.addComponent('script');
            faucet.script.create('numberFaucet',{attributes:{fraction:options.fraction}});
            faucet.setLocalEulerAngles(-90,0,0);

         }});
            // assets2
//        Game.templatize({asset:assets.models.lizard_wizard,scale:0.3,extraFn:(wizard) => {
//            wizard.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(0.75,0.75,4)}); 
//        }});

        Game.templatize({isPrimitive:true,hasEmptyParent:true,emptyParentOffset:new pc.Vec3(-2.75,-1,0.75),templateName:Constants.Templates.Portal,scale:1.0, extraFn:(portal) => {
            let p = Portal.CreatePortal();
//            p.children[0].rotate(180);
            portal.addChild(p);
            portal.setLocalPosition(pc.Vec3.ZERO);
            
            // none yet    
        }});

        Game.templatize({asset:assets.models.castle_wall,hasEmptyParent:true,emptyParentOffset:new pc.Vec3(-2.75,-1,0.75),templateName:Constants.Templates.CastleWall,scale:1.0, extraFn:(wall,asset) => {
            let col = new pc.Entity("castlewall collider");
            col.addComponent('rigidbody', {type:pc.RIGIDBODY_TYPE_KINEMATIC});
            col.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(3,3.5,0.5)});
            wall.addChild(col);
            col.setLocalPosition(0,0,0);

            let mat = ApplyTextureAssetToEntity({entity:wall,textureAsset:assets.textures.stone}); 
            mat.diffuseMapTiling=new pc.Vec2(3,3); 
            mat.update()
        }});

        Game.templatize({asset:assets.models.castle_pillar,scale:1.0, extraFn:(castle_pillar,asset) => {
            let collision = Game.addMeshCollider(castle_pillar,asset,pc.RIGIDBODY_TYPE_KINEMATIC);

            // Set up collision groups and masks for castles not to intersect each other
            var COLLISION_GROUP_1 = 1;
            var COLLISION_GROUP_2 = 2;
            var ALL_GROUPS = 0xFFFFFFFF;

            collision.group = COLLISION_GROUP_1;
            collision.mask = ALL_GROUPS ^ COLLISION_GROUP_2;

            castle_pillar.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_KINEMATIC});
            let mat = ApplyTextureAssetToEntity({entity:castle_pillar,textureAsset:assets.textures.stone90}); 
            castle_pillar.setLocalEulerAngles(-90,0,0);
        }});
         Game.templatize({asset:assets.models.castle_top,scale:1.0, extraFn:(castle_top,asset) => {
            let collision = Game.addMeshCollider(castle_top,asset,pc.RIGIDBODY_TYPE_STATIC);


            // Set up collision groups and masks for castles not to intersect each other
            var COLLISION_GROUP_1 = 1;
            var COLLISION_GROUP_2 = 2;
            var ALL_GROUPS = 0xFFFFFFFF;

            collision.group = COLLISION_GROUP_1;
            collision.mask = ALL_GROUPS ^ COLLISION_GROUP_2;

            castle_top.addComponent('rigidbody',{type:pc.RIGIDBODY_TYPE_STATIC});
            let mat = ApplyTextureAssetToEntity({entity:castle_top,textureAsset:assets.textures.stone90}); 
           // mat.diffuseMapTiling=new pc.Vec2(1,1); 
           // mat.update()
           // castle_top.setLocalScale(1,1,1);
            castle_top.setLocalEulerAngles(-90,0,0);
        }});
         Game.templatize({isPrimitive:true,templateName:Constants.Templates.CastleTurret,scale:1.0, extraFn:(gameObject) => {
             let castlePillar = Game.Instantiate['castle_pillar']({position:pc.Vec3.ZERO});
             let castleTop = Game.Instantiate['castle_top']({position:pc.Vec3.ZERO});
             gameObject.addChild(castlePillar);
             gameObject.addChild(castleTop);
             castlePillar.setLocalPosition(pc.Vec3.ZERO);
             castleTop.setLocalPosition(new pc.Vec3(0,3.4,0));
             pc.app.root.addChild(gameObject);
  
        }});
  

        Game.templatize({asset:assets.models.wall,scale:1.05, extraFn:(wall,asset) => { Game.addMeshCollider(wall,asset,pc.RIGIDBODY_TYPE_KINEMATIC)}});
        Game.templatize({asset:assets.models.mascot,scale:0.05,extraFn: (mascot)=>{ }});

        //Game.templatize({asset:assets.gothicChurchCeiling,scale:10,extraFn:(gothic,asset) => {
//        Game.addMeshCollider(gothic,asset,pc.RIGIDBODY_TYPE_KINEMATIC)}});


        Game.templatize({asset:assets.models.structures.flat_pyramid,scale:0.07, extraFn: (flat_pyramid, asset)=>{
            flat_pyramid.moveTo(flat_pyramid.getPosition(),new pc.Vec3(-90,0,0));
            Game.addMeshCollider(flat_pyramid,asset,pc.RIGIDBODY_TYPE_KINEMATIC);
            ApplyTextureAssetToEntity({entity:flat_pyramid,textureAsset:assets.textures.structures.heiroglyphs});
            return flat_pyramid;
        }});

        Game.templatize({asset:assets.models.structures.spaceship2,scale:0.05, extraFn: (spaceship2, asset)=>{
            spaceship2.moveTo(spaceship2.getPosition(),new pc.Vec3(-90,0,0));
            Game.addMeshCollider(spaceship2,asset,pc.RIGIDBODY_TYPE_STATIC);
            return spaceship2;
        }});

        Game.templatize({asset:assets.models.structures.spaceship,scale:0.05, extraFn: (spaceship, asset)=>{
            spaceship.moveTo(spaceship.getPosition(),new pc.Vec3(-90,0,0));
            Game.addMeshCollider(spaceship,asset,pc.RIGIDBODY_TYPE_STATIC);

            return spaceship;
        }});


        Game.templatize({asset:assets.models.creatures.sheep,scale:0.3,extraFn:(sheep)=>{
            ApplyTextureAssetToEntity({entity:sheep,textureAsset:assets.textures.creatures.sheep});
            let sh = Game.Instantiate.NumberSphere({position:sheep.getPosition()}); //,network:false,localOnly:true});
            sh.rigidbody.type = pc.RIGIDBODY_TYPE_KINEMATIC;
            sheep.addChild(sh);
            sh.moveTo(sheep.getPosition());
            sh.setLocalScale(4.7,4.7,4.7); 
            sheep.setLocalEulerAngles(-90,0,0);console.log('baah')
            sheep.translate(0,1,0);
         }});
       
        Game.templatize({asset:assets.models.low_poly_wizard,scale:0.01,extraFn:(wizard) => {
            wizard.addComponent('collision',{type:'box',halfExtents:new pc.Vec3(0.75,0.75,4)}); 
        }});

        
        Game.templatize({asset:assets.models.creatures.spikey,scale:1,extraFn:(spikes) => {
            let icosphere = assets.models.icosphere.resource.instantiateRenderEntity();
            ApplyTextureAssetToEntity({entity:spikes,textureAsset:assets.textures.gadget});
            spikes.addChild(icosphere);
            spikes.addComponent('script');
            spikes.script.create('creatureSpikey',{
                attributes:{
                    growlFn:(pos)=>{AudioManager.play({
                        source:PickRandomFromObject(assets.sounds.spikeySounds),
                        position:pos,
                        positional:true})}}});

        }});
    }
}


