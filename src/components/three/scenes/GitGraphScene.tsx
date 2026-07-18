"use client";

import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Vector3, Color as ThreeColor, BufferGeometry, LineBasicMaterial, BufferAttribute, Object3D, LineSegments } from "three";
import { Points, ShaderMaterial, AdditiveBlending, InstancedBufferAttribute, Color, Mesh, SphereGeometry, MeshBasicMaterial } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { extend as extendThree } from "@react-three/fiber";

extendThree({ Points, ShaderMaterial, BufferGeometry, InstancedBufferAttribute, LineSegments, Mesh, SphereGeometry, MeshBasicMaterial });

const NODE_COUNT = 200;
const EDGE_COUNT = 400;

const vertexShader = `
attribute vec3 aPosition;
attribute vec3 aVelocity;
attribute float aSize;
attribute float aType; // 0 = commit, 1 = branch, 2 = tag

uniform float uTime;
uniform float uProgress; // 0-1 scroll progress
uniform vec3 uBounds;

varying vec3 vPosition;
varying float vSize;
varying float vType;
varying vec3 vVelocity;

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
    float eps = 0.1;
    float nX = noise3D(p + vec3(eps, 0, 0)) - noise3D(p - vec3(eps, 0, 0));
    float nY = noise3D(p + vec3(0, eps, 0)) - noise3D(p - vec3(0, eps, 0));
    float nZ = noise3D(p + vec3(0, 0, eps)) - noise3D(p - vec3(0, 0, eps));
    return vec3(nZ - nY, nX - nZ, nY - nX) * (1.0 / (2.0 * eps));
}

void main() {
    vPosition = aPosition;
    vSize = aSize;
    vType = aType;
    vVelocity = aVelocity;
    
    // Animate position based on scroll progress
    vec3 pos = aPosition;
    
    // Breathing animation
    float breathe = sin(uTime * 0.5 + aPosition.x * 0.5) * 0.02;
    pos += normalize(aPosition) * breathe;
    
    // Scroll-driven expansion
    float expand = 1.0 + uProgress * 0.5;
    pos *= expand;
    
    // Subtle flow field
    vec3 flow = curlNoise(pos * 0.1 + uTime * 0.02) * 0.1;
    pos += flow * uProgress;
    
    float size = aSize * (1.0 + uProgress * 0.3);
    if (aType > 0.5) size *= 1.5; // Branches/tags larger
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying vec3 vPosition;
varying float vSize;
varying float vType;
varying vec3 vVelocity;

uniform float uTime;
uniform vec3 uCommitColor;
uniform vec3 uBranchColor;
uniform vec3 uTagColor;

void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    if (dist > 0.5) discard;
    
    vec3 color;
    if (vType < 0.5) {
        color = uCommitColor;
    } else if (vType < 1.5) {
        color = uBranchColor;
    } else {
        color = uTagColor;
    }
    
    // Pulse effect
    float pulse = 0.8 + 0.2 * sin(uTime * 2.0 + vPosition.x * 3.0);
    color *= pulse;
    
    // Glow at edges
    float glow = 1.0 - smoothstep(0.1, 0.5, dist);
    
    gl_FragColor = vec4(color * (1.0 + glow * 0.5), alpha * (0.6 + glow * 0.4));
}
`;

