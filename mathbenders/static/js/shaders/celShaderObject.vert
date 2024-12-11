// VERT shader
// Attributes per vertex: position, normal and texture coordinates
attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec2 aUv;

uniform mat4   matrix_viewProjection;
uniform mat4   matrix_model;
uniform mat4   matrix_view;
uniform mat3   matrix_normal;
uniform vec3   uSunDir;

// Color to fragment program
varying float vertOutTexCoord;
varying vec2 texCoord;

void main(void)
{
    mat4 modelView = matrix_view * matrix_model;
    mat4 modelViewProj = matrix_viewProjection * matrix_model;
    vec3 eyeNormal = normalize(matrix_normal * aNormal);
    vec3 lightDir = uSunDir;
    vertOutTexCoord = dot(eyeNormal, lightDir); // angles at more than 90 will return negative
    texCoord = aUv;
    gl_Position = modelViewProj * aPosition;
}

