var PortalCameraRenderTexture = pc.createScript('portalCameraRenderTexture');

// let's use a render texture. We want the portal camera to be positioned correctly (lined up with main camera, but at the portal destination, which works as expected.) Then, instead of using fancy depth buffer stuff, we will simply render those pixels that it sees through the portal (pixels which fall inside the box, something our shader already does), and render them ON the render texture for the portal doorway.

// TODO: It's easier than you think ..
// You need a custom shader on the door. Then simply render the camera's texture to that shader, in screen space only (not world space). 
// This will draw pixels on that shader per screen space of the target camera, resulting in a perfect portal.


PortalCameraRenderTexture.attributes.add('staticObjSource', { type: 'entity' }); // portal we are standing in front of
PortalCameraRenderTexture.attributes.add('staticObjTarget', { type: 'entity' }); // portal far away
PortalCameraRenderTexture.attributes.add('sourceCam', {type: 'entity'}); // player camera
PortalCameraRenderTexture.attributes.add('targetCam', {type: 'entity'}); // player camera
PortalCameraRenderTexture.attributes.add('renderTexture', {type: 'renderTexture'}); // player camera
PortalCameraRenderTexture.attributes.add('renderTarget', {type: 'object'});// a t??
PortalCameraRenderTexture.attributes.add('renderPlane', {type: 'entity'});// a t??



// look at vec3 delta between player camera and portal we're standing next to, 
// then position this object equivalently, relative to the target portal

//class PortalCameraService {
//    static init(){
//        PortalCameraRenderTexture.prototype.init();
//    }
//}

PortalCameraRenderTexture.prototype.initialize = function(){
    this.sourceCam = Camera.main.entity;
    //console.log('init, maincam:'+Camera.main.entity);
    this.sourceTracker = new pc.Entity("sourceTracker");
    this.targetTracker = new pc.Entity("targetTracker");
    this.targetTracker.addComponent('render',{type:'box'});
    this.targetTracker.render.material = Materials.red;
    this.checkPortalTimer =0;

    this.updateConfig();


    this.targetCam = this.setupCamera();
    this.setupTexture();
}

PortalCameraRenderTexture.prototype.setupCamera = function(){
    let cam3 = new pc.Entity("cam3");
    cam3.addComponent("camera", {
        layers: [pc.LAYERID_WORLD, pc.LAYERID_SKYBOX],
        renderTarget: this.renderTarget,
//        clearColorBuffer:false,
        priority:-1,
        nearClip:7,
    });
    pc.app.root.addChild(cam3);
    Camera.portal = cam3.camera;
    return cam3;
};




PortalCameraRenderTexture.prototype.updateConfig = function(){
    if (!this.sourceTracker || !this.targetTracker || !this.staticObjSource || !this.staticObjTarget || !this.staticObjTarget.parent || !this.staticObjTarget.parent.parent) return; // ugh
    this.staticObjTarget.parent.parent.getComponentsInChildren('portal')[0].camPivot.addChild(this.targetTracker);
    this.staticObjSource.addChild(this.sourceTracker);
}

