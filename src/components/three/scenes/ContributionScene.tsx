"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Mesh, ShaderMaterial, InstancedBufferAttribute, BufferGeometry, BoxGeometry, Color, Points, LineBasicMaterial, Line, BufferAttribute, AdditiveBlending } from "three";
import { extend as extendThree } from "@react-three/fiber";

extendThree({ Mesh, ShaderMaterial, BufferGeometry, InstancedBufferAttribute, BoxGeometry, Points, LineBasicMaterial, Line });

const WEEKS = 52;
const DAYS = 7;
const TOTAL_DAYS = WEEKS * DAYS;

const vertexShader = `
attribute vec3 aPosition;
attribute vec3 aTargetPosition;
attribute float aWeek;
attribute float aDay;
attribute float aContributionLevel;
attribute float aIntensity;

uniform float uTime;
uniform float uScrollProgress;
uniform int uHighlightWeek;

varying vec3 vPosition;
varying float vWeek;
varying float vDay;
varying float vContributionLevel;
varying float vIntensity;
varying float vHighlight;

void main() {
    vPosition = aPosition;
    vWeek = aWeek;
    vDay = aDay;
    vContributionLevel = aContributionLevel;
    vIntensity = aIntensity;
    
    vHighlight = (uHighlightWeek == int(aWeek)) ? 1.0 : 0.0;
    
    vec3 pos = mix(aPosition, aTargetPosition, uScrollProgress);
    
    // Breathing animation
    float breathe = sin(uTime * 0.5 + aWeek * 0.1 + aDay * 0.5) * 0.02;
    pos.z += breathe * (1.0 + aContributionLevel);
    
    // Highlight pulse
    if (vHighlight > 0.5) {
        pos.z += sin(uTime * 5.0) * 0.1;
    }
    
    float size = 0.3 + aContributionLevel * 0.2 + vHighlight * 0.15;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (500.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying vec3 vPosition;
varying float vWeek;
varying float vDay;
varying float vContributionLevel;
varying float vIntensity;
varying float vHighlight;

uniform float uTime;

void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    if (dist > 0.5) discard;
    
    // GitHub-like green color scheme
    vec3 color;
    if (vContributionLevel < 0.25) {
        color = vec3(0.16, 0.18, 0.22); // empty
    } else if (vContributionLevel < 0.5) {
        color = vec3(0.14, 0.48, 0.22); // low
    } else if (vContributionLevel < 0.75) {
        color = vec3(0.09, 0.67, 0.18); // medium
    } else {
        color = vec3(0.04, 0.73, 0.14); // high
    }
    
    // Highlight color
    if (vHighlight > 0.5) {
        color = mix(color, vec3(0.54, 0.36, 0.96), 0.5);
    }
    
    // Pulse
    float pulse = 0.8 + 0.2 * sin(uTime * 3.0 + vWeek * 0.1);
    color *= pulse;
    
    // Edge glow
    float edge = 1.0 - smoothstep(0.2, 0.5, dist);
    color += vec3(edge * 0.3 * vIntensity);
    
    gl_FragColor = vec4(color, alpha * (0.6 + vContributionLevel * 0.4));
    gl_FragColor.rgb *= gl_FragColor.a;
}
`;

function ContributionGrid() {
  const { scene } = useThree();
  const nodesRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());
  const scrollProgressRef = useRef(0);
  const highlightWeekRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = TOTAL_DAYS;

    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const weeks = new Float32Array(count);
    const days = new Float32Array(count);
    const contributionLevels = new Float32Array(count);
    const intensities = new Float32Array(count);

    const cellSize = 0.45;
    const startX = -(WEEKS - 1) * cellSize / 2;
    const startY = (DAYS - 1) * cellSize / 2;
    
    // Generate realistic contribution data
    const contributions: number[] = [];
    for (let i = 0; i < count; i++) {
      // More contributions on weekdays, fewer on weekends
      const dayOfWeek = i % DAYS;
      const baseProb = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.2 : 0.6;
      const hasContribution = Math.random() < baseProb;
      const level = hasContribution ? Math.random() : 0;
      contributions.push(level);
    }
    
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS; d++) {
        const idx = w * DAYS + d;
        
        // Start all at center
        positions[idx * 3] = 0;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = 0;
        
        // Target grid position
        targetPositions[idx * 3] = startX + w * cellSize;
        targetPositions[idx * 3 + 1] = startY - d * cellSize;
        targetPositions[idx * 3 + 2] = 0;
        
        weeks[idx] = w;
        days[idx] = d;
        contributionLevels[idx] = contributions[idx];
        intensities[idx] = contributions[idx] > 0 ? 0.5 + Math.random() * 0.5 : 0.1;
      }
    }

    geo.setAttribute("position", new InstancedBufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aPosition", new InstancedBufferAttribute(positions, 3));
    geo.setAttribute("aTargetPosition", new InstancedBufferAttribute(targetPositions, 3));
    geo.setAttribute("aWeek", new InstancedBufferAttribute(weeks, 1));
    geo.setAttribute("aDay", new InstancedBufferAttribute(days, 1));
    geo.setAttribute("aContributionLevel", new InstancedBufferAttribute(contributionLevels, 1));
    geo.setAttribute("aIntensity", new InstancedBufferAttribute(intensities, 1));

    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uHighlightWeek: { value: 0 },
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
      materialRef.current.uniforms.uHighlightWeek.value = highlightWeekRef.current;
    }
  });

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      scrollProgressRef.current = customEvent.detail;
      highlightWeekRef.current = Math.floor(customEvent.detail * WEEKS);
    };
    window.addEventListener('contrib-progress', handleScroll);
    return () => window.removeEventListener('contrib-progress', handleScroll);
  }, []);

  return <points ref={nodesRef} geometry={geometry} material={material} />;
}

function WeekLabels() {
  // Month labels along the top
  const labelsRef = useRef<Mesh[]>([]);
  
  return (
    <group>
      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => (
        <mesh
          key={month}
          geometry={new BoxGeometry(2, 0.3, 0.1)}
          material={new ShaderMaterial({
            transparent: true,
            depthWrite: false,
            fragmentShader: `
              uniform vec3 uColor;
              void main() {
                gl_FragColor = vec4(uColor, 0.5);
              }
            `,
            uniforms: { uColor: { value: new Color("#8b5cf6") } },
          })}
          position={[(i - 5.5) * 4.5, 3.5, 0]}
        />
      ))}
    </group>
  );
}

function DayLabels() {
  const days = ["Mon", "Wed", "Fri"];
  return (
    <group>
      {days.map((day, i) => (
        <mesh
          key={day}
          geometry={new BoxGeometry(0.3, 0.5, 0.1)}
          material={new ShaderMaterial({
            transparent: true,
            depthWrite: false,
            fragmentShader: `
              uniform vec3 uColor;
              void main() {
                gl_FragColor = vec4(uColor, 0.4);
              }
            `,
            uniforms: { uColor: { value: new Color("#22d3ee") } },
          })}
          position={[-26, 2.5 - i * 1.5, 0]}
        />
      ))}
    </group>
  );
}

function ContributionScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 7]} intensity={0.3} color="#8b5cf6" />
      <directionalLight position={[-5, -5, -5]} intensity={0.2} color="#22d3ee" />
      
      <ContributionGrid />
      <WeekLabels />
      <DayLabels />
    </>
  );
}

export default function ContributionCanvas() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5, max: 2 }}
      >
        <ContributionScene />
      </Canvas>
    </div>
  );
}