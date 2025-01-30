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
                clearColorBuffer:true,
                clearDepthBuffer:true,
                farClip:15000,
                aspectRatio:realmEditor.camera.skyCamAspectRatio,
                aspectRatioMode:1
            });

            const tempCamPivot = new pc.Entity();
            const pivotOffset = pc.Vec3.ZERO;
            tempCamPivot.setPosition(level.terrain.entity.getPosition().add(pivotOffset));
            pc.app.root.addChild(tempCamPivot);
            tempCamPivot.addChild(tempCam);
            tempCam.setLocalEulerAngles(realmEditor.camera.defaultSettings.rotation);
            let camOffset = tempCam.forward.mulScalar(level.terrain.scale * -2.1);
            tempCam.setLocalPosition(camOffset);

            const tempCamPivotPosition = tempCamPivot.getPosition().clone();
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
                        $this.UpdateMapIcons();
                    }
                }
            });


            this.mapIcons.push(icon);

            var texture = new pc.Texture(pc.app.graphicsDevice, {
                width: 512,
                height: 512,
                format: pc.PIXELFORMAT_R8_G8_B8_A8,
                autoMipmap: true
            });

            // Create a render target
            var renderTarget = new pc.RenderTarget({ colorBuffer: texture, flipY: true, depth: true });
            tempCam.camera.renderTarget = renderTarget;

            // Render once to the texture then scrap the camera
           pc.app.once('postrender', function () {
                icon.element.texture = texture;
                tempCam.destroy();
                tempCamPivot.destroy();
            }.bind(pc)); 

            // TODO: Memory leak? Is render texture / render target need to be released?
        });

        // Create New Terrain button
        const icon = UI.SetUpItemButton({
            parentEl:this.layout,
            width:60,height:60,
            textureAsset:assets.textures.ui.builder.newMap,
            anchor:[.2,.5,.2,.5],
            mouseDown:function(){
                // Create new level AND new terrain by GUI interaction

                realmEditor.createNewLevel();
                realmEditor.gui.UpdateTerrainToolValues();
                realmEditor.toggle('normal');

            },
            cursor:'pointer',
        });
        this.mapIcons.push(icon);
    }
}








       

