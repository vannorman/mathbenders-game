export default class ChangeMapScreen {

    mapIcons = []; // show user all availble maps in this realm; click map to navigate to it for editing 
    group;
    layout;

    constructor () {
        const group = new pc.Entity("changemap");
        group.addComponent('element',{
            type:'image',
            textureAsset: assets.textures.ui.builder.changeMapBg,
            anchor:[0.52,0.52,0.52,0.52],
            pivot:[0.5,0.5],
            height:420,
            width:500,
            opacity:1,
            useInput:true
        }); 
      
        UI.AddCloseWindowButton({
            parentEl:group,
            onClickFn:function(){realmEditor.toggle('normal')}
            });

        const groupLayout = new pc.Entity();
        groupLayout.addComponent("element", {
            type: "image",
            anchor: [0.5,0.5,0.5,0.5],
            pivot: [0.5, 0.5],       
            width:380,
            height:340,
            color:pc.Color.WHITE,
        });

        groupLayout.addComponent("layoutgroup", {
            orientation: pc.ORIENTATION_HORIZONTAL,
            spacing: new pc.Vec2(10, 10),
            // fit_both for width and height, making all child elements take the entire space
            widthFitting: pc.FITTING_NONE,
            heightFitting: pc.FITTING_NONE,
            // wrap children
            wrap: true,
        });

        group.addChild(groupLayout);
        group.enabled=false;
        this.group = group;
        this.layout = groupLayout;
    }

    UpdateMapIcons(args={}){
        const {levels}=args;

       this.mapIcons.forEach(x=>{x.destroy();});
       this.mapIcons = [];
        
       levels.forEach(level=>{
            const tempCam = new pc.Entity();
            tempCam.addComponent('camera',{
                layers: [pc.LAYERID_SKYBOX, pc.LAYERID_DEPTH,  pc.LAYERID_WORLD ],
                priority:0,
                aspectRatio:1,//realmEditor.camera.skyCamAspectRatio,
                gammaCorrection:1,
            });

            pc.app.root.addChild(tempCam);
            tempCam.setLocalEulerAngles(realmEditor.camera.entity.getLocalEulerAngles());
            const camDist = 500;
            const camPos = level.terrain.entity.getPosition().clone().
                add(realmEditor.camera.entity.forward.clone().mulScalar(-1).
                mulScalar(camDist));

            tempCam.moveTo(camPos);

            const tempCamPivotPosition = tempCam.getPosition().clone();
            const icon = UI.SetUpItemButton({
                parentEl:this.layout,
                width:60,height:60,

                anchor:[.2,.5,.2,.5],
                mouseDown:function(){
                    realmEditor.toggle('normal');
                    realmEditor.camera.translate({  
                        targetPivotPosition:tempCamPivotPosition,
                        targetZoomFactor:level.terrain.scale*1.5
                    });
                    realmEditor.currentLevel = level;
                    realmEditor.gui.terrain.UpdateTerrainToolValues({terrainData:level.terrain.data});
                   },
                cursor:'pointer',
            });
            const $this =this;
            UI.AddCloseWindowButton({
                parentEl:icon,
                onClickFn:function(){
                    var deleteLevel = confirm("Are you sure you want to delete RealmBuilder map?");
                    if (deleteLevel == true) {
                        level.Clear();
                        const levelIndex = realmEditor.RealmData.Levels.indexOf(level);
                        realmEditor.RealmData.Levels.splice(levelIndex,1);
                        $this.UpdateMapIcons({levels:realmEditor.RealmData.Levels});
                    }
                }
            });


            this.mapIcons.push(icon);

            const texture = new pc.Texture(pc.app.graphicsDevice, {
                width: 64,
                height: 64,
                format: pc.PIXELFORMAT_R8_G8_B8_A8,
                encoding: pc.TEXTUREENCODING_LINEAR,
                mipmaps: true,
                aspectRatio:1,
                addressU: pc.ADDRESS_CLAMP_TO_EDGE,
                addressV: pc.ADDRESS_CLAMP_TO_EDGE
            });
            const renderTarget = new pc.RenderTarget({
                name: 'RT',
                colorBuffer: texture,
                depth: true,
                flipY: !pc.app.graphicsDevice.isWebGPU,
                samples: 2
            });

            //tempCam.camera.renderTarget = renderTarget;
            Game.t=tempCam;
            Game.rt = renderTarget;
            Game.i = icon;
            Game.tex = texture;
            tempCam.camera.renderTarget = renderTarget;

            icon.element.texture=texture;
            setTimeout(function(){tempCam.destroy();},1) 

//            // Render once to the texture then scrap the camera
//           pc.app.once('frameend', ()=> {
//                pc.app.renderNextFrame = true;
//                pc.app.once('frameend', ()=> {
//                    icon.element.texture = texture;
//                    tempCam.destroy();
//                    tempCamPivot.destroy();
//                });
//            });

        });

        // Create New Terrain button
        const icon = UI.SetUpItemButton({
            parentEl:this.layout,
            width:60,height:60,
            textureAsset:assets.textures.ui.builder.newMap,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){
                // Create new level AND new terrain by GUI interaction

                const level = realmEditor.createNewLevel();
                realmEditor.currentLevel = level;
                realmEditor.camera.translate({source:"new terrain",targetPivotPosition:realmEditor.currentLevel.terrain.centroid,targetZoomFactor:50});

                realmEditor.gui.terrain.UpdateTerrainToolValues();
                realmEditor.toggle('normal');

            },
            cursor:'pointer',
        });
        this.mapIcons.push(icon);
    }
}








       

