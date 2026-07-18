"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { Points, ShaderMaterial, AdditiveBlending, InstancedBufferAttribute, BufferGeometry, Vector3, Color } from "three";

extend({ Points, ShaderMaterial, BufferGeometry, InstancedBufferAttribute });

const PARTICLE_COUNT = 5000;

const vertexShader = `
attribute vec3 aInitialPos;
attribute vec3 aVelocity;
attribute float aAge;
attribute float aId;

uniform float uTime;
uniform float uParticleCount;
uniform vec3 uBounds;

varying vec3 vPosition;
varying vec3 vVelocity;
varying float vAge;
varying float vId;

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
    
    vec3 pos = aInitialPos + aVelocity * uTime * 0.1;
    vec3 flow = curlNoise(pos * 0.3 + uTime * 0.05) * 2.0;
    pos += flow * uTime * 0.02;
    
    pos = mod(pos + uBounds, uBounds * 2.0) - uBounds;
    
    float size = 2.0 + sin(aAge * 6.28318 + uTime) * 1.5;
    size *= length(aVelocity) * 10.0 + 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vPosition = pos;
    vVelocity = flow;
}
`;

const fragmentShader = `
varying vec3 vPosition;
varying vec3 vVelocity;
varying float vAge;
varying float vId;

uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    if (dist > 0.5) discard;
    
    float speed = length(vVelocity);
    float hue = vAge + speed * 0.5 + uTime * 0.1;
    
    vec3 color = mix(uColorA, uColorB, fract(hue * 0.3));
    color = mix(color, uColorC, smoothstep(0.0, 1.0, speed));
    
    float glow = pow(alpha, 0.5) * (1.0 + speed * 2.0);
    float edge = 1.0 - smoothstep(0.2, 0.5, dist);
    
    gl_FragColor = vec4(color * glow + vec3(edge * 0.3), alpha * glow * 0.8);
    gl_FragColor.rgb *= gl_FragColor.a;
}
`;

function FlowFieldParticles({ 
  colorA = "#8b5cf6", 
  colorB = "#22d3ee", 
  colorC = "#a78bfa",
  bounds = 15 
}: { colorA?: string; colorB?: string; colorC?: string; bounds?: number }) {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = PARTICLE_COUNT;

    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const ages = new Float32Array(count);
    const ids = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * bounds * 0.8;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      ages[i] = Math.random();
      ids[i] = i;
    }

    geo.setAttribute("position", new InstancedBufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aInitialPos", new InstancedBufferAttribute(positions, 3));
    geo.setAttribute("aVelocity", new InstancedBufferAttribute(velocities, 3));
    geo.setAttribute("aAge", new InstancedBufferAttribute(ages, 1));
    geo.setAttribute("aId", new InstancedBufferAttribute(ids, 1));

    return geo;
  }, [bounds]);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uParticleCount: { value: PARTICLE_COUNT },
        uBounds: { value: new Vector3(bounds, bounds, bounds) },
        uColorA: { value: new Color(colorA) },
        uColorB: { value: new Color(colorB) },
        uColorC: { value: new Color(colorC) },
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    materialRef.current = mat;
    return mat;
  }, [colorA, colorB, colorC, bounds]);

  useFrame(() => {
    if (materialRef.current) {
      const elapsed = (performance.now() - startTime.current) * 0.001;
      materialRef.current.uniforms.uTime.value = elapsed;
    }
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material?.dispose();
    };
  }, [geometry, material]);

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

export default function FlowField({ 
  ...props 
}: { colorA?: string; colorB?: string; colorC?: string; bounds?: number }) {
  return (
    <group>
      <FlowFieldParticles {...props} />
    </group>
  );
}