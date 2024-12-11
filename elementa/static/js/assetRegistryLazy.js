// Problem: All assets are loaded at front of app, slowing load times.
// Solution: Lazy load assets only when they are used.
// Architecture decision: I want to have one place where assets are defined (here).
// Architecture: I want to be able to instantiate these assets at any time during gameplay
//      by calling Game.Instantiate.someAsset(options);
//      Instantiate method call should always match the asset name
//      Therefore Game.Instantiate(assets.someAsset,options) should be the preferred methodology
// 
// Done Thurs Aug 8 2024 - 
// assets2 are added to registry but not loaded until they are instantiated.


// Claude gave some advice about predictive or prioritized loading, or loading a dummy object first. 
// https://claude.ai/chat/98c38a18-83db-412f-aa05-f127ae86e943

// Prompt:
// 
//i have a dilemma. Let me list my situation and please give me some insight or advice.
//
//I have a game which has 100s of heavy assets. I don't want the user to load these assets at load time which will slow down the initial load of the application. So, I do not load any of them immediately. I keep a list of all the assets that might be needed, and I lazily load them later as they are needed.
//
//One method I use to utilize my assets is Instantiate. My Instantiate method looks like Game.Instantiate(someAsset). If someAsset hasn't been loaded, it will need to load the asset in the engine, which is an async operation.
//
//I have several potential ways to architect this app, none of which seem right.
//1. Load all assets at the start (slow load times).
//2. Load all assets only as I need them, which results in a "null" value the first time I load it (beacuse trying to load the assets causes it to be prepared which is an async operation). Subsequent loads are fine.
//3. Load all assets only as I need them using async. This guarantees the initial asset load will return the object and not null. But, now I need to put async and await in every single part of my code that requires an asset load, which will add significant complexity and technical debt to my code base.
//
//Is there anything I'm not considering? what other options do I have?

// hmm. so simply defining assets = { textures : someTexture : new pc.Asset() } loads it sync and then I can call that texture.
// But, loading some asset object with instantiateRenderEntity doesn't?

var assets2 = {
    gothicChurchCeiling: new pc.Asset("gothicChurchCeiling", "container", { url: "/static/assets/models/gothic_church_ceiling.glb", }),
    dance : new pc.Asset("Dance", "container", { url: "/static/assets/animations/win-dance.glb",    }),
    sounds : {
        nature : new pc.Asset('natureSound',"audio",{url:"/static/assets/sounds/nature.mp3"}),
        chillwave : new pc.Asset('chillwave',"audio",{url:"/static/assets/sounds/chillwave.mp3"}),
        dreamscape : new pc.Asset('dreamscape',"audio",{url:"/static/assets/sounds/pond5_055821059_ambient_dreamscape.mp3"}),
        
    },
    skyboxes : {
        skybox_space: new pc.Asset("skybox_space", "container", { url: "/static/assets/textures/skyboxes/inside_galaxy_skybox_hdri_360_panorama.glb",    }),

    },
    models : {
        lizard_wizard: new pc.Asset("lizard_wizard", "container", { url: "/static/assets/models/lizard_wizard.glb", }),
    },
}

function LoadAssetsIntoPlaycanvas(assetList){
    // Will crawl entire asset object and "register" (not load) each one with Playcanvas' Asset Registry (to be loaded later).
    let flatAssetList = Utils2.getFlatObjectValues(assetList);
    for(let i=0;i<flatAssetList.length;i++){
        let asset = flatAssetList[i];
        pc.app.assets.add(asset);
//        console.log("added:"+asset.name);
    }
}

