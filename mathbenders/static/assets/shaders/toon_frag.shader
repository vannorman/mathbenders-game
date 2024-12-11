precision highp float;

uniform vec3 lightDirection;
uniform vec4 edgeColor;
uniform sampler2D texture;

varying vec3 vNormal;

// Fragment shader
// Use light direction and model normal to pick value from ramp texture
void main(void) {
    float diffuse = clamp(dot(vNormal, lightDirection), 0.0, 1.0);
    gl_FragColor = texture2D(texture, vec2(diffuse, 0.0));
}


