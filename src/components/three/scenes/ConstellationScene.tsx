"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Vector3, Color as ThreeColor, BufferGeometry, LineSegments, LineBasicMaterial, BufferAttribute } from "three";
import { Points, ShaderMaterial, AdditiveBlending, InstancedBufferAttribute, Color, Mesh, SphereGeometry, MeshBasicMaterial } from "three";
import { extend as extendThree } from "@react-three/fiber";

extendThree({ Points, ShaderMaterial, BufferGeometry, InstancedBufferAttribute, Mesh, SphereGeometry, MeshBasicMaterial });

const PROJECT_COUNT = 40;
const MAX_EDGES = 300;

const CATEGORIES = [
  { name: "AI/ML", color: "#8b5cf6", index: 0 },
  { name: "Full-Stack", color: "#22d3ee", index: 1 },
  { name: "GenAI", color: "#f472b6", index: 2 },
  { name: "Research", color: "#a78bfa", index: 3 },
];

const vertexShader = `
attribute vec3 aPosition;
attribute vec3 aVelocity;
attribute float aSize;
attribute float aCategory;
attribute float aImportance;
attribute vec3 aCategoryColor;

uniform float uTime;
uniform float uProgress;
uniform int uActiveCategory;
uniform vec3 uBounds;

varying vec3 vPosition;
varying float vSize;
varying float vCategory;
varying float vImportance;
varying vec3 vCategoryColor;
varying float vVisible;

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
    vCategory = aCategory;
    vImportance = aImportance;
    vCategoryColor = aCategoryColor;
    
    // Category filtering
    vVisible = 1.0;
    if (uActiveCategory >= 0 && int(aCategory) != uActiveCategory) {
        vVisible = 0.05;
    }
    
    vec3 pos = aPosition;
    
    // Gentle orbital motion
    float orbitSpeed = 0.02 + aCategory * 0.005;
    float angle = uTime * orbitSpeed + aPosition.x * 0.5;
    float radius = length(pos.xy);
    pos.x = cos(angle) * radius;
    pos.y = sin(angle) * radius;
    
    // Subtle flow
    vec3 flow = curlNoise(pos * 0.05 + uTime * 0.01) * 0.2;
    pos += flow;
    
    // Scroll-driven expansion
    float expand = 1.0 + uProgress * 0.3;
    pos *= expand;
    
    // Size based on importance
    float size = aSize * (0.8 + aImportance * 0.15) * expand;
    if (vVisible < 0.1) size *= 0.3;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (400.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying vec3 vPosition;
varying float vSize;
varying float vCategory;
varying float vImportance;
varying vec3 vCategoryColor;
varying float vVisible;

uniform float uTime;

void main() {
    if (vVisible < 0.1) discard;
    
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    if (dist > 0.5) discard;
    
    vec3 color = vCategoryColor;
    
    // Pulse based on importance
    float pulse = 0.7 + 0.3 * sin(uTime * 1.5 + vPosition.x * 2.0) * vImportance / 5.0;
    color *= pulse;
    
    // Glow
    float glow = 1.0 - smoothstep(0.1, 0.5, dist);
    color += vec3(glow * 0.3);
    
    gl_FragColor = vec4(color, alpha * vVisible * (0.6 + glow * 0.4));
}
`;

// Delaunay triangulation in 2D for constellation edges
function computeDelaunayEdges(points: Vector3[]): [number, number][] {
  const edges: [number, number][] = [];
  const count = points.length;
  
  // Simple approach: connect each point to its k nearest neighbors
  // In a real implementation, you'd use Delaunay triangulation
  const k = 4;
  
  for (let i = 0; i < count; i++) {
    const distances: [number, number][] = [];
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const d = points[i].distanceToSquared(points[j]);
      distances.push([d, j]);
    }
    distances.sort((a, b) => a[0] - b[0]);
    
    for (let k = 0; k < Math.min(4, distances.length); k++) {
      const j = distances[k][1];
      if (i < j) edges.push([i, j]);
    }
  }
  
  return edges;
}

