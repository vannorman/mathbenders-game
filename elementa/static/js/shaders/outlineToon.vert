precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec2 vUv0;
varying vec3 vNormal;

void main(void)
{
    vec2 vPosition = aPosition.xy;
    gl_Position = vec4(vPosition, 0.0, 1.0);
    vUv0 = (vPosition.xy + 1.0) * 0.5;
	vNormal = aNormal;
}

