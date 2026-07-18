"use client";

import dynamic from "next/dynamic";

const TerminalCanvas = dynamic(() => import("@/components/three/scenes/TerminalScene"), { ssr: false });

export default function TerminalCanvasClient() {
  return (
    <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
      <TerminalCanvas />
    </div>
  );
}