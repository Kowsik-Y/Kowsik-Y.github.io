"use client";
import dynamic from "next/dynamic";

const ProjectsCanvas = dynamic(() => import("./ProjectsCanvas"), { ssr: false });
export default function ProjectsCanvasClient() {
    return <ProjectsCanvas />;
}
