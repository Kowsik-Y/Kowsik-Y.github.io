"use client";

import type { IEducation } from "@/types";
import { MapPin } from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/ui/fade-in";

type EducationTimelineProps = {
    education: IEducation[];
};

export default function EducationTimeline({ education }: EducationTimelineProps) {
    if (education.length === 0) return null;

    return (
        <section className="mt-14">
            <FadeIn>
                <h2 className="text-2xl font-bold mb-6">Journey Timeline</h2>
            </FadeIn>
            <div className="relative pl-6">
                <div className="absolute left-2 top-0 h-full w-px bg-linear-to-b from-violet-500/60 via-cyan-500/40 to-transparent" />
                <div className="space-y-5">
                    {education.map((item, index) => (
                        <FadeIn key={item._id} delay={index * 0.08} direction="right">
                            <article className="glass-card p-5 relative">
                                <div className="absolute -left-[1.62rem] top-7 h-3.5 w-3.5 rounded-full border border-violet-500/60 bg-background shadow-[0_0_0_4px_rgba(139,92,246,0.12)]" />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <h3 className="font-semibold text-foreground">{item.school}</h3>
                                    <span className="text-xs px-2 py-1 rounded-full border border-border/70 text-muted-foreground w-fit">
                                        {item.years}
                                    </span>
                                </div>
                                <p className="text-sm text-violet-500 dark:text-violet-300 mt-2">{item.degree}</p>
                                <div className="text-sm text-muted-foreground mt-2 flex flex-wrap items-center gap-2">
                                    {item.detail && <span>{item.detail}</span>}
                                    {item.detail && item.location && <span>•</span>}
                                    {item.location &&
                                        (item.mapsUrl ? (
                                            <Link
                                                href={item.mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
                                            >
                                                <MapPin size={12} />
                                                {item.location}
                                            </Link>
                                        ) : (
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin size={12} />
                                                {item.location}
                                            </span>
                                        ))}
                                </div>
                            </article>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
