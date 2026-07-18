"use client";

import type { IEducation } from "@/types";
import { MapPin } from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/ui/fade-in";
import BentoCard from "@/components/ui/BentoCard";

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
                <div className="absolute left-[11px] top-0 h-full w-[2px] bg-border" />
                <div className="space-y-6">
                    {education.map((item, index) => (
                        <FadeIn key={item._id} delay={index * 0.08} direction="right">
                            <BentoCard className="p-6 relative overflow-visible">
                                <div className="absolute -left-[calc(1.5rem+7px)] top-8 h-4 w-4 rounded-full border-2 border-foreground bg-background" />
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground mb-1">{item.school}</h3>
                                        <p className="text-sm font-semibold text-foreground/80">{item.degree}</p>
                                    </div>
                                    <span className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary font-medium w-fit shrink-0">
                                        {item.years}
                                    </span>
                                </div>
                                
                                <div className="text-sm text-muted-foreground mt-4 flex flex-wrap items-center gap-3">
                                    {item.detail && <span className="font-medium">{item.detail}</span>}
                                    {item.detail && item.location && <span>•</span>}
                                    {item.location &&
                                        (item.mapsUrl ? (
                                            <Link
                                                href={item.mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:opacity-70 transition-opacity"
                                            >
                                                <MapPin size={14} />
                                                {item.location}
                                            </Link>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 font-medium">
                                                <MapPin size={14} />
                                                {item.location}
                                            </span>
                                        ))}
                                </div>
                            </BentoCard>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