var assets = {
    // Animations : https://playcanvas.com/editor/scene/961236
    // Animations: https://forum.playcanvas.com/t/solved-how-do-you-programmatically-import-and-apply-animations-to-models-from-mixamo/15248/2

    skybox_city: new pc.Asset("skybox_city", "container", { url: "/static/assets/models/skybox_city.glb",    }),
    axis: new pc.Asset("axis", "container", { url: "/static/assets/models/axis.glb",    }),
    tree: new pc.Asset("tree", "container", { url: "/static/assets/models/lowpoly_tree_birch2.glb",    }),
    numberHoop: new pc.Asset("numberHoop", "container", { url: "/static/assets/models/hoop.glb", }),
    portal: new pc.Asset("portal", "container", { url: "/static/assets/models/portal.glb", }),
//    church: new pc.Asset("church", "container", { url: "/static/assets/models/church.glb", }),
    animations : {
        // NOTE: To import an fbx animation, load the playcanvas web editor, drag fbx in, then download the converted glb animation.
        // NOTE: To find and download an fbx animation use Mixamo.
        // NOTE: our "Mascot" model is NOT the identical skeleton as a humanoid.  So upload Mascot.fbx to Mixamo if you need an animation for Mascot.
        idle : new pc.Asset("Idle", "container", { url: "/static/assets/animations/Mascot@Idle-Animation-mixamo.com.glb",    }),
        walk : new pc.Asset("Walk", "container", { url: "/static/assets/animations/walking1.glb",    }),
        run : new pc.Asset("Run", "container", { url: "/static/assets/animations/run.glb",    }),
        standing_arguing : new pc.Asset("StandingArguing", "container", { url: "/static/assets/animations/standing_arguing.glb",}),
        standing_arguing2 : new pc.Asset("StandingArguing2", "container", { url: "/static/assets/animations/standing_arguing2.glb",}),
        yelling : new pc.Asset("Yelling", "container", { url: "/static/assets/animations/yelling.glb",    }),
        jump : new pc.Asset("Yelling", "container", { url: "/static/assets/animations/jump1.glb",    }),
        strafeleft : new pc.Asset("Yelling", "container", { url: "/static/assets/animations/strafeleft.glb",    }),
        straferight : new pc.Asset("Yelling", "container", { url: "/static/assets/animations/straferight.glb",    }),
        swim : new pc.Asset("Yelling", "container", { url: "/static/assets/animations/swim.glb",    }),
    },
    models : {
        mr_ball_faceless : new pc.Asset("mr_ball_faceless", "container", { url: "/static/assets/models/mr_ball_faceless@.glb",    }),
        mascot :  new pc.Asset("Mascot", "container", { url: "/static/assets/models/mascot.glb",    }),
//        mascot_idle :  new pc.Asset("mascot_idle", "container", { url: "/static/assets/models/mascot@idle.glb",    }),
        creatures: {
            sheep :  new pc.Asset("sheep", "container", { url: "/static/assets/models/creatures/sheep.glb",    }),
            spikey: new pc.Asset("spikey", "container", { url: "/static/assets/models/creatures/spikey.glb", }),

        },
        structures: {
            flat_pyramid :  new pc.Asset("flat_pyramid", "container", { url: "/static/assets/models/structures/flat_pyramid.glb",    }),
            spaceship:new pc.Asset("spaceship", "container", { url: "/static/assets/models/structures/spaceship.glb",    }),
            spaceship2:new pc.Asset("spaceship2", "container", { url: "/static/assets/models/structures/ship3.glb",    }), // current one using
            house2:  new pc.Asset("house2", "container", { url: "/static/assets/models/structures/house2.glb",    }),
            house3:  new pc.Asset("house3", "container", { url: "/static/assets/models/structures/house3.glb",    }),
            house4:  new pc.Asset("house4", "container", { url: "/static/assets/models/structures/house4.glb",    }),
            house5:  new pc.Asset("house5", "container", { url: "/static/assets/models/structures/house5.glb",    }),
            house6:  new pc.Asset("house6", "container", { url: "/static/assets/models/structures/house6.glb",    }),
            house7:  new pc.Asset("house7", "container", { url: "/static/assets/models/structures/house7.glb",    }),
        },
        wall:  new pc.Asset("wall", "container", { url: "/static/assets/models/wall.glb",    }),
        castle_wall: new pc.Asset("castle_wall", "container", { url: "/static/assets/models/structures/castles/castleWall.glb",    }),
        castle_top: new pc.Asset("castle_top", "container", { url: "/static/assets/models/structures/castles/castleTop.glb",    }),
        castle_pillar: new pc.Asset("castle_pillar", "container", { url: "/static/assets/models/structures/castles/castlePillar.glb",    }),
        faucet: new pc.Asset("faucet", "container", { url: "/static/assets/models/faucet.glb", }),
        low_poly_wizard: new pc.Asset("low_poly_wizard", "container", { url: "/static/assets/models/low_poly_wizard_rigged.glb", }),
        icosphere: new pc.Asset("icosphere", "container", { url: "/static/assets/models/icosphere.glb", }),
        gadgets : {
            multiblaster: new pc.Asset("multiblaster", "container", { url: "/static/assets/models/gadgets/multiblaster.glb", }),
            sword: new pc.Asset("sword", "container", { url: "/static/assets/models/gadgets/sword.glb",    }),
            bow: new pc.Asset("bow", "container", { url: "/static/assets/models/gadgets/bow.glb",    }),
        },
       // multiblaster2: new pc.Asset("multiblaster2", "container", { url: "/static/assets/models/multiblaster.dae", }),
    },
    font : new pc.Asset("font-benchnine", "font", { url: "/static/fonts/BenchNine-Bold.json",        }),
    fonts : {
        montserrat : new pc.Asset("font-montserrat", "font", { url: "/static/fonts/Montserrat-Bold.json",        }),
    },
    quad: new pc.Asset("quad", "texture", { url: "/static/assets/textures/ui/quad.jpg",        }),
    sounds : {
        river : new pc.Asset('river',"audio",{url:"/static/assets/sounds/river.mp3"}),
        numberEat : new pc.Asset('numberEat',"audio",{url:"/static/assets/sounds/numberEat.mp3"}),
        space_ambient : new pc.Asset('space_ambient',"audio",{url:"/static/assets/sounds/space_ambient.mp3"}),
        popHoop : new pc.Asset('popHoopSound',"audio",{url:"/static/assets/sounds/popHoop.mp3"}),
        getGadget : new pc.Asset('getGadgetsound',"audio",{url:"/static/assets/sounds/getGadget.mp3"}),
        multiblasterFire : new pc.Asset('multiblasterFire',"audio",{url:"/static/assets/sounds/multiblasterFire.wav"}),
        vorpalVortex : new pc.Asset('vorpalVortex',"audio",{url:"/static/assets/sounds/vorpalVortex.mp3"}), // 35930615-warp-portal-opening-impact
        shatter : new pc.Asset('shatter',"audio",{url:"/static/assets/sounds/shatter.mp3"}),
        swordDraw : new pc.Asset('swordDraw',"audio",{url:"/static/assets/sounds/swordDraw.mp3"}),
        swordSwing : new pc.Asset('swordSwing',"audio",{url:"/static/assets/sounds/swordSwing.mp3"}),
        getItem : new pc.Asset('getItem',"audio",{url:"/static/assets/sounds/getItem.mp3"}),
        throwItem : new pc.Asset('throwItem',"audio",{url:"/static/assets/sounds/throwItem.mp3"}),
        selectItem : new pc.Asset('selectItem',"audio",{url:"/static/assets/sounds/select.mp3"}),
        placeItem : new pc.Asset('placeItem',"audio",{url:"/static/assets/sounds/placeItem.mp3"}),
        thud : new pc.Asset('thud',"audio",{url:"/static/assets/sounds/thud.mp3"}),
        spikeySounds : {
            spikeyGrowl1 : new pc.Asset('growl1',"audio",{url:"/static/assets/sounds/spikeyGrowl1.mp3"}),
            spikeyGrowl2 : new pc.Asset('growl2',"audio",{url:"/static/assets/sounds/spikeyGrowl2.mp3"}),
            spikeyGrowl3 : new pc.Asset('growl3',"audio",{url:"/static/assets/sounds/spikeyGrowl3.mp3"}),
            spikeyGrowl4 : new pc.Asset('growl4',"audio",{url:"/static/assets/sounds/spikeyGrowl4.mp3"}),
            spikeyGrowl5 : new pc.Asset('growl5',"audio",{url:"/static/assets/sounds/spikeyGrowl5.mp3"}),
            spikeyGrowl6 : new pc.Asset('growl6',"audio",{url:"/static/assets/sounds/spikeyGrowl6.mp3"}),
        },
    },
    shaders : {
        cel_shader_object_vert : new pc.Asset("cel_shader_object_vert", "shader" , { url : "/static/js/shaders/celShaderObject.vert"}),
        cel_shader_object_frag : new pc.Asset("cel_shader_object_frag", "shader" , { url : "/static/js/shaders/celShaderObject.frag"}),
        claude_fog_outline_vert : new pc.Asset("claude_fog_outline_vert", "shader", { url : "/static/js/shaders/claude-fog-outline.vert"}),
        claude_fog_outline_frag : new pc.Asset("claude_fog_outline_frag", "shader", { url : "/static/js/shaders/claude-fog-outline.frag"}), 
        post_effect_vert : new pc.Asset("post-effect_vert", "shader", { url : "/static/js/shaders/post-effect.vert"}),
        post_effect_frag : new pc.Asset("post-effect_frag", "shader", { url : "/static/js/shaders/post-effect.frag"}), 
        outlineToonVert : new pc.Asset("post-effect_vert", "shader", { url : "/static/js/shaders/outlineToon.vert"}),
        outlineToonFrag : new pc.Asset("post-effect_frag", "shader", { url : "/static/js/shaders/outlineToon.frag"}), 
        toon_edge_frag : new pc.Asset("toon_edge_frag", "shader", { url : "/static/assets/shaders/toon_edge_frag.shader"}),
        toon_frag : new pc.Asset("toon_frag", "shader", { url : "/static/assets/shaders/toon_frag.shader"}),
        toon_vert : new pc.Asset("toon_vert", "shader", { url : "/static/assets/shaders/toon_vert.shader"}),

    },
    textures : {
        skyboxes : {

            helipad: new pc.Asset("helipad-env-atlas","texture",
                    { url: "/static/assets/textures/skyboxes/helipad-env-atlas.png" },
                    { type: pc.TEXTURETYPE_RGBP, mipmaps: false }
                ),
            space2: new pc.Asset("space2","texture",
                    { url: "/static/assets/textures/skyboxes/space_cube2.jpg" },
                    { type: pc.TEXTURETYPE_RGBP, mipmaps: false }
                ),
        },
        mr_faceless_clothing : new pc.Asset("mr_faceless_clothing", "texture", { url : "/static/assets/textures/mr_faceless_clothing.jpg"}),
        toonRamp : new pc.Asset("toonRamp", "texture", { url : "/static/assets/textures/toonRamp.png"}),
        ui : {
            numberCubePos: new pc.Asset("numberCubePos", "texture", { url: "/static/assets/textures/ui/numberCubePos.png", }),
            numberCubeNeg: new pc.Asset("numberCubeNeg", "texture", { url: "/static/assets/textures/ui/numberCubeNeg.png", }),
            numberSpherePos: new pc.Asset("numberSpherePos", "texture", { url: "/static/assets/textures/ui/numberSpherePos.png", }),
            numberSphereNeg: new pc.Asset("numberSphereNeg", "texture", { url: "/static/assets/textures/ui/numberSphereNeg.png", }),
            icons : {
                bow : new pc.Asset("iconBow", "texture", { url: "/static/assets/textures/ui/iconBow.png", }),
                sword : new pc.Asset("iconSword", "texture", { url: "/static/assets/textures/ui/iconSword.png", }),
                multiblaster : new pc.Asset("iconMultiblaster", "texture", { url: "/static/assets/textures/ui/iconMultiblaster.png", }),
                hoop : new pc.Asset("iconHoop", "texture", {url : "static/assets/textures/ui/iconHoop.png" }),
            },
        },
        creatures : {
            sheep : new pc.Asset('sheepTex',"texture", { url: '/static/assets/textures/creatures/sheep.png'}),
        },
        structures : {
            village_houses : new pc.Asset('village_houses',"texture", { url: '/static/assets/textures/structures/village_houses.jpg'}),
            heiroglyphs : new pc.Asset('heiroglyphs ',"texture", { url: '/static/assets/textures/structures/heiro.jpg'}),
        },
        stone_moss : new pc.Asset('stone_moss',"texture", { url: '/static/assets/textures/stone-moss.jpg'}), 
        hoop : new pc.Asset('hoop',"texture", { url: '/static/assets/textures/hoop.png'}), 
        gadget :  new pc.Asset('hoop',"texture", { url: '/static/assets/textures/gadgets.png'}), 
        riverpic: new pc.Asset("riverpic", "texture", { url: "/static/assets/textures/riverpic.jpg", }),
        chess: new pc.Asset("chess", "texture", { url: "/static/assets/textures/chess.png", }),
        fuzzk : new pc.Asset("fuzzk", "texture", { url: "/static/assets/textures/fuzzk.png", }),
        stone: new pc.Asset("stone", "texture", { url: "/static/assets/textures/stone.jpg", }),
        stone90: new pc.Asset("stone90", "texture", { url: "/static/assets/textures/stone90.jpg", }),
        grid_thin_green : new pc.Asset("grid_blue", "texture", { url: '/static/assets/textures/grid_thin_green2.jpg' }),
        spaceship_texture_1 : new pc.Asset("spaceship_texture_1", "texture", { url: '/static/assets/textures/spaceship_texture_1.jpg' }),
        terrain : {
            concrete1 : new pc.Asset("grass", "texture", { url: '/static/assets/textures/terrain/concrete1.jpg' }),
            grass : new pc.Asset("grass", "texture", { url: '/static/assets/textures/terrain/grass1.jpg' }),
            purple : new pc.Asset("purple", "texture", { url: '/static/assets/textures/terrain/purple.jpg' }),
            dirt : new pc.Asset("dirt", "texture", { url: '/static/assets/textures/terrain/dirt.jpg' }),
            hex_tile : new pc.Asset("hex_tile", "texture", { url: '/static/assets/textures/terrain/hex_tile.jpg' }),
            grid_blue : new pc.Asset("grid_fine", "texture", { url: '/static/assets/textures/terrain/grid_fine.jpg' }),
            grid_fine : new pc.Asset("grid_fine", "texture", { url: '/static/assets/textures/terrain/grid_fine.jpg' }),
            water : new pc.Asset("grid_blue", "texture", { url: '/static/assets/textures/terrain/water.jpg' }),
        },
    }

};
   

