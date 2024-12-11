// Vertex shader
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

varying vec3 vTransformedNormal;
varying vec4 vPosition;

void main(void) {
    vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
    vTransformedNormal = uNMatrix * aVertexNormal;
    gl_Position = uPMatrix * vPosition;
}

