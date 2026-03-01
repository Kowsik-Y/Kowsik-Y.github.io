"use client";
import dynamic from "next/dynamic";

const AchievementsCanvas = dynamic(() => import("./AchievementsCanvas"), { ssr: false });
export default function AchievementsCanvasClient() {
    return <AchievementsCanvas />;
}