// Apply the Proxy to the assets object
function createLazyLoadingProxy(obj) {
    return new Proxy(obj, {
        loaded: {},
		get(target, prop) {
			if (prop in this.loaded){
				return this.loaded[prop];
			}

			if (!(prop in this.loaded)) {
				const value = target[prop];
				if (typeof value === 'function') {
					this.loaded[prop] = value();
				} else if (typeof value === 'object' && value !== null) {
                    // Was it a nested object?
                    if (value.constructor.name == 'Asset'){
                        console.log("We loaded it now:"+value.name);
                        this.loaded[prop] = value;
                    } else if (value.constructor.name == 'Object') {
                            // It was a nested object; recurse
                            // this only is called when iterating through the original object to create the proxy.
                            // would erroneously be called if you tried to load an asset in-game that was actually a nested object with real pc objects inside it. 
                        this.loaded[prop] = createLazyLoadingProxy(value);
                    } else {
                        console.log("oops?")
                        console.log(value);
                    }
				} else {
                    console.log("Why are you loading this object? What type of object was it?: "+value);
                    console.log("prop:")
                    console.log(prop);
					this.loaded[prop] = value;
				}
			}
			return this.loaded[prop]; // will return null if the pcAsset wasn't loaded yet!
		}
	});
}


LoadAssetsIntoPlaycanvas(assets2);
LoadAssetsIntoPlaycanvas(assets);

