"use client";
import dynamic from "next/dynamic";

const ContactCanvas = dynamic(() => import("./ContactCanvas"), { ssr: false });
export default function ContactCanvasClient() {
    return <ContactCanvas />;
}
