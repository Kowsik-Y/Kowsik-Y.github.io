"use client";

import dynamic from "next/dynamic";

const MerkleCanvas = dynamic(() => import("@/components/three/scenes/MerkleScene"), { ssr: false });

export default function MerkleCanvasClient() {
  return (
    <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
      <MerkleCanvas />
    </div>
  );
}