assets2 = createLazyLoadingProxy(assets2);
assets = createLazyLoadingProxy(assets);


// Problem: All assets are loaded at front of app, slowing load times.
// Solution: Lazy load assets only when they are used.
// Architecture decision: I want to have one place where assets are defined (here).
// Architecture: I want to be able to instantiate these assets at any time during gameplay
//      by calling Game.Instantiate.someAsset(options);
//      Instantiate method call should always match the asset name
//      Therefore Game.Instantiate(assets.someAsset,options) should be the preferred methodology
// 
// Done Thurs Aug 8 2024 - 
// assets2 are added to registry but not loaded until they are instantiated.

const assets2 = {
    gothicChurchCeiling: new pc.Asset("gothicChurchCeiling", "container", { url: "/static/assets/models/gothic_church_ceiling.glb", }),
    dance : new pc.Asset("Dance", "container", { url: "/static/assets/animations/win-dance.glb",    }),
    sounds : {
        nature : new pc.Asset('natureSound',"audio",{url:"/static/assets/sounds/nature.mp3"}),
        chillwave : new pc.Asset('chillwave',"audio",{url:"/static/assets/sounds/chillwave.mp3"}),
        dreamscape : new pc.Asset('dreamscape',"audio",{url:"/static/assets/sounds/pond5_055821059_ambient_dreamscape.mp3"}),
       
    },
    skyboxes : {
        skybox_space: new pc.Asset("skybox_space", "container", { url: "/static/assets/textures/skyboxes/inside_galaxy_skybox_hdri_360_panorama.glb",    }),

    },
    models : {
        lizard_wizard: new pc.Asset("lizard_wizard", "container", { url: "/static/assets/models/lizard_wizard.glb", }),

    },
}

