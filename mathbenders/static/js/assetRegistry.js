const assets = {
    // Animations : https://playcanvas.com/editor/scene/961236
    // Animations: https://forum.playcanvas.com/t/solved-how-do-you-programmatically-import-and-apply-animations-to-models-from-mixamo/15248/2

    skybox_city: new pc.Asset("", "container", { url: "/static/assets/models/skybox_city.glb",    }),
    axis: new pc.Asset("", "container", { url: "/static/assets/models/axis.glb",    }),
    tree: new pc.Asset("", "container", { url: "/static/assets/models/lowpoly_tree_birch2.glb",    }),
    numberHoop: new pc.Asset("", "container", { url: "/static/assets/models/hoop.glb", }),
    riser : new pc.Asset("", "container", { url: "/static/assets/models/riser.glb", }),
    portal: new pc.Asset("", "container", { url: "/static/assets/models/portal.glb", }),
//    church: new pc.Asset("", "container", { url: "/static/assets/models/church.glb", }),
    animations : {
        // NOTE: To import an fbx animation, load the playcanvas web editor, drag fbx in, then download the converted glb animation.
        // NOTE: To find and download an fbx animation use Mixamo.
        // NOTE: our "Mascot" model is NOT the identical skeleton as a humanoid.  So upload Mascot.fbx to Mixamo if you need an animation for Mascot.
        idle : new pc.Asset("", "container", { url: "/static/assets/animations/Mascot@Idle-Animation-mixamo.com.glb",    }),
        walk : new pc.Asset("", "container", { url: "/static/assets/animations/walking1.glb",    }),
        run : new pc.Asset("", "container", { url: "/static/assets/animations/run.glb",    }),
        standing_arguing : new pc.Asset("", "container", { url: "/static/assets/animations/standing_arguing.glb",}),
        standing_arguing2 : new pc.Asset("2", "container", { url: "/static/assets/animations/standing_arguing2.glb",}),
        yelling : new pc.Asset("", "container", { url: "/static/assets/animations/yelling.glb",    }),
        jump : new pc.Asset("", "container", { url: "/static/assets/animations/jump1.glb",    }),
        strafeleft : new pc.Asset("", "container", { url: "/static/assets/animations/strafeleft.glb",    }),
        straferight : new pc.Asset("", "container", { url: "/static/assets/animations/straferight.glb",    }),
        swim : new pc.Asset("", "container", { url: "/static/assets/animations/swim.glb",    }),
    },
    models : {
        // mr_ball_faceless : new pc.Asset("", "container", { url: "/static/assets/models/mr_ball_faceless@.glb",    }),
        fin : new pc.Asset("", "container", { url: "/static/assets/models/fin.glb",    }),
        funnel : new pc.Asset("", "container", { url: "/static/assets/models/funnel.glb",    }),
        spike : new pc.Asset("", "container", { url: "/static/assets/models/spike.glb",    }),
        arrow : new pc.Asset("", "container", { url: "/static/assets/models/arrow.glb",    }),
        mascot : new pc.Asset("", "container", { url: "/static/assets/models/mascot.glb",    }), 
//        mascot_idle :  new pc.Asset("", "container", { url: "/static/assets/models/mascot@idle.glb",    }),
        creatures: {
            sheep :  new pc.Asset("", "container", { url: "/static/assets/models/creatures/sheep.glb",    }),
            spikey: new pc.Asset("", "container", { url: "/static/assets/models/creatures/spikey.glb", }),

        },
        trees : {
            tree1 :  new pc.Asset("", "container", { url: "/static/assets/models/trees/Tree1.glb",    }),

        },
        structures: {
            flat_pyramid :  new pc.Asset("", "container", { url: "/static/assets/models/structures/flat_pyramid.glb",    }),
            spaceship:new pc.Asset("", "container", { url: "/static/assets/models/structures/spaceship.glb",    }),
            spaceship2:new pc.Asset("2", "container", { url: "/static/assets/models/structures/ship3.glb",    }), // current one using
            house2:  new pc.Asset("2", "container", { url: "/static/assets/models/structures/house2.glb",    }),
            house3:  new pc.Asset("3", "container", { url: "/static/assets/models/structures/house3.glb",    }),
            house4:  new pc.Asset("4", "container", { url: "/static/assets/models/structures/house4.glb",    }),
            house5:  new pc.Asset("5", "container", { url: "/static/assets/models/structures/house5.glb",    }),
            house6:  new pc.Asset("6", "container", { url: "/static/assets/models/structures/house6.glb",    }),
            house7:  new pc.Asset("7", "container", { url: "/static/assets/models/structures/house7.glb",    }),
        },
        // wall:  new pc.Asset("", "container", { url: "/static/assets/models/wall.glb",    }),
        castle_wall2: new pc.Asset("", "container", { url: "/static/assets/models/structures/castles/castleWall3.glb",    }),
        castle_top: new pc.Asset("", "container", { url: "/static/assets/models/structures/castles/castleTop.glb",    }),
        castle_pillar: new pc.Asset("", "container", { url: "/static/assets/models/structures/castles/castlePillar.glb",    }),
        ramp: new pc.Asset("", "container", { url: "/static/assets/models/structures/castles/ramp.glb",    }),
//        stairs1: new pc.Asset("", "container", { url: "/static/assets/models/structures/castles/stairs1.glb",    }),
//        stairs2: new pc.Asset("", "container", { url: "/static/assets/models/structures/castles/stairs1.glb",    }),
        castle_gate : new pc.Asset("", "container", { url: "/static/assets/models/structures/castles/castleGate.glb",    }),
        half_door : new pc.Asset("", "container", { url: "/static/assets/models/structures/halfDoor.glb",    }),
        castle_doorway : new pc.Asset("", "container", { url: "/static/assets/models/structures/castles/castleDoorway.glb",    }),
        faucet: new pc.Asset("", "container", { url: "/static/assets/models/faucet.glb", }),
        low_poly_wizard: new pc.Asset("", "container", { url: "/static/assets/models/low_poly_wizard_rigged.glb", }),
        icosphere: new pc.Asset("", "container", { url: "/static/assets/models/icosphere.glb", }),
        gadgets : {
            zooka : new pc.Asset("", "container", { url: "/static/assets/models/gadgets/zooka.glb", }),
            multiblaster: new pc.Asset("", "container", { url: "/static/assets/models/gadgets/multiblaster.glb", }),
            sword: new pc.Asset("", "container", { url: "/static/assets/models/gadgets/sword.glb",    }),
            bow: new pc.Asset("", "container", { url: "/static/assets/models/gadgets/bow.glb",    }),
        },
       // multiblaster2: new pc.Asset("2", "container", { url: "/static/assets/models/multiblaster.dae", }),
    },
    font : new pc.Asset("-benchnine", "font", { url: "/static/fonts/BenchNine-Bold.json",        }),
    fonts : {
        montserrat_bold : new pc.Asset("-montserrat", "font", { url: "/static/fonts/Montserrat-Bold.json",        }),
        montserrat : new pc.Asset("-montserrat", "font", { url: "/static/fonts/Montserrat-Regular.json",        }),
    },
    quad: new pc.Asset("", "texture", { url: "/static/assets/textures/ui/quad.jpg",        }),
    sounds : {
        plunger : new pc.Asset('river',"audio",{url:"/static/assets/sounds/plunger.mp3"}),
        missile : new pc.Asset('river',"audio",{url:"/static/assets/sounds/missile.mp3"}),
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
        poofs : {
            poof1 : new pc.Asset('growl1',"audio",{url:"/static/assets/sounds/poof1.mp3"}),
        },
         spikeySounds : {
            spikeyGrowl1 : new pc.Asset('growl1',"audio",{url:"/static/assets/sounds/spikeyGrowl1.mp3"}),
            spikeyGrowl2 : new pc.Asset('growl2',"audio",{url:"/static/assets/sounds/spikeyGrowl2.mp3"}),
            spikeyGrowl3 : new pc.Asset('growl3',"audio",{url:"/static/assets/sounds/spikeyGrowl3.mp3"}),
            spikeyGrowl4 : new pc.Asset('growl4',"audio",{url:"/static/assets/sounds/spikeyGrowl4.mp3"}),
            spikeyGrowl5 : new pc.Asset('growl5',"audio",{url:"/static/assets/sounds/spikeyGrowl5.mp3"}),
            spikeyGrowl6 : new pc.Asset('growl6',"audio",{url:"/static/assets/sounds/spikeyGrowl6.mp3"}),
        },
        ui : {
            open : new pc.Asset('open',"audio",{url:"/static/assets/sounds/ui/open.mp3"}),
            save : new pc.Asset('open',"audio",{url:"/static/assets/sounds/ui/save.mp3"}),
            play : new pc.Asset('open',"audio",{url:"/static/assets/sounds/ui/play.mp3"}),
            place_item : new pc.Asset('open',"audio",{url:"/static/assets/sounds/ui/place_item.mp3"}),
        }
    },
    shaders : {
        cel_shader_object_vert : new pc.Asset("", "shader" , { url : "/static/js/shaders/celShaderObject.vert"}),
        cel_shader_object_frag : new pc.Asset("", "shader" , { url : "/static/js/shaders/celShaderObject.frag"}),
        outlineToonVert : new pc.Asset("-effect_vert", "shader", { url : "/static/js/shaders/outlineToon.vert"}),
        // Most shader logic including WarpFx / WarpByPoints, OutlineToon, and GroundFog is in outlineToon.frag
        outlineToonFrag : new pc.Asset("-effect_frag", "shader", { url : "/static/js/shaders/outlineToon.frag"}),  

    },
    textures : {
        skyboxes : {

            sunny: new pc.Asset("","texture",
                    { url: "/static/assets/textures/skyboxes/sunny-env-atlas.png" },
                    { type: pc.TEXTURETYPE_RGBP, mipmaps: false }
                ),
            helipad: new pc.Asset("-env-atlas","texture",
                    { url: "/static/assets/textures/skyboxes/helipad-env-atlas.png" },
                    { type: pc.TEXTURETYPE_RGBP, mipmaps: false }
                ),
            space2: new pc.Asset("2","texture",
                    { url: "/static/assets/textures/skyboxes/space_cube2.jpg" },
                    { type: pc.TEXTURETYPE_RGBP, mipmaps: false }
                ),
        },
        mr_faceless_clothing : new pc.Asset("", "texture", { url : "/static/assets/textures/mr_faceless_clothing.jpg"}),
        toonRamp : new pc.Asset("", "texture", { url : "/static/assets/textures/toonRamp.png"}),
        ui : {
            trash : new pc.Asset("", "texture", { url: "/static/assets/textures/ui/trash.png", }),
            numberCubePos: new pc.Asset("", "texture", { url: "/static/assets/textures/ui/numberCubePos.png", }),
            numberCubeNeg: new pc.Asset("", "texture", { url: "/static/assets/textures/ui/numberCubeNeg.png", }),
            numberSpherePos: new pc.Asset("", "texture", { url: "/static/assets/textures/ui/numberSpherePos.png", }),
            numberSphereNeg: new pc.Asset("", "texture", { url: "/static/assets/textures/ui/numberSphereNeg.png", }),
            icons : {
                spikey : new pc.Asset("", "texture", { url: "/static/assets/textures/ui/spikey.png", }),
                trees : new pc.Asset("", "texture", { url: "/static/assets/textures/ui/trees.png", }),
                fraction : new pc.Asset("", "texture", { url: "/static/assets/textures/ui/fraction.jpg", }),
                bow : new pc.Asset("", "texture", { url: "/static/assets/textures/ui/iconBow.png", }),
                sword : new pc.Asset("", "texture", { url: "/static/assets/textures/ui/iconSword.png", }),
                multiblaster : new pc.Asset("", "texture", { url: "/static/assets/textures/ui/iconMultiblaster.png", }),
                zooka : new pc.Asset("", "texture", { url: "/static/assets/textures/ui/zooka.png", }),
                faucet : new pc.Asset("", "texture", { url: "/static/assets/textures/ui/faucet.png", }),
                hoop : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/iconHoop.png" }),
                turret1 : new pc.Asset("1 ", "texture", {url : "/static/assets/textures/ui/iconTurret1.png" }),
                hand : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/iconHand.png" }),
                riser : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/iconRiser.png" }),
                wall : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/iconWall.png" }),
                wallBuilder : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/iconWallBuilder.png" }),
                wallBuilderTurret : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/iconWallBuilderTurret.png" }),
                numberWall : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/iconNumberWall.png" }),
                castleGate : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/castleGate.png" }),
                castleDoor : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/castleDoor.png" }),
                castleDoorDungeon : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/castleDoorDungeon.png" }),
                stairs1 : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/stairs1.png" }),
                stairs1 : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/stairs2.png" }),
            },
            builder : {
                arrow : new pc.Asset("","texture",{ url:"/static/assets/textures/ui/down-arrow.png"}),
                curved_arrow : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/curved_arrow.png" }),
                curved_arrow2 : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/curved_arrow2.png" }),
                copy : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/copy.png" }),

                select : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/builder_select.png" }),
                undo : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/undo.png" }),
                redo : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/redo.png" }),
                scaleItem : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/scale.png" }),
                concretePad : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/concretePad.png" }),
                concretePadBig : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/concretePadBig.png" }),
                editTerrain : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/iconEditTerrain.png" }),
                portal : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/iconPortal2.png" }),
                start : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/start.png" }),
                newMap : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/newmap.png" }),
                load : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/load.png" }),
                save : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/save.png" }),
                newRealm : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/newRealm.png" }),
                closeWindow : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/closeWindow.png" }),
                changeMapBg : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/changeMapBg.png" }),
                changeMapBtn : new pc.Asset("", "texture", {url : "/static/assets/textures/ui/changeMapBtn.png" }),
                editItemBackboard: new pc.Asset("", "texture", {url : "/static/assets/textures/ui/builder_gui_edit_item_backboard.png" }),
                moveItem: new pc.Asset("","texture",{ url: "/static/assets/textures/ui/builder_moveItem.png" }),
                quantity : new pc.Asset("","texture",{ url: "/static/assets/textures/ui/quantity.png" }),
                rotateItemLeft: new pc.Asset("","texture",{ url: "/static/assets/textures/ui/builder_rotate_item_left.png" }),
                rotateItemRight: new pc.Asset("","texture",{ url: "/static/assets/textures/ui/builder_rotate_item_right.png" }),
                moveUp: new pc.Asset("","texture",{ url: "/static/assets/textures/ui/builder_move_up.png" }),
                moveDown: new pc.Asset("","texture",{ url: "/static/assets/textures/ui/builder_move_down.png" }),
                moveUpBig: new pc.Asset("","texture",{ url: "/static/assets/textures/ui/builder_move_up_big.png" }),
                moveDownBig: new pc.Asset("","texture",{ url: "/static/assets/textures/ui/builder_move_down_big.png" }),
                orangeFade : new pc.Asset("","texture",{ url: "/static/assets/textures/ui/orangeFade.jpg" }),
            },
        },
        creatures : {
            sheep : new pc.Asset('sheepTex',"texture", { url: '/static/assets/textures/creatures/sheep.png'}),
        },
        structures : {
            village_houses : new pc.Asset('village_houses',"texture", { url: '/static/assets/textures/structures/village_houses.jpg'}),
            heiroglyphs : new pc.Asset('heiroglyphs ',"texture", { url: '/static/assets/textures/structures/heiro.jpg'}),
        },
        wood :  new pc.Asset('',"texture", { url: '/static/assets/textures/wood.png'}), 
        stone_moss : new pc.Asset('stone_moss',"texture", { url: '/static/assets/textures/stone-moss.jpg'}), 
        hoop : new pc.Asset('hoop',"texture", { url: '/static/assets/textures/hoop.png'}), 
        gadget :  new pc.Asset('hoop',"texture", { url: '/static/assets/textures/gadgets.png'}), 
        riverpic: new pc.Asset("", "texture", { url: "/static/assets/textures/riverpic.jpg", }),
        chess: new pc.Asset("", "texture", { url: "/static/assets/textures/chess.png", }),
        fuzzk : new pc.Asset("", "texture", { url: "/static/assets/textures/fuzzk.png", }),
        smoke : new pc.Asset("", "texture", { url: "/static/assets/textures/smoke.png", }),
        stone: new pc.Asset("", "texture", { url: "/static/assets/textures/stone.jpg", }),
        stone90: new pc.Asset("90", "texture", { url: "/static/assets/textures/stone90.jpg", }),
        grid_thin_green : new pc.Asset("", "texture", { url: '/static/assets/textures/grid_thin_green2.jpg' }),
        spaceship_texture_1 : new pc.Asset("1", "texture", { url: '/static/assets/textures/spaceship_texture_1.jpg' }),
        terrain : {
            concrete1 : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/concrete-tile-1.jpg' }),
            concrete2 : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/concrete1.jpg' }),
            grass : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/grass1.jpg' }),
            purple : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/purple.jpg' }),
            dirt : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/dirt.jpg' }),
            hex_tile : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/hex_tile.jpg' }),
            grid_coarse : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/grid_coarse.jpg' }),
            grid_blue : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/grid_fine.jpg' }),
            grid_fine : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/grid_fine.jpg' }), // grid black
            water : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/water.jpg' }),
            tree_green : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/tree_green.jpg' }),
            tree_brown : new pc.Asset("", "texture", { url: '/static/assets/textures/terrain/tree_brown.jpg' }),
        },
    }

};
   

/*
function createLazyLoadingProxy(obj) {
  return new Proxy(obj, {
    loaded: {},
    get(target, prop) {
      if (prop === 'loaded') {
        return this.loaded;
      }

      if (!(prop in this.loaded)) {
        const value = target[prop];
        if (typeof value === 'function') {
          this.loaded[prop] = value();
        } else if (typeof value === 'object' && value !== null) {
          this.loaded[prop] = createLazyLoadingProxy(value);
        } else {
          this.loaded[prop] = value;
        }
      }
      return this.loaded[prop];
    }
  });
}

let assets = {
  a: {
    b: () => new B(),
    c: () => new C()
  }
};

// Apply the Proxy to the assets object
assets = createLazyLoadingProxy(assets);

// Usage
console.log(assets.a.b); // Lazy loads and returns b
console.log(assets.a.b); // Returns cached b
console.log(assets.a.c); // Lazy loads and returns c

*/

