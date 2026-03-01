"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Shooting stars / comets — for Achievements page
interface Star { pos: THREE.Vector3; vel: THREE.Vector3; trail: number }

function Comets() {
    const groupRef = useRef<THREE.Group>(null!);

    const stars = useMemo<Star[]>(() =>
        Array.from({ length: 18 }, () => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 4,
            ),
            vel: new THREE.Vector3(
                -(Math.random() * 0.04 + 0.02),
                -(Math.random() * 0.02),
                0,
            ),
            trail: Math.random() * 0.6 + 0.3,
        })), []);

    const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

    useFrame(() => {
        stars.forEach((s, i) => {
            s.pos.add(s.vel);
            if (s.pos.x < -6) {
                s.pos.set(6, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4);
            }
            const mesh = meshRefs.current[i];
            if (mesh) mesh.position.copy(s.pos);
        });
    });

    return (
        <group ref={groupRef}>
            {stars.map((s, i) => (
                <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} position={s.pos.toArray()}>
                    <sphereGeometry args={[0.04, 6, 6]} />
                    <meshBasicMaterial color="#fbbf24" />
                </mesh>
            ))}
        </group>
    );
}

export default function AchievementsCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ pointerEvents: "none" }}>
            <Comets />
        </Canvas>
    );
}
