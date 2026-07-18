"use client";

import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Mesh, ShaderMaterial, InstancedBufferAttribute, BufferGeometry, BoxGeometry, Color, Points, AdditiveBlending, LineBasicMaterial, Line } from "three";
import { extend as extendThree } from "@react-three/fiber";

extendThree({ Mesh, ShaderMaterial, BufferGeometry, InstancedBufferAttribute, BoxGeometry, Points, LineBasicMaterial, Line });

const LAYER_COUNT = 6;
const NEURONS_PER_LAYER = 32;
const TOTAL_NEURONS = LAYER_COUNT * NEURONS_PER_LAYER;

const neuronVertexShader = `
attribute vec3 aPosition;
attribute vec3 aTargetPosition;
attribute float aLayer;
attribute float aNeuronIndex;
attribute float aActivation;

uniform float uTime;
uniform float uScrollProgress;
uniform int uCurrentLayer; // Which layer is being highlighted

varying vec3 vPosition;
varying float vLayer;
varying float vNeuronIndex;
varying float vActivation;
varying float vHighlight;

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

void main() {
    vPosition = aPosition;
    vLayer = aLayer;
    vNeuronIndex = aNeuronIndex;
    vActivation = aActivation;
    
    // Highlight current layer based on scroll
    float layerProgress = uScrollProgress * float(LAYER_COUNT);
    vHighlight = 1.0 - abs(layerProgress - aLayer) / 1.5;
    vHighlight = clamp(vHighlight, 0.0, 1.0);
    
    // Interpolate between rest and target position
    vec3 pos = mix(aPosition, aTargetPosition, uScrollProgress);
    
    // Activation pulse
    float pulse = sin(uTime * 4.0 + aLayer * 2.0 + aNeuronIndex * 0.5) * 0.1;
    pos += normalize(aPosition) * pulse * vHighlight;
    
    // Subtle breathing
    float breathe = sin(uTime * 0.5 + aLayer) * 0.02;
    pos *= 1.0 + breathe;
    
    float size = 4.0 + aActivation * 3.0 + vHighlight * 2.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const neuronFragmentShader = `
varying vec3 vPosition;
varying float vLayer;
varying float vNeuronIndex;
varying float vActivation;
varying float vHighlight;

uniform float uTime;
uniform vec3 uInputColor;
uniform vec3 uHiddenColor;
uniform vec3 uOutputColor;

void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    if (dist > 0.5) discard;
    
    // Layer-based coloring
    vec3 color;
    float layerNorm = vLayer / float(6.0);
    if (layerNorm < 0.2) {
        color = uInputColor;
    } else if (layerNorm < 0.8) {
        color = mix(uInputColor, uHiddenColor, (layerNorm - 0.2) / 0.6);
    } else {
        color = uOutputColor;
    }
    
    // Activation intensity
    float intensity = 0.3 + vActivation * 0.7 + vHighlight * 0.5;
    color *= intensity;
    
    // Pulse glow
    float pulse = 0.8 + 0.2 * sin(uTime * 5.0 + vLayer * 3.0 + vNeuronIndex);
    color *= pulse;
    
    // Edge glow
    float edge = 1.0 - smoothstep(0.1, 0.5, dist);
    color += vec3(edge * 0.3);
    
    gl_FragColor = vec4(color, alpha * (0.5 + vHighlight * 0.5));
    gl_FragColor.rgb *= gl_FragColor.a;
}
`;

const connectionVertexShader = `
attribute vec3 aStart;
attribute vec3 aEnd;
attribute float aLayer;
attribute float aWeight;

uniform float uTime;
uniform float uScrollProgress;
uniform int uCurrentLayer;

varying float vWeight;
varying float vProgress;
varying vec3 vColor;

vec3 layerColor(float layer) {
    float norm = layer / 6.0;
    if (norm < 0.2) return vec3(0.54, 0.36, 0.96); // violet
    else if (norm < 0.8) return vec3(0.13, 0.82, 0.89); // cyan
    else return vec3(0.96, 0.45, 0.71); // pink
}

