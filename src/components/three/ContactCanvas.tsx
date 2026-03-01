"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Pulsing sine waveform — for Contact page
function Wave() {
    const COUNT = 80;
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const xs = useMemo(() =>
        Array.from({ length: COUNT }, (_, i) => (i / COUNT) * 16 - 8), []);

    useFrame((state) => {
        xs.forEach((x, i) => {
            const t = state.clock.elapsedTime;
            const y = Math.sin(x * 0.8 + t * 1.2) * 1.5 + Math.sin(x * 0.4 + t * 0.7) * 0.7;
            dummy.position.set(x, y, 0);
            dummy.scale.setScalar(0.5 + Math.abs(Math.sin(x * 0.5 + t)) * 0.7);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshBasicMaterial color="#8b5cf6" opacity={0.7} transparent />
        </instancedMesh>
    );
}

export default function ContactCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ pointerEvents: "none" }}>
            <Wave />
        </Canvas>
    );
}
