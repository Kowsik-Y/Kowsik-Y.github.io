"use client";

import dynamic from "next/dynamic";

const TensorFlowCanvas = dynamic(() => import("@/components/three/scenes/TensorFlowScene"), {
    ssr: false,
    loading: () => null,
});

export default function TensorFlowCanvasClient({ scrollProgress = 0 }: { scrollProgress?: number }) {
    return (
        <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
            <TensorFlowCanvas scrollProgress={scrollProgress} />
        </div>
    );
}