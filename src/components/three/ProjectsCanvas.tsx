"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Floating grid of glowing dots (circuit board style) — for Projects page
function GridDots() {
    const COUNT = 120;
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const data = useMemo(() =>
        Array.from({ length: COUNT }, () => ({
            x: (Math.random() - 0.5) * 18,
            y: (Math.random() - 0.5) * 12,
            z: (Math.random() - 0.5) * 6,
            speed: Math.random() * 0.4 + 0.1,
            phase: Math.random() * Math.PI * 2,
        })), []);

    useFrame((state) => {
        data.forEach((d, i) => {
            dummy.position.set(d.x, d.y + Math.sin(state.clock.elapsedTime * d.speed + d.phase) * 0.3, d.z);
            dummy.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * d.speed + d.phase) * 0.3);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color="#22d3ee" opacity={0.6} transparent />
        </instancedMesh>
    );
}

export default function ProjectsCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ pointerEvents: "none" }}>
            <GridDots />
        </Canvas>
    );
}
