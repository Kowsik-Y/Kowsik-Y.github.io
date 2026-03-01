"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// DNA Double Helix — for About page
function Helix() {
    const groupRef = useRef<THREE.Group>(null!);
    const COUNT = 40;

    const positions1: [number, number, number][] = [];
    const positions2: [number, number, number][] = [];
    for (let i = 0; i < COUNT; i++) {
        const t = (i / COUNT) * Math.PI * 6 - Math.PI * 3;
        const y = (i / COUNT) * 8 - 4;
        positions1.push([Math.cos(t) * 1.4, y, Math.sin(t) * 1.4]);
        positions2.push([Math.cos(t + Math.PI) * 1.4, y, Math.sin(t + Math.PI) * 1.4]);
    }

    useFrame((state) => {
        if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    });

    return (
        <group ref={groupRef}>
            {positions1.map((pos, i) => (
                <mesh key={`h1-${i}`} position={pos}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshBasicMaterial color="#8b5cf6" />
                </mesh>
            ))}
            {positions2.map((pos, i) => (
                <mesh key={`h2-${i}`} position={pos}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshBasicMaterial color="#22d3ee" />
                </mesh>
            ))}
            {positions1.map((pos, i) => {
                const p2 = positions2[i];
                const mid: [number, number, number] = [
                    (pos[0] + p2[0]) / 2,
                    (pos[1] + p2[1]) / 2,
                    (pos[2] + p2[2]) / 2,
                ];
                const dx = p2[0] - pos[0], dy = p2[1] - pos[1], dz = p2[2] - pos[2];
                const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
                return (
                    <mesh key={`rung-${i}`} position={mid}>
                        <cylinderGeometry args={[0.015, 0.015, len, 4]} />
                        <meshBasicMaterial color="#ffffff" opacity={0.12} transparent />
                    </mesh>
                );
            })}
        </group>
    );
}

export default function AboutCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 7], fov: 55 }} style={{ pointerEvents: "none" }}>
            <Helix />
        </Canvas>
    );
}
