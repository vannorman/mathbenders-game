precision highp float;

uniform sampler2D uColorBuffer;

varying vec2 vUv0;

void main() {
   vec4 texel = texture2D(uColorBuffer, vUv0);
   texel.g = vUv0.x * vUv0.x / vUv0.y / 10.0; 
   gl_FragColor = vec4(texel.rgb, texel.a);
}


