"use client";

import dynamic from "next/dynamic";

const GitGraphCanvas = dynamic(() => import("@/components/three/scenes/GitGraphScene"), {
    ssr: false,
    loading: () => null,
});

export default function GitGraphCanvasClient() {
    return <GitGraphCanvas />;
}