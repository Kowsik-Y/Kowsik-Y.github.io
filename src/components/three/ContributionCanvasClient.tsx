"use client";

import dynamic from "next/dynamic";

const ContributionCanvas = dynamic(() => import("@/components/three/scenes/ContributionScene"), { ssr: false });

export default function ContributionCanvasClient() {
  return (
    <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
      <ContributionCanvas />
    </div>
  );
}