PortalCameraRenderTexture.prototype.setupTexture = function(){
    // Set the shader to use the camera texture

    this.renderTexture= new pc.Texture(pc.app.graphicsDevice, {
        width: pc.app.graphicsDevice.canvas.clientWidth,
        height: pc.app.graphicsDevice.canvas.clientHeight,
        format: pc.PIXELFORMAT_RGB8,
        mipmaps: true,
        minFilter: pc.FILTER_LINEAR,
        magFilter: pc.FILTER_LINEAR,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE,
    });

    this.renderTarget = new pc.RenderTarget({
        name: `RT`,
        colorBuffer: this.renderTexture,
        flipY: true,
        flipX:false,
        autoResolve:false,
    });


    this.vertShader = `
        attribute vec3 vertex_position;
        uniform mat4 matrix_model;
        uniform mat4 matrix_viewProjection;
        varying vec2 uv;

        void main(void) {
            gl_Position = matrix_viewProjection * matrix_model * vec4(vertex_position, 1.0);  // get world to screen pixel space
            vec4 pos = matrix_viewProjection * matrix_model * vec4(vertex_position, 1.0);
            pos.x = -pos.x; // flip X, setting "flipX" in the renderTarget has no effect 
            uv = 0.5 - 0.5 * (pos.xyz/pos.w).xy; // reposition to screen space
        }
    `;

    this.fragShader = `
        precision mediump float;
        varying vec2 uv;
        uniform sampler2D uEmissiveMap; // The render texture is applied to emissive map.

        void main() {
           vec4 color = texture2D(uEmissiveMap, uv);
           gl_FragColor = color;
        }
    `;

 

    // Create a custom material with the shader on it that 
    this.targetCam.camera.renderTarget = this.renderTarget;
    this.renderMaterial = new pc.ShaderMaterial({
        attributes: {
            vertex_position : pc.SEMANTIC_POSITION,
            aNormal: pc.SEMANTIC_NORMAL,
        },
        vertexCode: this.vertShader,
        fragmentCode: this.fragShader,
        name:'portalshader',
    });

 
    this.renderMaterial.setParameter('uEmissiveMap', this.renderTexture)
//    this.renderMaterial.shader = shader;

}

PortalCameraRenderTexture.prototype.postUpdate = function(dt){
    // is there a pre- or early- or even late- update?
    // noticing lag that the render texture here lags behind player camera movement, they should be in sync
    // check_proto.setFrameBuffer and more in playcanvas source around line 261ound line 26147
    // (_proto.initializeExtensions)

    this.checkPortalTimer -= dt;
    if (this.checkPortalTimer < 0 && pc.app.root.getComponentsInChildren('portal').length > 0){
        const interval = 0;//Math.random()*0.5;
        this.checkPortalTimer = interval;
        const nearestPortal = Player.entity.getNearestObjectOfType('portal').entity;
        const distToNearestPortal = Player.entity.getPosition().distance(nearestPortal.getPosition());
        const distToCurrentPortal = this.currentPortal ? Player.entity.getPosition().distance(this.currentPortal.getPosition()) : Infinity;
        if (distToNearestPortal < distToCurrentPortal){
            this.currentPortal = nearestPortal;
            // we're near a different portal, so switch camera approps

            pc.app.root.getComponentsInChildren('portal').forEach(portal => { 
                portal.portalPlane.render.enabled = false; 
                portal.portalPlane.render.emissiveMap = null;
            //    portal.portalPlane.render.material.update();
                portal.portalPlane.render.material = null;
                portal.portalPlane.enabled=false;

            })
            this.staticObjSource = nearestPortal;
            this.renderPlane = nearestPortal.script.portal.portalPlane;
            this.renderPlane.enabled=true;
            this.renderPlane.render.material = this.renderMaterial; 
            this.renderPlane.render.material.emissiveMap = this.renderTexture;     // assign the rendered texture as an emissive texture
            this.renderPlane.render.enabled = true;
            this.renderPlane.render.material.update();
            //console.log("Eh:"+this.renderPlane);
            this.staticObjTarget = nearestPortal.script.portal.dest;
            this.updateConfig(); 
        } else {
//#            console.log("Near:"+distToNearestPortal+", cur;"+distToCurrentPortal);
        }
    }

    if (!this.sourceTracker 
        || !this.targetTracker 
        || !this.sourceCam 
        || !this.targetCam 
        || !this.staticObjSource 
        || !this.staticObjTarget) return;

    //console.log("pupdate:+"+this.targetCam.getPosition());
    // Match source to main cam rot and pos
    this.sourceTracker.setRotation(this.sourceCam.getRotation()); 
    this.sourceTracker.setPosition(this.sourceCam.getPosition());
    
    // Set target locals equal to source locals
    this.targetTracker.setLocalRotation(this.sourceTracker.getLocalRotation());
    this.targetTracker.setLocalPosition(this.sourceTracker.getLocalPosition());

    // Match our follow object (this entity) to target globals
    this.targetCam.setRotation(this.targetTracker.getRotation());
    this.targetCam.setPosition(this.targetTracker.getPosition());


};


