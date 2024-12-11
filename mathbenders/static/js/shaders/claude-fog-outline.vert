
// Vertex Shader
attribute vec3 aPosition;
attribute vec2 aUv;

uniform mat4 matrix_viewProjection;
uniform mat4 matrix_model;

varying vec2 vUv;
varying vec4 obj_pos;


void main(void) {
    vUv = aUv;
    vec4 pos = matrix_model * vec4(aPosition, 1.0); // global to local
    obj_pos = pos;
    vec4 projPos = matrix_viewProjection * pos; // local to screen
    gl_Position = projPos; // z value is based on the "depth" according to the farclip / frustum of cameras

}




































/*

attribute vec3 vertex_position;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;

varying vec2 vUv;
varying float depth;
varying vec4 screenPos;
varying vec3 vp;
varying vec4 pos;

void main(void)
{
    vec2 aPosition = vertex_position.xy;
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vUv = (aPosition.xy + 1.0) * 0.5;
    vec4 pos = matrix_model * vec4(vertex_position, 1.0);

    vec4 projPos = matrix_viewProjection * pos;
    screenPos = projPos;
    vp = vertex_position;
}

*/
