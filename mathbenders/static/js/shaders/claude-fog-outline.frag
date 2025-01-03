precision highp float;

varying vec2 vUv;

// uniform sampler2D uColorMap;
uniform sampler2D uDepthMap;
uniform mat4 matrix_projection;

// Custom uniforms
uniform float uFogDensity;
uniform float uFogHeightFalloff;
uniform vec3 uFogColor;
uniform float uPlayerY;


float calculateFogFactor(float depth) {
//    float fogHeight = camera_position.y - uPlayerY;
//    float heightFactor = exp(-fogHeight * uFogHeightFalloff);
//    return 1.0 - exp(-depth * uFogDensity * heightFactor);
return 1.0;
}

void main(void) {
   // float depth = getLinearScreenDepth(vUv) * camera_params.x / 1000.0;
    float depth = linearizeDepth(texture2D(uDepthMap, vUv).r);
    gl_FragColor = vec4(vec3(depth), 0.5);
  
    //gl_FragColor = vec4(vec3(gl_FragCoord.z),1.0);
    return;
    //float depth = linearizeDepth(texture2D(uDepthMap, vUv).r);
   

    // Apply fog
//    float fogFactor = calculateFogFactor(depth);
  //  color = mix(color, uFogColor, fogFactor);

    // vec3 mixed = mix(color,fog_color,depth*3.0);
   // gl_FragColor = vec4(mixed,1.0);

    // Plain depth
    gl_FragColor = vec4(vec3(depth), 1.0);

}





/*'
uniform highp sampler2D uSceneDepthMap;

#ifndef SCREENSIZE
#define SCREENSIZE
uniform vec4 uScreenSize;
#endif

#ifndef VIEWMATRIX
#define VIEWMATRIX
uniform mat4 matrix_view;
#endif

#ifndef LINEARIZE_DEPTH
#ifndef CAMERAPLANES
#define CAMERAPLANES
uniform vec4 camera_params; // x: 1 / camera_far,      y: camera_far,     z: camera_near,        w: is_ortho
#endif

#define LINEARIZE_DEPTH
#ifdef GL2
float linearizeDepth(float z) {
    if (camera_params.w == 0.0)
        return (camera_params.z * camera_params.y) / (camera_params.y + z * (camera_params.z - camera_params.y));
    else
        return camera_params.z + z * (camera_params.y - camera_params.z);
}
#else // GL2
#ifndef UNPACKFLOAT
#define UNPACKFLOAT
float unpackFloat(vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
    return dot(rgbaDepth, bitShift);
}
#endif
#endif
#endif // LINEARIZE_DEPTH

// Retrieves rendered linear camera depth by UV
float getLinearScreenDepth(vec2 uv) {
    #ifdef GL2
        return linearizeDepth(texture2D(uSceneDepthMap, uv).r);
    #else
        return unpackFloat(texture2D(uSceneDepthMap, uv)) * camera_params.y;
    #endif
}

#ifndef VERTEXSHADER
// Retrieves rendered linear camera depth under the current pixel
float getLinearScreenDepth() {
    vec2 uv = gl_FragCoord.xy * uScreenSize.zw;
    return getLinearScreenDepth(uv);
}
#endif

// Generates linear camera depth for the given world position
float getLinearDepth(vec3 pos) {
    return -(matrix_view * vec4(pos, 1.0)).z;
}
'*/
