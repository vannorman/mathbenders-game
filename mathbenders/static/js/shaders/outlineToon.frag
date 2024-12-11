precision mediump float;

uniform sampler2D uColorBuffer; // the original scene picture
varying vec2 vUv0; // frag x,y position
varying vec3 vNormal;

uniform mat4 uInverseViewProjectionMatrix; // fog 
//uniform mat4 uViewProjectionMatrix; // fog 
uniform mat4 uProjectionMatrix; // fog 
//uniform mat4 uViewMatrix; // fog 
uniform float uFarClip; // fog
uniform vec3 uSunDir; // cel shading
uniform vec3 uPlayerPos; // cel shading
uniform vec3 uCameraPos; // cel shading
uniform vec3 uCameraDir; // cel shading
uniform float uWorldAngryA; // world warp effect on grid
uniform float uWorldAngryB;

uniform sampler2D uMat3Texture; // pass in vec3+t to warp a local event based on t value
uniform int uMat3Count; // how many vec3+t are in uVec4Texture


vec3 getWorldPosition(vec2 uv, float depth) {
    mat4 ivp = uInverseViewProjectionMatrix; // passed in from CPU

    // Convert UV to clip space
    vec4 clipSpace = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);

    // Transform to world space
    vec4 worldPos = ivp * clipSpace;

    // Perform perspective division
    return worldPos.xyz / worldPos.w;
}

float applyOutline(sampler2D depthMap, vec2 uv) {
    float depth = texture2D(depthMap, uv).r;
    float depthDiff = .009;
    float uOutlineThickness = 0.0006;
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 offset = vec2(float(x) * uOutlineThickness, float(y) * uOutlineThickness);// * uOutlineThickness * uPixelSize;
            float sampleDepth = texture2D(depthMap, uv + offset).r;
            depthDiff += abs(sampleDepth - depth);
        }
    }
    return step(0.01, depthDiff); // either returns 1 (full black outline) or 0 (no outline)
}
vec3 applyCelShading(vec3 color) {
    float uCelLevels = 2.0;
    float gamma = 3.5;
    float brightness = dot(color, vec3(0.299, 0.587, 0.114) * gamma);
    float cel = floor(brightness * float(uCelLevels)) / float(uCelLevels);
    return color * cel;
}
vec3 celShade(vec3 color, vec3 worldPos){
    vec3 N = normalize(vNormal); // Normal vector
    vec3 L = normalize(-uSunDir); // Light direction (inverted for calculations)
    vec3 V = normalize(uCameraPos - worldPos); // View direction
    vec3 H = normalize(L + V); // Half vector for specular calculation

    // Calculate distance for attenuation (range: 0 to camera far plane distance)
    float distance = length(uCameraPos - worldPos);

    // Calculate attenuation factor (range: 0 to 1)
    float attenuation = 1.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);

    // Calculate diffuse factor (range: 0 to 1)
    float diffuse = max(dot(N, L), 0.0);

    // Apply cel shading to diffuse (creates distinct bands, range: 0 to 1)
    diffuse = floor(diffuse * 3.0) / 3.0;

    // Calculate specular factor (range: 0 to 1)
    float specular = pow(max(dot(N, H), 0.0), 32.0);

    // Apply cel shading to specular (creates distinct highlight, range: 0 or 1)
    specular = step(0.5, specular);

    // Combine lighting components (range: 0 to 1 for each component)
    vec3 lighting = vec3(0.2) + (diffuse * 0.5 + specular * 0.3) * attenuation;

    // Sample base color from texture (range: 0 to 1 for each component)

    // Combine base color with lighting (range: 0 to 1 for each component)
    return color * lighting * 4.0;
}


// Function to calculate distance to nearest gridline
float distToGrid(vec3 pos) {
    float gridResolution = uWorldAngryA;
    vec3 gridPos = fract(pos * gridResolution);
    vec3 distToEdge = min(gridPos, 1.0 - gridPos);
    return min(min(distToEdge.x, distToEdge.y), distToEdge.z);
}

