"use client";

import FadeIn from "./fade-in";

interface SectionHeaderProps {
    label: string;
    title: string;
    subtitle?: string;
    className?: string;
    align?: "left" | "center";
}

export default function SectionHeader({
    label,
    title,
    subtitle,
    className = "",
    align = "left",
}: SectionHeaderProps) {
    const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

    return (
        <div className={`flex flex-col ${alignClass} ${className}`}>
            <FadeIn>
                <div className="flex items-center gap-2 mb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-sm font-semibold text-violet-400 uppercase tracking-[0.2em]">
                        {label}
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                    <span className="gradient-text">{title}</span>
                </h1>
                {subtitle && (
                    <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                        {subtitle}
                    </p>
                )}
                <div className="section-divider mt-8 w-full max-w-xs" />
            </FadeIn>
        </div>
    );
}
