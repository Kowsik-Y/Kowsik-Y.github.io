"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 120;
const CONNECT_DIST = 2.2;

function seededNoise(seed: number) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
}

function NeuralNet() {
    const groupRef = useRef<THREE.Group>(null!);
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const linesRef = useRef<THREE.LineSegments>(null!);

    // Generate random node positions
    const positions = useMemo(() => {
        const pos: THREE.Vector3[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            const seed = i + 1;
            pos.push(
                new THREE.Vector3(
                    (seededNoise(seed * 1.1) - 0.5) * 14,
                    (seededNoise(seed * 2.2) - 0.5) * 9,
                    (seededNoise(seed * 3.3) - 0.5) * 6
                )
            );
        }
        return pos;
    }, []);

    // Build line geometry between nearby nodes
    const lineGeometry = useMemo(() => {
        const pts: number[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            for (let j = i + 1; j < NODE_COUNT; j++) {
                if (positions[i].distanceTo(positions[j]) < CONNECT_DIST) {
                    pts.push(positions[i].x, positions[i].y, positions[i].z);
                    pts.push(positions[j].x, positions[j].y, positions[j].z);
                }
            }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        return geo;
    }, [positions]);

    // Per-node random velocity for gentle drift
    const velocities = useMemo(
        () =>
            positions.map((_, index) =>
                new THREE.Vector3(
                    (seededNoise((index + 1) * 4.1) - 0.5) * 0.0015,
                    (seededNoise((index + 1) * 5.2) - 0.5) * 0.0015,
                    (seededNoise((index + 1) * 6.3) - 0.5) * 0.001
                )
            ),
        [positions]
    );

    const matrix = useMemo(() => new THREE.Matrix4(), []);

    const particleGeometry = useMemo(() => {
        const points: number[] = [];
        for (let i = 0; i < 260; i++) {
            const seed = i + 10;
            points.push(
                (seededNoise(seed * 1.7) - 0.5) * 22,
                (seededNoise(seed * 2.7) - 0.5) * 14,
                (seededNoise(seed * 3.7) - 0.5) * 10
            );
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
        return geometry;
    }, []);

    useFrame((state, delta) => {
        const targetX = state.pointer.x * 0.2;
        const targetY = state.pointer.y * 0.16;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.05);
        groupRef.current.rotation.z += delta * 0.01;

        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 0.45, 0.03);
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 0.3, 0.03);
        state.camera.lookAt(0, 0, 0);

        // Drift nodes
        positions.forEach((p, i) => {
            p.add(velocities[i]);
            if (Math.abs(p.x) > 7) velocities[i].x *= -1;
            if (Math.abs(p.y) > 4.5) velocities[i].y *= -1;
            if (Math.abs(p.z) > 3) velocities[i].z *= -1;

            matrix.setPosition(p);
            meshRef.current.setMatrixAt(i, matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;

        // Rebuild lines
        const pts: number[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            for (let j = i + 1; j < NODE_COUNT; j++) {
                if (positions[i].distanceTo(positions[j]) < CONNECT_DIST) {
                    pts.push(positions[i].x, positions[i].y, positions[i].z);
                    pts.push(positions[j].x, positions[j].y, positions[j].z);
                }
            }
        }
        linesRef.current.geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(pts, 3)
        );
        linesRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <>
            <group ref={groupRef}>
                {/* Nodes */}
                <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshBasicMaterial color="#8b5cf6" />
                </instancedMesh>

                {/* Connections */}
                <lineSegments ref={linesRef} geometry={lineGeometry}>
                    <lineBasicMaterial color="#8b5cf6" transparent opacity={0.18} />
                </lineSegments>
            </group>

            {/* Ambient particles */}
            <points geometry={particleGeometry}>
                <pointsMaterial color="#22d3ee" size={0.03} transparent opacity={0.2} sizeAttenuation />
            </points>
        </>
    );
}

export default function HeroCanvas() {
    return (
        <div className="absolute inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: "transparent" }}
            >
                <ambientLight intensity={0.4} />
                <NeuralNet />
            </Canvas>
        </div>
    );
}
