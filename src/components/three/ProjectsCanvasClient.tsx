"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ConstellationCanvas = dynamic(() => import("@/components/three/scenes/ConstellationScene"), { ssr: false });

export default function ProjectsCanvasClient({ activeCategory = "all" }: { activeCategory?: string }) {
  const categoryMap: Record<string, number> = {
    "all": -1,
    "AI/ML": 0,
    "Full-Stack": 1,
    "GenAI": 2,
    "Research": 3,
  };

  const categoryIndex = categoryMap[activeCategory] ?? -1;

  return (
    <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
      <ConstellationCanvas activeCategory={categoryIndex} scrollProgress={0} />
    </div>
  );
}