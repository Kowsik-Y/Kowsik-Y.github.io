varying vec3 vPosition;
varying vec3 vVelocity;
varying float vAge;
varying float vId;

uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

#define PI 3.14159265359

float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453);
}

void main() {
    // Circular particle with soft edges
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Fade at edges
    if (dist > 0.5) discard;
    
    // Color based on velocity and age
    float speed = length(vVelocity);
    float hue = vAge + speed * 0.5 + uTime * 0.1;
    
    vec3 color = mix(uColorA, uColorB, fract(hue * 0.3));
    color = mix(color, uColorC, smoothstep(0.0, 1.0, speed));
    
    // Add glow based on velocity
    float glow = pow(alpha, 0.5) * (1.0 + speed * 2.0);
    
    // Fresnel-like edge highlight
    float edge = 1.0 - smoothstep(0.2, 0.5, dist);
    
    gl_FragColor = vec4(color * glow + vec3(edge * 0.3), alpha * glow * 0.8);
    
    // Premultiply alpha for additive blending
    gl_FragColor.rgb *= gl_FragColor.a;
}