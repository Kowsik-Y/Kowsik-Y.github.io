"use client";

import dynamic from "next/dynamic";

const AttentionCanvas = dynamic(() => import("@/components/three/scenes/AttentionScene"), {
    ssr: false,
    loading: () => null,
});

export default function AttentionCanvasClient() {
    return (
        <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
            <AttentionCanvas />
        </div>
    );
}