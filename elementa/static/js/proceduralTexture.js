var ProceduralTexture = pc.createScript('proceduralTexture');

// initialize code called once per entity
ProceduralTexture.prototype.initialize = function() {
    this.entity.addComponent("render", {
        type: "plane",
    });
    
    var dimension = 4;
    
    // Create a 2x2x24-bit texture
    var device = this.app.graphicsDevice;
    var texture = new pc.Texture(device, {
        width: dimension,
        height: dimension,
        format: pc.PIXELFORMAT_R8_G8_B8,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE
    });

    var topLeft = new pc.Color(1, 0, 0, 1);     // red
    var topRight = new pc.Color(1, 1, 1, 1);    // white
    var bottomRight = new pc.Color(0, 1, 0, 1); // green
    var bottomLeft = new pc.Color(0, 0, 1, 1);  // blue

    // Fill the texture with a gradient
    // Locks mip level (level of detail) of the texture
    var pixels = texture.lock();        
    
    // and get an array with pixel data for us to fill.
    // Array type in this case will be pc.PIXELFORMAT_R8_G8_B8,
    // which has a size = width * height * depth * 3.
    //      - width and height are the texture sizes
    //      - depth will be 1 by default, unless you change it manually
    //      - 3 is amount of colors per pixel (red, green, blue)
    var count = 0;
    var top = new pc.Color();
    var bottom = new pc.Color();
    var result = new pc.Color();

    for (var w = 0; w < dimension; w++) {                   // pixel row
        for (var h = 0; h < dimension; h++) {               // pixel column

            // find a linearly interpolated color horizontally
            top.lerp(topLeft, topRight, w/(dimension-1));           // between top left and right
            bottom.lerp(bottomLeft, bottomRight, w/(dimension-1));  // between bottom left and right

            // then find the final color by interpolating top and bottom vertically
            result.lerp(top, bottom, h/(dimension-1));

            // assign the result color to each texture pixel:
            pixels[count++] = result.r * 255;       // red
            pixels[count++] = result.g * 255;       // green
            pixels[count++] = result.b * 255;       // blue
        }
    }

    texture.unlock();   // unlock miplevel and send it to VRAM

    var material = new pc.StandardMaterial();
    material.diffuseMap = texture;
    material.update();

    this.entity.render.material = material;
};

