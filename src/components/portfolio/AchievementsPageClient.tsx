"use client";

import { useState } from "react";
import { Trophy, Building2, ExternalLink, Calendar } from "lucide-react";
import type { IAchievement } from "@/types";
import CertDialog from "@/components/ui/certDialog";
import BentoCard from "@/components/ui/BentoCard";

type AchievementsPageClientProps = {
    achievements: IAchievement[];
};

export default function AchievementsPageClient({ achievements }: AchievementsPageClientProps) {
    const [selected, setSelected] = useState<IAchievement | null>(null);

    return (
        <div className="min-h-screen pt-32 pb-20 dot-pattern">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Achievements</h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Milestones, awards, and recognition from my journey.
                    </p>
                </div>

                {achievements.length > 0 ? (
                    <div className="grid gap-4">
                        {achievements.map((ach, i) => (
                            <BentoCard 
                                key={String(ach._id)} 
                                delay={i * 0.05} 
                                interactive
                                onClick={() => setSelected(ach)} 
                                className="group p-6 sm:p-8"
                            >
                                <div className="flex items-start gap-4 sm:gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                                        <Trophy size={20} className="text-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl mb-2 group-hover:opacity-70 transition-opacity">{ach.title}</h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                    {ach.org && (
                                                        <span className="flex items-center gap-1.5 font-medium">
                                                            <Building2 size={14} /> {ach.org}
                                                        </span>
                                                    )}
                                                    {ach.date && (
                                                        <span className="flex items-center gap-1.5 font-medium">
                                                            <Calendar size={14} /> {ach.date}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 transition-transform group-hover:bg-foreground group-hover:text-background group-hover:scale-110">
                                                <ExternalLink size={16} />
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed max-w-2xl text-muted-foreground">
                                            {ach.description}
                                        </p>
                                    </div>
                                </div>
                            </BentoCard>
                        ))}
                    </div>
                ) : (
                    <div className="bento-card p-12 text-center text-muted-foreground">No achievements added yet.</div>
                )}
            </div>
            {selected && <CertDialog cert={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