void main() {
    // This is a simplified line rendering - actual positions set via geometry
    vWeight = aWeight;
    vProgress = uScrollProgress;
    vColor = layerColor(aLayer);
    
    // Position handled by Line2 geometry
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const connectionFragmentShader = `
varying float vWeight;
varying float vProgress;
varying vec3 vColor;

uniform float uTime;

void main() {
    float alpha = vWeight * 0.3 * (0.5 + 0.5 * sin(uTime * 2.0 + vProgress * 10.0));
    gl_FragColor = vec4(vColor, alpha);
}
`;

function TensorFlowScene() {
  const { scene } = useThree();
  const neuronsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());
  const scrollProgressRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = TOTAL_NEURONS;

    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const layers = new Float32Array(count);
    const neuronIndices = new Float32Array(count);
    const activations = new Float32Array(count);

    const layerSpacing = 3.5;
    const layerRadius = 4;
    
    for (let l = 0; l < LAYER_COUNT; l++) {
      for (let n = 0; n < NEURONS_PER_LAYER; n++) {
        const idx = l * NEURONS_PER_LAYER + n;
        
        // Rest position - circular layout per layer
        const angle = (n / NEURONS_PER_LAYER) * Math.PI * 2;
        const radius = layerRadius * (0.7 + 0.3 * Math.sin(l * 0.5));
        
        positions[idx * 3] = Math.cos(angle) * radius;
        positions[idx * 3 + 1] = Math.sin(angle) * radius;
        positions[idx * 3 + 2] = l * layerSpacing - (LAYER_COUNT - 1) * layerSpacing / 2;
        
        // Target position - grid layout for "computation" view
        const gridX = (n % 8 - 3.5) * 0.8;
        const gridY = (Math.floor(n / 8) - 1.5) * 0.8;
        
        targetPositions[idx * 3] = gridX;
        targetPositions[idx * 3 + 1] = gridY;
        targetPositions[idx * 3 + 2] = l * layerSpacing - (LAYER_COUNT - 1) * layerSpacing / 2;
        
        layers[idx] = l;
        neuronIndices[idx] = n;
        activations[idx] = 0.3 + Math.random() * 0.7;
      }
    }

    geo.setAttribute("position", new InstancedBufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aPosition", new InstancedBufferAttribute(positions, 3));
    geo.setAttribute("aTargetPosition", new InstancedBufferAttribute(targetPositions, 3));
    geo.setAttribute("aLayer", new InstancedBufferAttribute(layers, 1));
    geo.setAttribute("aNeuronIndex", new InstancedBufferAttribute(neuronIndices, 1));
    geo.setAttribute("aActivation", new InstancedBufferAttribute(activations, 1));

    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader: neuronVertexShader,
      fragmentShader: neuronFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uCurrentLayer: { value: 0 },
        uInputColor: { value: new Color("#8b5cf6") },
        uHiddenColor: { value: new Color("#22d3ee") },
        uOutputColor: { value: new Color("#f472b6") },
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
      materialRef.current.uniforms.uScrollProgress.value = scrollProgressRef.current;
      materialRef.current.uniforms.uCurrentLayer.value = Math.floor(scrollProgressRef.current * LAYER_COUNT);
    }
  });

  useEffect(() => {
    const handleScroll = (e: CustomEvent) => {
      scrollProgressRef.current = e.detail;
    };
    window.addEventListener('tensorflow-progress', handleScroll as EventListener);
    return () => window.removeEventListener('tensorflow-progress', handleScroll as EventListener);
  }, []);

  return (
    <group>
      <points ref={neuronsRef} geometry={geometry} material={material} />
      <TensorConnections />
    </group>
  );
}

function TensorConnections() {
  // Simplified connection lines between layers
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    // We'll generate connections on the fly in a more sophisticated version
    return g;
  }, []);
  
  const mat = useMemo(() => new LineBasicMaterial({
    color: 0x8b5cf6,
    linewidth: 1,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
  }), []);
  
  const lineRef = useRef<Line>(null);
  const line = useMemo(() => new Line(geo, mat), [geo, mat]);

  return <primitive object={line} ref={lineRef} />;
}

function MatrixMultiplicationViz() {
  // Visualize weight matrices as 3D grids
  const matricesRef = useRef<Mesh[]>([]);
  
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <MatrixLayer key={i} layerIndex={i} />
      ))}
    </group>
  );
}

function MatrixLayer({ layerIndex }: { layerIndex: number }) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());

  const geometry = useMemo(() => {
    const geo = new BoxGeometry(2, 2, 0.1);
    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader: `
        varying vec3 vPosition;
        uniform float uTime;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        uniform float uTime;
        uniform int uLayer;
        void main() {
          float pattern = sin(vPosition.x * 10.0 + uTime) * sin(vPosition.y * 10.0 + uTime);
          float weight = (pattern + 1.0) / 2.0;
          vec3 color = mix(vec3(0.54, 0.36, 0.96), vec3(0.13, 0.82, 0.89), weight);
          gl_FragColor = vec4(color, 0.3 + weight * 0.4);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uLayer: { value: layerIndex },
      },
      transparent: true,
      depthWrite: false,
    });
    materialRef.current = mat;
    return mat;
  }, [layerIndex]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = (performance.now() - startTime.current) * 0.001;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0005 + layerIndex) * 0.1;
      meshRef.current.rotation.y = Date.now() * 0.0002;
    }
  });

  const zPos = layerIndex * 3.5 - 3.5;
  
  return (
    <mesh ref={meshRef} geometry={geometry} material={material} position={[0, 0, zPos]} />
  );
}

export default function TensorFlowCanvas({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const progressRef = useRef(scrollProgress);
  progressRef.current = scrollProgress;
  
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [8, 5, 12], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5, max: 2 }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 7]} intensity={0.5} color="#8b5cf6" />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#22d3ee" />
        
        <TensorFlowScene />
        <MatrixMultiplicationViz />
      </Canvas>
    </div>
  );
}

import { useRef, useMemo, useEffect } from "react";