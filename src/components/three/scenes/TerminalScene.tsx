"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Mesh, ShaderMaterial, BufferGeometry, PlaneGeometry, Color } from "three";
import { extend as extendThree } from "@react-three/fiber";

extendThree({ Mesh, ShaderMaterial, BufferGeometry, PlaneGeometry });

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uScrollProgress;
uniform vec3 uBgColor;
uniform vec3 uTextColor;
uniform vec3 uAccentColor;

void main() {
    vec2 uv = vUv;
    
    // Terminal background with scanlines
    vec3 bg = uBgColor;
    
    // Scanline effect
    float scanline = sin(uv.y * 800.0 + uTime * 50.0) * 0.02;
    bg += vec3(scanline);
    
    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.5;
    bg *= vignette;
    
    // Cursor blink
    float cursorBlink = step(0.5, fract(uTime * 2.0));
    
    // Simulated text rendering via distance fields
    // We'll use a grid-based approach
    vec2 grid = uv * vec2(80.0, 40.0); // 80x40 terminal
    vec2 cell = fract(grid);
    vec2 charPos = floor(grid);
    
    // Character rendering (simplified - shows a few lines of text)
    float textMask = 0.0;
    
    // Line 1: Welcome message
    if (charPos.y < 2.0 && charPos.x < 30.0) {
        float charIdx = charPos.x;
        // Simple pattern for "Welcome to Kowsik's Portfolio"
        if (cell.x > 0.1 && cell.x < 0.9 && cell.y > 0.1 && cell.y < 0.9) {
            textMask = 1.0;
        }
    }
    
    // Line 3: Simulated command prompt
    if (charPos.y > 4.0 && charPos.y < 6.0) {
        if (charPos.x < 40.0 && cell.x > 0.1 && cell.x < 0.9 && cell.y > 0.1 && cell.y < 0.9) {
            textMask = 1.0;
        }
    }
    
    // Cursor
    float cursorMask = 0.0;
    if (charPos.y == 5.0 && charPos.x < 5.0) {
        if (cell.x > 0.1 && cell.x < 0.3 && cell.y > 0.1 && cell.y < 0.9 && cursorBlink > 0.5) {
            cursorMask = 1.0;
        }
    }
    
    vec3 color = mix(bg, uTextColor, textMask);
    color = mix(color, uAccentColor, cursorMask);
    
    // Add some noise
    float noise = sin(uv.x * 100.0) * sin(uv.y * 100.0 + uTime * 10.0) * 0.005;
    color += vec3(noise);
    
    gl_FragColor = vec4(color, 1.0);
}
`;

function TerminalScreen() {
  const materialRef = useRef<ShaderMaterial | null>(null);
  const startTime = useRef(performance.now());
  const scrollProgressRef = useRef(0);

  const geometry = useMemo(() => new PlaneGeometry(2, 1), []);
  
  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uBgColor: { value: new Color("#0d1117") },
        uTextColor: { value: new Color("#e6edf3") },
        uAccentColor: { value: new Color("#8b5cf6") },
      },
    });
    materialRef.current = mat;
    return mat;
  }, []);

  useFrame(() => {
    if (materialRef.current) {
      const elapsed = (performance.now() - startTime.current) * 0.001;
      materialRef.current.uniforms.uTime.value = elapsed;
      materialRef.current.uniforms.uScrollProgress.value = scrollProgressRef.current;
    }
  });

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      scrollProgressRef.current = customEvent.detail;
    };
    window.addEventListener('terminal-progress', handleScroll);
    return () => window.removeEventListener('terminal-progress', handleScroll);
  }, []);

  return <mesh geometry={geometry} material={material} position={[0, 0, 0]} />;
}

function TerminalScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 0, 5]} intensity={0.5} />
      
      <TerminalScreen />
    </>
  );
}

export default function TerminalCanvas() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5, max: 2 }}
      >
        <TerminalScene />
      </Canvas>
    </div>
  );
}