function GitGraphNodes() {
  const { scene } = useThree();
  const nodesRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());
  const progressRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = NODE_COUNT;

    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const types = new Float32Array(count);

    // Create a git-like tree structure
    const branches = 5;
    const commitsPerBranch = 30;
    
    for (let i = 0; i < count; i++) {
      const branch = Math.floor(i / commitsPerBranch) % branches;
      const commitIndex = i % commitsPerBranch;
      
      // Main timeline with branches
      const x = (branch - branches / 2) * 3 + Math.sin(commitIndex * 0.3) * 1.5;
      const y = (commitIndex - commitsPerBranch / 2) * 0.4 + (Math.random() - 0.5) * 0.2;
      const z = (Math.random() - 0.5) * 2;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
      
      // Most are commits, some are branch points, few are tags
      const rand = Math.random();
      if (rand < 0.85) {
        types[i] = 0; // commit
        sizes[i] = 2.0 + Math.random() * 1.5;
      } else if (rand < 0.95) {
        types[i] = 1; // branch
        sizes[i] = 4.0 + Math.random() * 2.0;
      } else {
        types[i] = 2; // tag
        sizes[i] = 5.0 + Math.random() * 2.0;
      }
    }

    geo.setAttribute("position", new InstancedBufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aPosition", new InstancedBufferAttribute(positions, 3));
    geo.setAttribute("aVelocity", new InstancedBufferAttribute(velocities, 3));
    geo.setAttribute("aSize", new InstancedBufferAttribute(sizes, 1));
    geo.setAttribute("aType", new InstancedBufferAttribute(types, 1));

    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uBounds: { value: new Vector3(20, 20, 10) },
        uCommitColor: { value: new Color("#8b5cf6") },
        uBranchColor: { value: new Color("#22d3ee") },
        uTagColor: { value: new Color("#fbbf24") },
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    materialRef.current = mat;
    return mat;
  }, []);

  useFrame(() => {
    if (materialRef.current) {
      const elapsed = (performance.now() - startTime.current) * 0.001;
      materialRef.current.uniforms.uTime.value = elapsed;
    }
  });

  useEffect(() => {
    // Sync scroll progress from GSAP
const handleScroll = (progress: number) => {
      progressRef.current = progress;
      if (materialRef.current) {
        materialRef.current.uniforms.uProgress.value = progress;
      }
    };

    // Will be connected via ScrollTrigger
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      handleScroll(customEvent.detail);
    };
    window.addEventListener('gitgraph-progress', handleCustomEvent);
    
    return () => {
      window.removeEventListener('gitgraph-progress', handleCustomEvent);
    };
  }, []);

  return <points ref={nodesRef} geometry={geometry} material={material} />;
}

function GitGraphEdges() {
  const linesRef = useRef<Object3D>(null);
  const geometryRef = useRef<BufferGeometry>(null);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = EDGE_COUNT;
    const positions = new Float32Array(count * 6);
    const colors = new Float32Array(count * 6);
    
    // Generate edges connecting nearby nodes in a tree-like structure
    const branchCount = 5;
    const commitsPerBranch = 30;
    let edgeIndex = 0;
    
    for (let b = 0; b < branchCount; b++) {
      for (let c = 0; c < commitsPerBranch - 1; c++) {
        if (edgeIndex >= count) break;
        
        const i = b * commitsPerBranch + c;
        const j = b * commitsPerBranch + c + 1;
        
        const xi = (b - branchCount / 2) * 3 + Math.sin(c * 0.3) * 1.5;
        const yi = (c - commitsPerBranch / 2) * 0.4;
        const zi = 0;
        
        const xj = (b - branchCount / 2) * 3 + Math.sin((c + 1) * 0.3) * 1.5;
        const yj = (c + 1 - commitsPerBranch / 2) * 0.4;
        const zj = 0;
        
        positions[edgeIndex * 6] = xi;
        positions[edgeIndex * 6 + 1] = yi;
        positions[edgeIndex * 6 + 2] = zi;
        positions[edgeIndex * 6 + 3] = xj;
        positions[edgeIndex * 6 + 4] = yj;
        positions[edgeIndex * 6 + 5] = zj;
        
        colors[edgeIndex * 6] = 0.54; // violet
        colors[edgeIndex * 6 + 1] = 0.36;
        colors[edgeIndex * 6 + 2] = 0.96;
        colors[edgeIndex * 6 + 3] = 0.13; // cyan
        colors[edgeIndex * 6 + 4] = 0.82;
        colors[edgeIndex * 6 + 5] = 0.89;
        
        edgeIndex++;
      }
    }
    
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    return geo;
  }, []);

  const material = useMemo(() => {
    return new LineBasicMaterial({
      vertexColors: true,
      linewidth: 1,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
  }, []);

  geometryRef.current = geometry;

  const line = useMemo(() => {
    const line = new LineSegments(geometry, material);
    return line;
  }, [geometry, material]);

  return <primitive object={line} ref={linesRef} />;
}

function GitGraphScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 7]} intensity={0.5} color="#8b5cf6" />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#22d3ee" />
      
      <GitGraphNodes />
      <GitGraphEdges />
    </>
  );
}

export default function GitGraphCanvas() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, -5, 15], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5, max: 2 }}
      >
        <GitGraphScene />
      </Canvas>
    </div>
  );
}

import { useRef, useMemo, useEffect } from "react";