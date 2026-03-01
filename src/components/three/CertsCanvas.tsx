"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Floating concentric orbit rings — for Certifications page
function Rings() {
    const groupRef = useRef<THREE.Group>(null!);

    const rings = useMemo(() => [
        { radius: 1.2, tilt: 0.2, speed: 0.4, color: "#8b5cf6" },
        { radius: 1.9, tilt: 0.8, speed: -0.25, color: "#22d3ee" },
        { radius: 2.6, tilt: 1.3, speed: 0.18, color: "#a78bfa" },
        { radius: 3.2, tilt: 0.5, speed: -0.12, color: "#67e8f9" },
    ], []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.15;
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
        }
    });

    const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
    useFrame((state) => {
        rings.forEach((r, i) => {
            const mesh = ringRefs.current[i];
            if (mesh) mesh.rotation.z = state.clock.elapsedTime * r.speed;
        });
    });

    return (
        <group ref={groupRef}>
            {rings.map((r, i) => (
                <mesh
                    key={i}
                    ref={(el) => { ringRefs.current[i] = el; }}
                    rotation={[r.tilt, 0, 0]}
                >
                    <torusGeometry args={[r.radius, 0.018, 8, 80]} />
                    <meshBasicMaterial color={r.color} opacity={0.35} transparent />
                </mesh>
            ))}
            {/* center orb */}
            <mesh>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshBasicMaterial color="#8b5cf6" opacity={0.6} transparent />
            </mesh>
        </group>
    );
}

export default function CertsCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 7], fov: 55 }} style={{ pointerEvents: "none" }}>
            <Rings />
        </Canvas>
    );
}
