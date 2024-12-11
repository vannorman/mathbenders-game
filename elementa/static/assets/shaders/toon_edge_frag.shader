precision mediump float;

uniform vec4 edgeColor;

// Fragment Shader
// For edges, just set to edge color
void main(void) {
    gl_FragColor = edgeColor;
}