// load all assets from assets2
let assets2list = Utils2.getFlatObjectValues(assets2);
for(let i=0;i<assets2list.length;i++){
    let asset = assets2list[i];
    pc.app.assets.add(asset);
    // console.log("added:"+asset.name);

}

setTimeout(function(){
   // Game.Instantiate2(assets2.gothicChurchCeiling,{position:Game.player.getPosition()})
},5000);


// attempt to create different lazy instantiations
Game.Instantiate2 = async function(asset,options={}){
    
    var asset = pc.app.assets.find(asset.name);
    if (!asset.loaded) {
        pc.app.assets.once("load:" + asset.id, function (asset) {
            console.log("loaded first time"+asset.name);
            let clone = asset.resource.instantiateRenderEntity();
            pc.app.root.addChild(clone);
            clone.setLocalScale(pc.Vec3.ONE.mulScalar(options.scale));
            clone.moveTo(options.position);
            return clone;
            // do something with asset.resource
        });
        pc.app.assets.load(asset);
    } else {
        let clone = asset.resource.instantiateRenderEntity();
        clone.moveTo(options.position);
        pc.app.root.addChild(clone);
        clone.setLocalScale(pc.Vec3.ONE.mulScalar(options.scale));
        console.log("loaded again"+asset.name);
        return clone;
        // do something with asset.resource
    }
}

Game.Instantiate3 = function(asset,options={}){
    
    let clone = asset.resource.instantiateRenderEntity();
    clone.moveTo(options.position);
    pc.app.root.addChild(clone);
    clone.setLocalScale(pc.Vec3.ONE.mulScalar(options.scale));
    console.log("loaded again"+asset.name);
    return clone;
    // do something with asset.resource
}



