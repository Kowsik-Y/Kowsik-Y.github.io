"use client";

import { useMemo, useState } from "react";
import type { ISkill } from "@/types";
import SkillIcon from "@/components/ui/skill-icon";
import FadeIn from "@/components/ui/fade-in";

type SkillsMatrixProps = {
    skills: ISkill[];
};

type SkillCategory = "All" | "Tech" | "Tool" | "Soft";

function getSkillScore(skill: ISkill, index: number) {
    const base = skill.category === "Tech" ? 74 : skill.category === "Tool" ? 68 : 62;
    const variance = (index * 9) % 26;
    return Math.min(96, base + variance);
}

export default function SkillsMatrix({ skills }: SkillsMatrixProps) {
    const [activeCategory, setActiveCategory] = useState<SkillCategory>("All");

    const categories: SkillCategory[] = ["All", "Tech", "Tool", "Soft"];

    const visibleSkills = useMemo(() => {
        if (activeCategory === "All") return skills;
        return skills.filter((skill) => skill.category === activeCategory);
    }, [activeCategory, skills]);

    if (skills.length === 0) return null;

    return (
        <section className="mt-14">
            <FadeIn>
                <h2 className="text-2xl font-bold mb-3">Skills Matrix</h2>
                <p className="text-sm text-muted-foreground mb-5">
                    Filter by category to inspect strengths across tools, technologies, and soft skills.
                </p>
            </FadeIn>

            <FadeIn delay={0.04}>
                <div className="glass-card p-4 mb-5">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const active = activeCategory === category;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${active
                                            ? "border-violet-500/60 bg-violet-500/20 text-violet-800 dark:text-violet-200"
                                            : "border-border/70 text-muted-foreground hover:border-violet-500/40"
                                        }`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </FadeIn>

            <div className="grid sm:grid-cols-2 gap-4">
                {visibleSkills.map((skill, index) => {
                    const score = getSkillScore(skill, index);

                    return (
                        <FadeIn key={skill._id} delay={index * 0.05}>
                            <div className="glass-card p-4">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                        <SkillIcon name={skill.name} size={14} />
                                        <span className="text-sm font-medium text-foreground">{skill.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{skill.category}</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-linear-to-r from-violet-500 to-cyan-500 transition-all duration-700"
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                            </div>
                        </FadeIn>
                    );
                })}
            </div>
        </section>
    );
}
