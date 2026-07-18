varying vec3 vPosition;
varying vec3 vVelocity;
varying float vAge;
varying float vId;

uniform float uTime;
uniform float uParticleCount;
uniform vec3 uBounds;

attribute float aId;
attribute vec3 aInitialPos;
attribute vec3 aVelocity;
attribute float aAge;

#define PI 3.14159265359
#define TAU 6.28318530718

vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453);
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 f2 = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    
    float a = hash33(i).x;
    float b = hash33(i + vec3(1, 0, 0)).x;
    float c = hash33(i + vec3(0, 1, 0)).x;
    float d = hash33(i + vec3(1, 1, 0)).x;
    float e = hash33(i + vec3(0, 0, 1)).x;
    float f3 = hash33(i + vec3(1, 0, 1)).x;
    float g = hash33(i + vec3(0, 1, 1)).x;
    float h = hash33(i + vec3(1, 1, 1)).x;
    
    float x0 = mix(a, b, f.x);
    float x1 = mix(c, d, f.x);
    float x2 = mix(e, f3, f.x);
    float x3 = mix(g, h, f.x);
    float y0 = mix(x0, x1, f.y);
    float y1 = mix(x2, x3, f.y);
    return mix(y0, y1, f.z);
}

vec3 curlNoise(vec3 p) {
    float eps = 0.01;
    float nX = noise3D(p + vec3(eps, 0, 0)) - noise3D(p - vec3(eps, 0, 0));
    float nY = noise3D(p + vec3(0, eps, 0)) - noise3D(p - vec3(0, eps, 0));
    float nZ = noise3D(p + vec3(0, 0, eps)) - noise3D(p - vec3(0, 0, eps));
    return vec3(nZ - nY, nX - nZ, nY - nX) * (1.0 / (2.0 * eps));
}

void main() {
    vId = aId;
    vAge = aAge;
    vPosition = aInitialPos;
    vVelocity = aVelocity;
    
    // Simulate particle position based on time
    float t = uTime * 0.5 + aAge * 100.0;
    vec3 pos = aInitialPos + aVelocity * uTime * 0.1;
    
    // Add curl noise flow field
    vec3 flow = curlNoise(pos * 0.3 + uTime * 0.05) * 2.0;
    pos += flow * uTime * 0.02;
    
    // Boundary wrapping
    pos = mod(pos + uBounds, uBounds * 2.0) - uBounds;
    
    // Size based on age and velocity
    float size = 2.0 + sin(aAge * TAU + uTime) * 1.5;
    size *= length(aVelocity) * 10.0 + 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vPosition = pos;
    vVelocity = flow;
}