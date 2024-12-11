const PortalGeometry = pc.createScript("portalGeometry");
PortalGeometry.attributes.add("inside", {
    type: "boolean",
    default: true,
    title: "True indicating the geometry is inside the portal, false for outside",
});

PortalGeometry.prototype.initialize = function () {
    // based on value in the stencil buffer (0 outside, 1 inside), either render
    // the geometry when the value is equal, or not equal to zero.
    this.changeState(this.inside);
};

PortalGeometry.prototype.disable = function () {
    return;// set the stencil parameters on all materials
    const renders = this.entity.findComponents("render");
    
    renders.forEach((render) => {
        render.entity.layers = [Game.portalLayer.id];
        for (const meshInstance of render.meshInstances) {
            // clone each material so it doesn't affect other objects.
//            meshInstance.material = meshInstance.material.clone();
            meshInstance.material.stencilBack = meshInstance.material.stencilFront = null;
        }
    });

}

PortalGeometry.prototype.enable = function () {
    this.changeState(this.inside);
}


PortalGeometry.prototype.changeState = function (inside) {
    return;
    this.inside = inside;
    const stencil = new pc.StencilParameters({
        func: inside ? pc.FUNC_NOTEQUAL : pc.FUNC_EQUAL ,
        ref: 0,
    });

    // set the stencil parameters on all materials
    const renders = this.entity.findComponents("render");
    
    renders.forEach((render) => {
        render.layers = inside ? [Game.portalLayer.id] : [pc.LAYERID_WORLD];
        for (const meshInstance of render.meshInstances) {
            // clone each material so it doesn't affect other objects.
//            meshInstance.material = meshInstance.material.clone();
            meshInstance.material.stencilBack = meshInstance.material.stencilFront = stencil;
        }
    });
};

