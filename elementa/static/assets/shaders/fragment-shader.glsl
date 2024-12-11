precision mediump float;

varying vec2 uv;
uniform sampler2D sourceTexture;

void main() {
    // Define the square's size (0.5 means half of the screen)
    float squareSize = 0.5;

    // Center the uv coordinates on the screen
    vec2 centeredUV = uv - vec2(0.5);

    // Crop the view to a square in the center
    if (abs(centeredUV.x) > squareSize || abs(centeredUV.y) > squareSize) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Set to black outside the square
    } else {
        gl_FragColor = texture2D(sourceTexture, uv);
    }
}