function ConstellationNodes({ activeCategory = -1, scrollProgress = 0 }: { activeCategory?: number; scrollProgress?: number }) {
  const { scene } = useThree();
  const nodesRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());
  const positionsRef = useRef<Vector3[]>([]);
  const edgesRef = useRef<[number, number][]>([]);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = PROJECT_COUNT;

    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const categories = new Float32Array(count);
    const importances = new Float32Array(count);
    const categoryColors = new Float32Array(count * 3);

    const positions3D: Vector3[] = [];

    for (let i = 0; i < count; i++) {
      // Distribute in a sphere with some clustering by category
      const cat = Math.floor(Math.random() * 4);
      const catData = CATEGORIES[cat];
      
      // Category clusters
      const clusterAngle = (cat / 4) * Math.PI * 2;
      const clusterRadius = 8;
      const clusterCenter = new Vector3(
        Math.cos(clusterAngle) * clusterRadius,
        Math.sin(clusterAngle) * clusterRadius,
        (Math.random() - 0.5) * 4
      );
      
      const offset = new Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3
      );
      
      const pos = clusterCenter.clone().add(offset);
      positions3D.push(pos);
      
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
      
      sizes[i] = 3.0 + Math.random() * 3.0;
      categories[i] = cat;
      importances[i] = 1 + Math.floor(Math.random() * 5);
      
      const color = new ThreeColor(catData.color);
      categoryColors[i * 3] = color.r;
      categoryColors[i * 3 + 1] = color.g;
      categoryColors[i * 3 + 2] = color.b;
    }

    positionsRef.current = positions3D;
    edgesRef.current = computeDelaunayEdges(positions3D);

    geo.setAttribute("position", new InstancedBufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aPosition", new InstancedBufferAttribute(positions, 3));
    geo.setAttribute("aVelocity", new InstancedBufferAttribute(velocities, 3));
    geo.setAttribute("aSize", new InstancedBufferAttribute(sizes, 1));
    geo.setAttribute("aCategory", new InstancedBufferAttribute(categories, 1));
    geo.setAttribute("aImportance", new InstancedBufferAttribute(importances, 1));
    geo.setAttribute("aCategoryColor", new InstancedBufferAttribute(categoryColors, 3));

    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uActiveCategory: { value: activeCategory },
        uBounds: { value: new Vector3(20, 20, 10) },
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    materialRef.current = mat;
    return mat;
  }, [activeCategory]);

  useFrame(() => {
    if (materialRef.current) {
      const elapsed = (performance.now() - startTime.current) * 0.001;
      materialRef.current.uniforms.uTime.value = elapsed;
    }
  });

  useEffect(() => {
    const handleScroll = (e: CustomEvent) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uProgress.value = e.detail;
      }
    };
    window.addEventListener('constellation-progress', handleScroll as EventListener);
    return () => window.removeEventListener('constellation-progress', handleScroll as EventListener);
  }, []);

  return <points ref={nodesRef} geometry={geometry} material={material} />;
}

function ConstellationEdges({ activeCategory = -1 }: { activeCategory?: number }) {
  const lineRef = useRef<LineSegments>(null);
  const geometryRef = useRef<BufferGeometry>(null);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    // Will be updated from ConstellationNodes positions
    const count = MAX_EDGES;
    const positions = new Float32Array(count * 6);
    const colors = new Float32Array(count * 6);
    
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    return geo;
  }, []);

  const material = useMemo(() => {
    return new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    });
  }, []);

  geometryRef.current = geometry;

  const line = useMemo(() => {
    const line = new LineSegments(geometry, material);
    return line;
  }, [geometry, material]);

  useFrame(() => {
    // Update edge positions from node positions
    // This would need access to node positions - simplified for now
  });

  return <primitive object={line} ref={lineRef} />;
}

function ConstellationScene({ activeCategory = -1, scrollProgress = 0 }: { activeCategory?: number; scrollProgress?: number }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 7]} intensity={0.5} color="#8b5cf6" />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#22d3ee" />
      
      <ConstellationNodes activeCategory={activeCategory} scrollProgress={scrollProgress} />
      <ConstellationEdges activeCategory={activeCategory} />
    </>
  );
}

export default function ConstellationCanvas({ activeCategory = -1, scrollProgress = 0 }: { activeCategory?: number; scrollProgress?: number }) {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5, max: 2 }}
      >
        <ConstellationScene activeCategory={activeCategory} scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}