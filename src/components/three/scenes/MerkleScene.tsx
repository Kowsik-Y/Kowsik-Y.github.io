"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Mesh, ShaderMaterial, InstancedBufferAttribute, BufferGeometry, SphereGeometry, Color, Points, LineBasicMaterial, Line, BufferAttribute, BoxGeometry, AdditiveBlending } from "three";
import { extend as extendThree } from "@react-three/fiber";

extendThree({ Mesh, ShaderMaterial, BufferGeometry, InstancedBufferAttribute, SphereGeometry, Points, LineBasicMaterial, Line, BoxGeometry });

const LEVELS = 5;
const NODES_PER_LEVEL = [1, 2, 4, 8, 16];
const TOTAL_NODES = NODES_PER_LEVEL.reduce((a, b) => a + b, 0);

const vertexShader = `
attribute vec3 aPosition;
attribute float aLevel;
attribute float aIndex;
attribute vec3 aTargetPosition;
attribute float aHashValue;

uniform float uTime;
uniform float uBuildProgress;

varying vec3 vPosition;
varying float vLevel;
varying float vIndex;
varying float vHashValue;
varying float vBuild;

void main() {
    vPosition = aPosition;
    vLevel = aLevel;
    vIndex = aIndex;
    vHashValue = aHashValue;
    
    // Build animation - nodes appear level by level
    float levelStart = aLevel / 5.0;
    float levelDuration = 0.2;
    vBuild = smoothstep(levelStart, levelStart + levelDuration, uBuildProgress);
    
    vec3 pos = mix(vec3(0.0), aTargetPosition, vBuild);
    
    // Subtle float animation
    float floatAnim = sin(uTime * 0.5 + aLevel * 2.0 + aIndex * 0.5) * 0.05;
    pos.y += floatAnim;
    
    float size = 4.0 + aHashValue * 3.0;
    if (aLevel == 0) size *= 2.0; // Root larger
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying vec3 vPosition;
varying float vLevel;
varying float vIndex;
varying float vHashValue;
varying float vBuild;

uniform float uTime;

void main() {
    if (vBuild < 0.1) discard;
    
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    if (dist > 0.5) discard;
    
    // Level-based coloring
    float levelNorm = vLevel / 4.0;
    vec3 color;
    if (levelNorm < 0.25) {
        color = vec3(0.54, 0.36, 0.96); // violet
    } else if (levelNorm < 0.5) {
        color = vec3(0.13, 0.82, 0.89); // cyan
    } else if (levelNorm < 0.75) {
        color = vec3(0.96, 0.45, 0.71); // pink
    } else {
        color = vec3(0.98, 0.74, 0.15); // amber
    }
    
    // Hash value intensity
    color *= 0.5 + vHashValue * 0.5;
    
    // Pulse for verified nodes
    float pulse = 0.8 + 0.2 * sin(uTime * 2.0 + vLevel * 3.0);
    color *= pulse;
    
    // Edge glow
    float edge = 1.0 - smoothstep(0.1, 0.5, dist);
    color += vec3(edge * 0.3);
    
    gl_FragColor = vec4(color, alpha * vBuild);
    gl_FragColor.rgb *= gl_FragColor.a;
}
`;

function MerkleNodes() {
  const { scene } = useThree();
  const nodesRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());
  const buildProgressRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = TOTAL_NODES;

    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const levels = new Float32Array(count);
    const indices = new Float32Array(count);
    const hashValues = new Float32Array(count);

    let nodeIdx = 0;
    const levelSpacing = 3.5;
    const startY = (LEVELS - 1) * levelSpacing / 2;
    
    for (let level = 0; level < LEVELS; level++) {
      const nodesInLevel = NODES_PER_LEVEL[level];
      const levelY = startY - level * levelSpacing;
      const levelWidth = Math.min(nodesInLevel * 2.5, 20);
      const startX = -levelWidth / 2;
      
      for (let i = 0; i < nodesInLevel; i++) {
        const x = startX + (i + 0.5) * (levelWidth / nodesInLevel);
        const z = (Math.random() - 0.5) * 2;
        
        positions[nodeIdx * 3] = 0; // Start at center
        positions[nodeIdx * 3 + 1] = startY;
        positions[nodeIdx * 3 + 2] = 0;
        
        targetPositions[nodeIdx * 3] = x;
        targetPositions[nodeIdx * 3 + 1] = levelY;
        targetPositions[nodeIdx * 3 + 2] = z;
        
        levels[nodeIdx] = level;
        indices[nodeIdx] = i;
        hashValues[nodeIdx] = Math.random();
        
        nodeIdx++;
      }
    }

    geo.setAttribute("position", new InstancedBufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aPosition", new InstancedBufferAttribute(positions, 3));
    geo.setAttribute("aTargetPosition", new InstancedBufferAttribute(targetPositions, 3));
    geo.setAttribute("aLevel", new InstancedBufferAttribute(levels, 1));
    geo.setAttribute("aIndex", new InstancedBufferAttribute(indices, 1));
    geo.setAttribute("aHashValue", new InstancedBufferAttribute(hashValues, 1));

    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBuildProgress: { value: 0 },
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
      materialRef.current.uniforms.uBuildProgress.value = buildProgressRef.current;
    }
  });

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      buildProgressRef.current = customEvent.detail;
    };
    window.addEventListener('merkle-progress', handleScroll);
    return () => window.removeEventListener('merkle-progress', handleScroll);
  }, []);

  return <points ref={nodesRef} geometry={geometry} material={material} />;
}

