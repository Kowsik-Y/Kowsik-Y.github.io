"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Shooting stars / comets — for Achievements page
interface Star { pos: THREE.Vector3; vel: THREE.Vector3; trail: number }

function seededNoise(seed: number) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
}

function Comets() {
    const groupRef = useRef<THREE.Group>(null!);

    const stars = useMemo<Star[]>(() =>
        Array.from({ length: 18 }, (_, index) => ({
            pos: new THREE.Vector3(
                (seededNoise((index + 1) * 1.4) - 0.5) * 12,
                (seededNoise((index + 1) * 2.4) - 0.5) * 8,
                (seededNoise((index + 1) * 3.4) - 0.5) * 4,
            ),
            vel: new THREE.Vector3(
                -(seededNoise((index + 1) * 4.4) * 0.04 + 0.02),
                -(seededNoise((index + 1) * 5.4) * 0.02),
                0,
            ),
            trail: seededNoise((index + 1) * 6.4) * 0.6 + 0.3,
        })), []);

    const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

    useFrame((state) => {
        const elapsed = state.clock.getElapsedTime();
        stars.forEach((s, i) => {
            s.pos.add(s.vel);
            if (s.pos.x < -6) {
                s.pos.set(6, Math.sin(elapsed + i * 1.37) * 4, Math.cos(elapsed * 0.7 + i * 0.83) * 2);
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
