"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 120;
const CONNECT_DIST = 2.2;

function NeuralNet() {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const linesRef = useRef<THREE.LineSegments>(null!);

    // Generate random node positions
    const positions = useMemo(() => {
        const pos: THREE.Vector3[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            pos.push(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 14,
                    (Math.random() - 0.5) * 9,
                    (Math.random() - 0.5) * 6
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
            positions.map(() =>
                new THREE.Vector3(
                    (Math.random() - 0.5) * 0.0015,
                    (Math.random() - 0.5) * 0.0015,
                    (Math.random() - 0.5) * 0.001
                )
            ),
        [positions]
    );

    const matrix = useMemo(() => new THREE.Matrix4(), []);

    useFrame(() => {
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
            {/* Nodes */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color="#8b5cf6" />
            </instancedMesh>

            {/* Connections */}
            <lineSegments ref={linesRef} geometry={lineGeometry}>
                <lineBasicMaterial color="#8b5cf6" transparent opacity={0.18} />
            </lineSegments>
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
