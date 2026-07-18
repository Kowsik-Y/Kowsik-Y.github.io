"use client";

import { ReactNode } from "react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sectionBreadcrumbs } from "@/lib/breadcrumbs";
import SectionHeader from "./SectionHeader";

interface PageHeroProps {
    label: string;
    title: string;
    subtitle?: string;
    section: string;
    sectionPath: string;
    children?: ReactNode;
    canvas?: ReactNode;
}

export default function PageHero({
    label,
    title,
    subtitle,
    section,
    sectionPath,
    children,
    canvas,
}: PageHeroProps) {
    return (
        <div className="relative">
            {/* Background canvas */}
            {canvas && (
                <div className="fixed inset-0 -z-10 opacity-25 pointer-events-none">
                    {canvas}
                </div>
            )}

            {/* Aurora accent blobs */}
            <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none" aria-hidden>
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-500/10 blur-[100px] animate-[aurora-1_12s_ease-in-out_infinite]" />
                <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-[80px] animate-[aurora-2_10s_ease-in-out_infinite]" />
            </div>

            <div className="pt-28 pb-4">
                <SectionHeader
                    label={label}
                    title={title}
                    subtitle={subtitle}
                    className="mb-14"
                />
                {children}
            </div>
        </div>
    );
}
