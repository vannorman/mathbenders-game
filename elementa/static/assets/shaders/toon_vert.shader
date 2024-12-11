attribute vec3 position;
attribute vec3 normal;

uniform bool edge;

uniform mat4 matrix_model;
uniform mat3 matrix_normal;
uniform mat4 matrix_viewProjection;

varying vec3 vNormal;

// vert shader
// if edge is set expand model by small amount
void main(void) {
    vec3 pos = position;

    if (edge) {
        pos += normal * 0.04;
    }
    
    // transform normal
    vNormal = normalize(matrix_normal * normal);
    
    gl_Position = matrix_viewProjection * matrix_model * vec4(pos, 1.0);
}