vec3 warpByGridlines(vec3 color,vec3 pos){
    // theWorldIsAngryWithYou
    // imagine a 3d world grid of resolution 10 (and it's about 10x your player size as its current resolution of 10).
    // This grid progressively gets smaller as it gets angrier until it's 0.5
    // This grid progressively "pulls" nearby pixels to it, black-hole style
    // This is one of the "directions" you can go in the game (hence it is a dimension, or perhaps this grid represents the "rip" of the current dimension and when it rips everything away, what remains is the new dimension
    // Players coultd travel this way by "coding" the world a certain way, for example by putting a circle of primes 2-N 
    // Or by collecting Eul resource in a special Euclidian (or mathematical) Platonic? arrangement
    // Or any other number of "seed the world" mechanics such as gardens, castles etc.



    vec2 uv = vUv0;

    // Calculate distance to nearest gridline
    float dist = distToGrid(pos);

    // Create distortion based on distance
    float distortionStrength = uWorldAngryB;
    float threshold = 2.0;
    // key is threshold, dist, and shiftamount.
    // TODO: Press a key to see A or B value lerp from 0 to 0.5 and back.
    // Apperas that world will "bounce"

    if (dist > threshold){
        return color;
    }

    float gridResolution = uWorldAngryA;
    float shiftamount = (threshold - dist) / threshold;
    vec2 distortion = vec2(
        shiftamount * distortionStrength,
        shiftamount * distortionStrength
    ) * (gridResolution - dist);

    // Apply distortion to texture coordinates
    vec2 distortedUV = uv + distortion;

    // Sample the texture with distorted coordinates
    vec4 distortedColor = texture(uColorBuffer, distortedUV);

    // Optionally, visualize the grid
    distortedColor.rgb *= 1.0 - (1.0 - dist) * 0.2;
    return distortedColor.rgb;
}



mat3 getMat3FromTexture(int index) {
    int x = index % 21;
    int y = index / 21;
    return mat3(
        texelFetch(uMat3Texture, ivec2(x*3, y), 0),
        texelFetch(uMat3Texture, ivec2(x*3+1, y), 0),
        texelFetch(uMat3Texture, ivec2(x*3+2, y), 0)
    );
}


vec3 warpByPoints(vec3 color,vec3 worldPos, float depth){
    vec2 uv = vUv0;
    // iterate over texture containing vec4 data

    for(int i = 0; i < uMat3Count; i++) {
        mat3 data = getMat3FromTexture(i);
        vec3 pointPos = data[0];
        float strengthFactor = data[1].y;
        float duration = data[1].x;
        float maxDist = data[1].z;
        float blackHoleRadius = data[2].y;
        float slowFactor = data[2].x;
        float runningTime = data[2].z;
        float dist = distance(data[0],worldPos); //sqrt(dot(vToPoint, vToPoint)); // length sq to point
//        float maxDist = 2.0;//log2(1.0 + strength);//2.0 + 10.0;//log2(strength/10.0);
        if (dist > maxDist){
            return color;
//            return vec3(color.r,color.r,color.r);
        } else if (dist < blackHoleRadius) {
            return vec3(0,0,0);
        } else {

            vec3 direction = normalize(worldPos - pointPos); // Reversed for inward pull
            
            // Convert UV to clip space
            vec4 clipSpace = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);

            vec4 view = uProjectionMatrix * clipSpace; // seems to work
            // Project the direction onto the view plane
            vec2 directionXY = view.xy;

//            vec2 directionXY = normalize(direction.xy); // misses the world z dir?
            
            // Create bounce effect
            float bounce = sin(runningTime * 3.14159 * 2.0 * slowFactor); // Sinusoidal bounce
           // float bounce = 2.0; 
            // Adjust the strength based on distance and time
            float distanceFactor = 1.0 - (dist / maxDist);
//            float timeStrength = smoothstep(1.0, 0.9, duration); // Only fade out at the very end
            float strength = distanceFactor * duration * strengthFactor; // Adjust 0.05 to control overall strength
            
            vec2 distortion = directionXY * bounce * strength;

            // Apply distortion to texture coordinates
            vec2 distortedUV = uv + distortion;

            // Sample the texture with distorted coordinates
            vec4 distortedColor = texture(uColorBuffer, distortedUV);
            return distortedColor.rgb;

            // Blend between original and distorted color based on strength
            //return mix(color, distortedColor.rgb, strength * 20.0); // Increased blending factor for stronger effect
              
        }
    }
    return color;
}

void main() {
    //    float depth = getLinearScreenDepth(vUv0) * camera_params.x;  // gives depth 0-1
    
    vec3 color = texture2D(uColorBuffer, vUv0).rgb; // passthru

    float depth_nonlinear = texture2D(uSceneDepthMap, vUv0).r;
    vec3 worldPos = getWorldPosition(vUv0, depth_nonlinear);

     // Apply outline
    float outline = applyOutline(uSceneDepthMap, vUv0);
    vec3 uOutlineColor = vec3(0.0,0.0,0.0);
    color = mix(color, uOutlineColor.rgb, outline);

        // Meta coach: All the tips tracks hacks and skills in the world mean nothing
    // Simply make it awesome

    // Meta coach old: when you think of "modular" as a mechanic you need not to build the mechanic
    // But to build a game that makes it easy to build the mechanic
    // Without being overfitted* 

    /* 
    color = warpByGridlines(color,worldPos);
    */

    color = warpByPoints(color,worldPos,depth_nonlinear);

    // Apply fog depth
    vec3 fog_color = vec3(1.0,1.0,1.0); // white fog
    if (worldPos.y < 25.0){
        gl_FragColor = vec4(mix(color,fog_color,-(worldPos.y-25.0)*0.005),1.0);
    } else {
        gl_FragColor = vec4(color,1.0);
    }
}




