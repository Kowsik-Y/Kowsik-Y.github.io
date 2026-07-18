// Shared noise functions for all shaders
vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453);
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    vec3 a = hash33(i);
    vec3 b = hash33(i + vec3(1, 0, 0));
    vec3 c = hash33(i + vec3(0, 1, 0));
    vec3 d = hash33(i + vec3(1, 1, 0));
    vec3 e = hash33(i + vec3(0, 0, 1));
    vec3 f3 = hash33(i + vec3(1, 0, 1));
    vec3 g = hash33(i + vec3(0, 1, 1));
    vec3 h = hash33(i + vec3(1, 1, 1));
    
    return mix(
        mix(mix(a.x, b.x, f.x), mix(c.x, d.x, f.x), f.y),
        mix(mix(e.x, f3.x, f.x), mix(g.x, h.x, f.x), f.y),
        f.z
    );
}

float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        value += amplitude * noise3D(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// 2D noise for screen-space effects
float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash33(vec3(i, 0.0)).x;
    float b = hash33(vec3(i + vec2(1, 0), 0.0)).x;
    float c = hash33(vec3(i + vec2(0, 1), 0.0)).x;
    float d = hash33(vec3(i + vec2(1, 1), 0.0)).x;
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm2D(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        value += amplitude * noise2D(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// Cellular noise (Worley)
vec2 cellular2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 minDist = vec2(1e10);
    
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = hash33(vec3(i + neighbor, 0.0)).xy;
            vec2 diff = neighbor + point - f;
            float dist = dot(diff, diff);
            if (dist < minDist.x) {
                minDist.y = minDist.x;
                minDist.x = dist;
            } else if (dist < minDist.y) {
                minDist.y = dist;
            }
        }
    }
    return sqrt(minDist);
}

// Value noise with derivatives for normal mapping
vec3 noise3DDeriv(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 f2 = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic
    
    vec3 a = hash33(i);
    vec3 b = hash33(i + vec3(1, 0, 0));
    vec3 c = hash33(i + vec3(0, 1, 0));
    vec3 d = hash33(i + vec3(1, 1, 0));
    vec3 e = hash33(i + vec3(0, 0, 1));
    vec3 f3 = hash33(i + vec3(1, 0, 1));
    vec3 g = hash33(i + vec3(0, 1, 1));
    vec3 h = hash33(i + vec3(1, 1, 1));
    
    float x0 = mix(a.x, b.x, f.x);
    float x1 = mix(c.x, d.x, f.x);
    float x2 = mix(e.x, f3.x, f.x);
    float x3 = mix(g.x, h.x, f.x);
    float y0 = mix(x0, x1, f.y);
    float y1 = mix(x2, x3, f.y);
    float value = mix(y0, y1, f.z);
    
    // Derivatives
    float dx = (b.x - a.x) * (1.0 - f2.x) + (d.x - c.x) * f2.x;
    float dy = (c.y - a.y) * (1.0 - f2.y) + (g.y - e.y) * f2.y;
    float dz = (e.z - a.z) * (1.0 - f2.z) + (h.z - g.z) * f2.z;
    
    return vec3(value, dx, dy);
}