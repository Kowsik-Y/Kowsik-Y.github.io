"use client";
import dynamic from "next/dynamic";

const AboutCanvas = dynamic(() => import("./AboutCanvas"), { ssr: false });
export default function AboutCanvasClient() {
    return <AboutCanvas />;
}
