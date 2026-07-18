"use client";

import { ReactNode } from "react";

interface GlowCardProps {
    children: ReactNode;
    className?: string;
    accent?: "violet" | "cyan" | "amber" | "pink" | "emerald";
    animated?: boolean;
    hover?: boolean;
    onClick?: () => void;
}

const accentColors = {
    violet: {
        hoverBorder: "hover:border-violet-500/40",
        hoverShadow: "hover:shadow-[0_8px_40px_rgba(139,92,246,0.15)]",
        darkHoverShadow: "dark:hover:shadow-[0_8px_40px_rgba(139,92,246,0.25)]",
    },
    cyan: {
        hoverBorder: "hover:border-cyan-500/40",
        hoverShadow: "hover:shadow-[0_8px_40px_rgba(34,211,238,0.15)]",
        darkHoverShadow: "dark:hover:shadow-[0_8px_40px_rgba(34,211,238,0.25)]",
    },
    amber: {
        hoverBorder: "hover:border-amber-500/40",
        hoverShadow: "hover:shadow-[0_8px_40px_rgba(245,158,11,0.15)]",
        darkHoverShadow: "dark:hover:shadow-[0_8px_40px_rgba(245,158,11,0.25)]",
    },
    pink: {
        hoverBorder: "hover:border-pink-500/40",
        hoverShadow: "hover:shadow-[0_8px_40px_rgba(236,72,153,0.15)]",
        darkHoverShadow: "dark:hover:shadow-[0_8px_40px_rgba(236,72,153,0.25)]",
    },
    emerald: {
        hoverBorder: "hover:border-emerald-500/40",
        hoverShadow: "hover:shadow-[0_8px_40px_rgba(16,185,129,0.15)]",
        darkHoverShadow: "dark:hover:shadow-[0_8px_40px_rgba(16,185,129,0.25)]",
    },
};

export default function GlowCard({
    children,
    className = "",
    accent = "violet",
    animated = false,
    hover = true,
    onClick,
}: GlowCardProps) {
    const colors = accentColors[accent];
    const hoverClasses = hover
        ? `${colors.hoverBorder} ${colors.hoverShadow} ${colors.darkHoverShadow} hover:translate-y-[-2px]`
        : "";
    const animatedClass = animated ? "gradient-border-animated" : "";
    const clickClass = onClick ? "cursor-pointer" : "";

    return (
        <div
            className={`glass-card p-6 transition-all duration-300 ${hoverClasses} ${animatedClass} ${clickClass} ${className}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
        >
            {children}
        </div>
    );
}
