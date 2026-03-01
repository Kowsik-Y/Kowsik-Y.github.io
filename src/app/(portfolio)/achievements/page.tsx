"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Building2, ExternalLink, ImageDown, ImageIcon, Calendar } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import AchievementsCanvasClient from "@/components/three/AchievementsCanvasClient";
import { blobDisplayUrl } from "@/lib/blob-url";
import type { IAchievement } from "@/types";
import { useState } from "react";
import CertDialog from "@/components/ui/certDialog";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AchievementsPage() {
    const { data: achievements, isLoading } = useSWR<IAchievement[]>("/api/achievements", fetcher);
    const [selected, setSelected] = useState<IAchievement | null>(null);
    return (
        <div className="relative">
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <AchievementsCanvasClient />
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
                <FadeIn>
                    <div className="mb-2 text-sm font-medium text-violet-400 uppercase tracking-widest">Recognition</div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">Achievements</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mb-14">Highlights, wins &amp; milestones from my journey.</p>
                </FadeIn>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (<div key={i} className="glass-card p-6 h-28 animate-pulse" />))}
                    </div>
                ) : achievements && achievements.length > 0 ? (
                    <div className="space-y-5">
                        {achievements.map((ach, i) => (
                            <FadeIn key={String(ach._id)} delay={i * 0.08}>
                                <div onClick={() => setSelected(ach)} className={`glass-card overflow-hidden ${i === 0 ? "gradient-border" : ""}`}>

                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                                                <Trophy size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h3 className="font-bold text-lg text-white mb-1">{ach.title}</h3>
                                                    <div
                                                        className="shrink-0 flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/25 px-3 py-1.5 rounded-lg transition-colors hover:bg-amber-500/10">
                                                        <ExternalLink size={13} /> View
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 text-sm leading-relaxed mb-3">{ach.description}</p>
                                                <div className="flex items-center gap-4 flex-wrap">


                                                    {ach.org && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Building2 size={13} />{ach.org}
                                                        </div>
                                                    )}
                                                    {ach.date && <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Calendar size={13} />
                                                        {ach.date}</span>}
                                                    {ach.imageUrl && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <ImageIcon size={13} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center text-slate-500">No achievements added yet.</div>
                )}
            </div>
            {selected && <CertDialog cert={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
