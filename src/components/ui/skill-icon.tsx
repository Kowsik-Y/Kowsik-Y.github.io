"use client";

// Maps common skill names → Simple Icons component names
// Add more entries as needed: https://simpleicons.org/
import {
    SiPython, SiC, SiTypescript, SiJavascript,
    SiReact, SiNextdotjs, SiNodedotjs, SiMongodb, SiPostgresql,
    SiTailwindcss, SiFigma, SiGit, SiGithub, SiDocker,
    SiVercel, SiTensorflow, SiPytorch,
    SiAndroid, SiFlutter, SiFirebase, SiSupabase,
} from "@icons-pack/react-simple-icons";
import type { ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<{ size?: number; color?: string; className?: string }>> = {
    python: SiPython,
    c: SiC,
    typescript: SiTypescript,
    javascript: SiJavascript,
    react: SiReact,
    "react native": SiReact,
    nextjs: SiNextdotjs,
    "next.js": SiNextdotjs,
    nodejs: SiNodedotjs,
    "node.js": SiNodedotjs,
    mongodb: SiMongodb,
    postgresql: SiPostgresql,
    tailwindcss: SiTailwindcss,
    tailwind: SiTailwindcss,
    figma: SiFigma,
    git: SiGit,
    github: SiGithub,
    "github copilot": SiGithub,
    docker: SiDocker,
    vercel: SiVercel,
    tensorflow: SiTensorflow,
    pytorch: SiPytorch,
    android: SiAndroid,
    flutter: SiFlutter,
    firebase: SiFirebase,
    supabase: SiSupabase,
};

interface Props {
    name: string;
    icon?: string; // explicit slug override from DB
    size?: number;
    className?: string;
}

export default function SkillIcon({ name, icon, size = 14, className = "" }: Props) {
    const key = (icon ?? name).toLowerCase().trim();
    const Icon = ICON_MAP[key];
    if (!Icon) return null;
    return <Icon size={size} className={className} />;
}
