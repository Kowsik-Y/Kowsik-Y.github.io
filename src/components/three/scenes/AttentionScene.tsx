"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Mesh, ShaderMaterial, InstancedBufferAttribute, BufferGeometry, BoxGeometry, Color, Points, AdditiveBlending, LineBasicMaterial, Line, BufferAttribute } from "three";
import { extend as extendThree } from "@react-three/fiber";

extendThree({ Mesh, ShaderMaterial, BufferGeometry, InstancedBufferAttribute, BoxGeometry, Points, LineBasicMaterial, Line });

const HEADS = 8;
const SEQ_LEN = 64;
const TOTAL_NODES = HEADS * SEQ_LEN;

const neuronVertexShader = `
attribute vec3 aPosition;
attribute float aHead;
attribute float aSeqPos;
attribute float aAttention;

uniform float uTime;
uniform float uScrollProgress;
uniform int uActiveHead;

varying vec3 vPosition;
varying float vHead;
varying float vSeqPos;
varying float vAttention;
varying float vHighlight;

void main() {
    vPosition = aPosition;
    vHead = aHead;
    vSeqPos = aSeqPos;
    vAttention = aAttention;
    
    // Highlight active head based on scroll
    vHighlight = (uActiveHead == int(aHead)) ? 1.0 : 0.0;
    
    vec3 pos = aPosition;
    
    // Attention pulse
    float pulse = sin(uTime * 3.0 + aSeqPos * 0.5 + aHead * 2.0) * 0.1 * aAttention;
    pos += normalize(aPosition) * pulse;
    
    // Scroll-driven expansion
    float expand = 1.0 + uScrollProgress * 0.4;
    pos *= expand;
    
    float size = 3.0 + aAttention * 4.0 + vHighlight * 2.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (400.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const neuronFragmentShader = `
varying vec3 vPosition;
varying float vHead;
varying float vSeqPos;
varying float vAttention;
varying float vHighlight;

uniform float uTime;
uniform vec3 uQueryColor;
uniform vec3 uKeyColor;
uniform vec3 uValueColor;

