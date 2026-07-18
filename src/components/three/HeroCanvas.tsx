"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ShaderMaterial, AdditiveBlending, BufferAttribute, BufferGeometry, Color } from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PARTICLE_COUNT = 3500;

const vertexShader = `
attribute vec3 aInitialPos;
attribute vec3 aVelocity;
attribute float aAge;
attribute float aId;

uniform float uTime;
uniform float uParticleCount;
uniform vec3 uBounds;
uniform float uScrollProgress;
uniform vec2 uMouse;

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
    return vec3(nZ - nY, nX - nZ, nY - nX) / (2.0 * eps);
}

void main() {
    vId = aId;
    vAge = aAge;
    vPosition = aInitialPos;
    vVelocity = aVelocity;
    
    vec3 pos = aInitialPos + aVelocity * uTime * 0.1;
    vec3 flow = curlNoise(pos * 0.3 + uTime * 0.05) * 2.0;
    pos += flow * uTime * 0.02;
    
    // Mouse-reactive parallax
    pos.x += uMouse.x * 1.5 * (1.0 - aAge);
    pos.y += uMouse.y * 1.5 * (1.0 - aAge);
    
    // Scroll-based camera movement
    pos.x += uScrollProgress * 2.0;
    pos.y -= uScrollProgress * 1.5;
    
    pos = mod(pos + uBounds, uBounds * 2.0) - uBounds;
    
    float size = 2.5 + sin(aAge * 6.28318 + uTime) * 1.5;
    size *= length(aVelocity) * 12.0 + 0.8;
    
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
    
    // Enhanced glow
    float glow = pow(alpha, 0.4) * (1.2 + speed * 2.5);
    float edge = 1.0 - smoothstep(0.15, 0.5, dist);
    float core = 1.0 - smoothstep(0.0, 0.1, dist);
    
    gl_FragColor = vec4(color * glow + vec3(edge * 0.3 + core * 0.5), alpha * glow * 0.85);
    gl_FragColor.rgb *= gl_FragColor.a;
}
`;

function FlowFieldParticles() {
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = PARTICLE_COUNT;
    const bounds = 20;

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

      velocities[i * 3] = (Math.random() - 0.5) * 0.03;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.03;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      ages[i] = Math.random();
      ids[i] = i;
    }

    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aInitialPos", new BufferAttribute(positions, 3));
    geo.setAttribute("aVelocity", new BufferAttribute(velocities, 3));
    geo.setAttribute("aAge", new BufferAttribute(ages, 1));
    geo.setAttribute("aId", new BufferAttribute(ids, 1));

    return geo;
  }, []);

  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());
  const mouseRef = useRef({ x: 0, y: 0 });

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uParticleCount: { value: PARTICLE_COUNT },
        uBounds: { value: new THREE.Vector3(20, 20, 20) },
        uScrollProgress: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorA: { value: new Color("#8b5cf6") },
        uColorB: { value: new Color("#22d3ee") },
        uColorC: { value: new Color("#a78bfa") },
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    materialRef.current = mat;
    return mat;
  }, []);

  // Mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useFrame(() => {
    if (materialRef.current) {
      const elapsed = (performance.now() - startTime.current) * 0.001;
      materialRef.current.uniforms.uTime.value = elapsed;
      // Smooth lerp mouse
      const u = materialRef.current.uniforms.uMouse.value;
      u.x += (mouseRef.current.x - u.x) * 0.03;
      u.y += (mouseRef.current.y - u.y) * 0.03;
    }
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material?.dispose();
    };
  }, [geometry, material]);

  return <points geometry={geometry} material={material} />;
}

function ScrollCamera() {
  const { camera } = useThree();
  const progressRef = useRef(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: "main",
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    });

    return () => ctx.revert();
  }, []);

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, progressRef.current * 2, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -progressRef.current * 1.5, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 50 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5, max: 2 }}
      >
        <ambientLight intensity={0.3} />
        <FlowFieldParticles />
        <ScrollCamera />
      </Canvas>
    </div>
  );
}