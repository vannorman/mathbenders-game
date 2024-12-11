precision mediump float;
uniform sampler2D uTexture;
uniform bool uIsNegative;
varying float vertOutTexCoord;
varying vec2 texCoord;
void main(void)
{
    float v = (vertOutTexCoord + 1.0) * 0.5;
    v = float(ceil(v * 20.0)) / 20.0;
    if (v > 0.95) v = 0.97;
    else if (v > 0.5) v = 0.95;
    else if (v > 0.10) v = 0.75;
    else v = 0.3;
    if (uIsNegative) v -= 0.60;
    // vec4 color = texture2D (uTexture, texCoord); // try this to use the diffuse color.
    vec4 color = vec4(0.5, 0.47, 0.43, 1.0) * 2.05;
    gl_FragColor = color * vec4(v, v, v, 1.0);
}