function MerkleEdges() {
  const lineRef = useRef<Line>(null);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    
    let nodeIdx = 0;
    const levelOffsets: number[] = [0];
    for (let l = 1; l < LEVELS; l++) {
      levelOffsets[l] = levelOffsets[l - 1] + NODES_PER_LEVEL[l - 1];
    }
    
    // Connect parent to children
    for (let level = 0; level < LEVELS - 1; level++) {
      const nodesInLevel = NODES_PER_LEVEL[level];
      const nodesInNext = NODES_PER_LEVEL[level + 1];
      
      for (let i = 0; i < nodesInLevel; i++) {
        const parentIdx = levelOffsets[level] + i;
        const childStart = levelOffsets[level + 1] + i * 2;
        
        for (let c = 0; c < 2 && childStart + c < levelOffsets[level + 1] + nodesInNext; c++) {
          const childIdx = childStart + c;
          
          // Parent position
          const levelY = (LEVELS - 1) * 3.5 / 2 - level * 3.5;
          const levelWidth = Math.min(nodesInLevel * 2.5, 20);
          const startX = -levelWidth / 2;
          const px = startX + (i + 0.5) * (levelWidth / nodesInLevel);
          
          // Child position
          const childLevelY = (LEVELS - 1) * 3.5 / 2 - (level + 1) * 3.5;
          const childLevelWidth = Math.min(nodesInNext * 2.5, 20);
          const childStartX = -childLevelWidth / 2;
          const cx = childStartX + (childStart + c + 0.5) * (childLevelWidth / nodesInNext);
          
          positions.push(px, levelY, 0);
          positions.push(cx, childLevelY, 0);
          
          const levelNorm = level / 4.0;
          if (levelNorm < 0.25) {
            colors.push(0.54, 0.36, 0.96);
          } else if (levelNorm < 0.5) {
            colors.push(0.13, 0.82, 0.89);
          } else if (levelNorm < 0.75) {
            colors.push(0.96, 0.45, 0.71);
          } else {
            colors.push(0.98, 0.74, 0.15);
          }
          colors.push(0.54, 0.36, 0.96);
        }
      }
    }
    
    geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geo.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    return geo;
  }, []);

  const material = useMemo(() => new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  }), []);

  const line = useMemo(() => new Line(geometry, material), [geometry, material]);

  return <primitive object={line} ref={lineRef} />;
}

function MerkleRoot() {
  // Special root node with verification animation
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());

  const geometry = useMemo(() => new SphereGeometry(0.3, 32, 32), []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float uTime;
        void main() {
          vNormal = normal;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float uTime;
        void main() {
          float pulse = 0.5 + 0.5 * sin(uTime * 3.0);
          float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
          vec3 color = mix(vec3(0.54, 0.36, 0.96), vec3(0.98, 0.74, 0.15), pulse);
          color += vec3(fresnel * 0.5);
          gl_FragColor = vec4(color, 0.8 + pulse * 0.2);
        }
      `,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
    });
    materialRef.current = mat;
    return mat;
  }, []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = (performance.now() - startTime.current) * 0.001;
    }
    if (meshRef.current) {
      meshRef.current.position.set(0, 7, 0);
      meshRef.current.scale.setScalar(1.0 + Math.sin(Date.now() * 0.002) * 0.1);
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

function MerkleScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 7]} intensity={0.5} color="#8b5cf6" />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#22d3ee" />
      
      <MerkleNodes />
      <MerkleEdges />
      <MerkleRoot />
    </>
  );
}

export default function MerkleCanvas() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5, max: 2 }}
      >
        <MerkleScene />
      </Canvas>
    </div>
  );
}