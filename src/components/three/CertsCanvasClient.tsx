"use client";
import dynamic from "next/dynamic";

const CertsCanvas = dynamic(() => import("./CertsCanvas"), { ssr: false });
export default function CertsCanvasClient() {
    return <CertsCanvas />;
}
