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

// Fragment shader
precision highp float;

uniform vec3 uAmbientColor;
uniform vec3 uPointLightingLocation;
uniform vec3 uPointLightingColor;

varying vec3 vTransformedNormal;
varying vec4 vPosition;

void main(void) {
    vec3 lightDirection = normalize(uPointLightingLocation - vPosition.xyz);
    float directionalLightWeighting = max(dot(normalize(vTransformedNormal), lightDirection), 0.0);
    vec3 lightWeighting;

    if (directionalLightWeighting > 0.95) {
        lightWeighting = vec3(1.0, 1.0, 1.0);
    } else if (directionalLightWeighting > 0.5) {
        lightWeighting = vec3(0.6, 0.6, 0.6);
    } else if (directionalLightWeighting > 0.25) {
        lightWeighting = vec3(0.4, 0.4, 0.4);
    } else {
        lightWeighting = uAmbientColor;
    }

    vec3 outlineColor = vec3(0.0, 0.0, 0.0);
    float outlineFactor = 1.0 - smoothstep(0.8, 0.95, length(vPosition.xyz));
    gl_FragColor = vec4(mix(lightWeighting, outlineColor, outlineFactor), 1.0);
}