void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    if (dist > 0.5) discard;
    
    // Head-based coloring (different colors per head)
    float headHue = vHead / 8.0;
    vec3 color = mix(uQueryColor, uKeyColor, headHue);
    color = mix(color, uValueColor, vSeqPos / 64.0);
    
    // Attention intensity
    float intensity = 0.4 + vAttention * 0.6 + vHighlight * 0.3;
    color *= intensity;
    
    // Pulse
    float pulse = 0.7 + 0.3 * sin(uTime * 4.0 + vSeqPos * 0.3);
    color *= pulse;
    
    // Edge glow
    float edge = 1.0 - smoothstep(0.1, 0.5, dist);
    color += vec3(edge * 0.4 * intensity);
    
    gl_FragColor = vec4(color, alpha * intensity);
    gl_FragColor.rgb *= gl_FragColor.a;
}
`;

function AttentionNodes() {
  const { scene } = useThree();
  const nodesRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());
  const scrollProgressRef = useRef(0);
  const activeHeadRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = TOTAL_NODES;

    const positions = new Float32Array(count * 3);
    const heads = new Float32Array(count);
    const seqPos = new Float32Array(count);
    const attention = new Float32Array(count);

    const radius = 12;
    const height = 8;
    
    for (let h = 0; h < HEADS; h++) {
      for (let s = 0; s < SEQ_LEN; s++) {
        const idx = h * SEQ_LEN + s;
        
        // Spiral arrangement per head
        const angle = (s / SEQ_LEN) * Math.PI * 4 + h * 0.5;
        const r = radius * (0.5 + 0.5 * Math.sin(h * 0.8));
        const y = (h - HEADS / 2) * (height / HEADS) + (Math.random() - 0.5) * 0.3;
        
        positions[idx * 3] = Math.cos(angle) * r;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = Math.sin(angle) * r;
        
        heads[idx] = h;
        seqPos[idx] = s;
        attention[idx] = 0.3 + Math.random() * 0.7;
      }
    }

    geo.setAttribute("position", new InstancedBufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aPosition", new InstancedBufferAttribute(positions, 3));
    geo.setAttribute("aHead", new InstancedBufferAttribute(heads, 1));
    geo.setAttribute("aSeqPos", new InstancedBufferAttribute(seqPos, 1));
    geo.setAttribute("aAttention", new InstancedBufferAttribute(attention, 1));

    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader: neuronVertexShader,
      fragmentShader: neuronFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uActiveHead: { value: 0 },
        uQueryColor: { value: new Color("#8b5cf6") },
        uKeyColor: { value: new Color("#22d3ee") },
        uValueColor: { value: new Color("#f472b6") },
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
      materialRef.current.uniforms.uActiveHead.value = activeHeadRef.current;
    }
  });

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      scrollProgressRef.current = customEvent.detail;
      activeHeadRef.current = Math.floor(customEvent.detail * HEADS);
    };
    window.addEventListener('attention-progress', handleScroll);
    return () => window.removeEventListener('attention-progress', handleScroll);
  }, []);

  return <points ref={nodesRef} geometry={geometry} material={material} />;
}

function AttentionConnections() {
  const lineRef = useRef<Line>(null);
  const geometryRef = useRef<BufferGeometry>(null);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    // Connections between query-key-value in each head
    const connections: number[] = [];
    const colors: number[] = [];
    
    for (let h = 0; h < HEADS; h++) {
      for (let s = 0; s < SEQ_LEN - 1; s += 4) {
        const idx1 = h * SEQ_LEN + s;
        const idx2 = h * SEQ_LEN + s + 1;
        
        connections.push(idx1, idx2);
        
        const hue = h / HEADS;
        colors.push(
          Math.sin(hue * 6.28) * 0.5 + 0.5,
          Math.sin(hue * 6.28 + 2.09) * 0.5 + 0.5,
          Math.sin(hue * 6.28 + 4.18) * 0.5 + 0.5
        );
      }
    }
    
    geo.setAttribute('position', new BufferAttribute(new Float32Array(connections.length * 3), 3));
    geo.setAttribute('color', new BufferAttribute(new Float32Array(colors.length), 3));
    return geo;
  }, []);

  const material = useMemo(() => new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  }), []);

  const line = useMemo(() => new Line(geometry, material), [geometry, material]);

  return <primitive object={line} ref={lineRef} />;
}

function AttentionHeatmap() {
  // 2D heatmap visualization of attention weights
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());

  const geometry = useMemo(() => new BoxGeometry(20, 10, 0.1), []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uScrollProgress;
        void main() {
          float x = vUv.x * 8.0;
          float y = vUv.y * 8.0;
          
          // Simulated attention pattern
          float pattern = 0.0;
          for (int i = 0; i < 8; i++) {
            float hx = float(i) + 0.5;
            float hy = 4.0 + sin(uTime * 0.5 + float(i)) * 2.0;
            float dist = distance(vec2(x, y), vec2(hx, hy));
            pattern += exp(-dist * 2.0) * (0.5 + 0.5 * sin(uTime + float(i) * 2.0));
          }
          
          vec3 color = mix(vec3(0.54, 0.36, 0.96), vec3(0.13, 0.82, 0.89), pattern);
          color = mix(color, vec3(0.96, 0.45, 0.71), vUv.y);
          
          float alpha = 0.1 + pattern * 0.4;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
      },
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
      meshRef.current.position.z = -15;
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

function AttentionScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 7]} intensity={0.5} color="#8b5cf6" />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#22d3ee" />
      
      <AttentionNodes />
      <AttentionConnections />
      <AttentionHeatmap />
    </>
  );
}

export default function AttentionCanvas() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5, max: 2 }}
      >
        <AttentionScene />
      </Canvas>
    </div>
  );
}