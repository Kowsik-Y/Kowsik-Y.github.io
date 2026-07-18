"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FadeIn from "@/components/ui/fade-in";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sectionBreadcrumbs } from "@/lib/breadcrumbs";
import EducationTimeline from "@/components/portfolio/EducationTimeline";
import SkillsMatrix from "@/components/portfolio/SkillsMatrix";
import { Code2, Wrench, Heart, Globe, MapPin, User, Github, Linkedin, Terminal, Mail, Link as LinkIcon, GraduationCap, BarChart3, Award, FolderKanban } from "lucide-react";
import type { IProfile } from "@/types";
import { usePortfolioStore } from "@/lib/stores/portfolioStore";
import { blobDisplayUrl } from "@/lib/blob-url";
import BentoCard from "@/components/ui/BentoCard";
import ImageReveal from "@/components/ui/ImageReveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "next-themes";

const STAT_ICONS: Record<string, typeof BarChart3> = {
    CGPA: BarChart3,
    Semester: GraduationCap,
    Projects: FolderKanban,
    Certifications: Award,
};

export default function AboutPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const isDark = mounted && resolvedTheme === "dark";
    
    const profile = (usePortfolioStore((s) => s.profile) ?? {}) as Partial<IProfile>;
    const githubUsername = profile.githubUrl ? profile.githubUrl.split("/").filter(Boolean).pop() || "Kowsik-Y" : "Kowsik-Y";
    const skills = usePortfolioStore((s) => s.skills);
    const education = usePortfolioStore((s) => s.education);
    const languages = usePortfolioStore((s) => s.languages);
    const hobbies = usePortfolioStore((s) => s.hobbies);
    const summary = usePortfolioStore((s) => s.summary);
    const loading = usePortfolioStore((s) => s.loading);
    const hydrated = usePortfolioStore((s) => s.hydrated);
    const fetchOverview = usePortfolioStore((s) => s.fetchOverview);

    const projectsCount = summary.projectsCount;
    const certsCount = summary.certificatesCount;

    const [snakeLoaded, setSnakeLoaded] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!hydrated) {
            fetchOverview();
        }
    }, [fetchOverview, hydrated]);

    const techSkills = skills.filter((s) => s.category === "Tech");
    const toolSkills = skills.filter((s) => s.category === "Tool");
    const softSkills = skills.filter((s) => s.category === "Soft");

    return (
        <div className="min-h-screen pt-32 pb-20 dot-pattern relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">About Me</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        A closer look at my background, skills, and the journey that shaped my engineering perspective.
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                    
                    {/* Bio & Photo Block (Span 12, inner grid) */}
                    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">
                        <BentoCard className="md:col-span-8 p-8 sm:p-12" delay={0.1}>
                            <h2 className="text-2xl font-bold mb-6">The Journey</h2>
                            <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                                {profile.bio || "I'm a developer who loves blending design with engineering. My focus is on creating intelligent systems and seamless user experiences using the latest web technologies and AI models."}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                {[
                                    { icon: Github, url: profile.githubUrl, label: "GitHub" },
                                    { icon: Linkedin, url: profile.linkedinUrl, label: "LinkedIn" },
                                    { icon: Code2, url: profile.leetcodeUrl, label: "LeetCode" },
                                    { icon: Terminal, url: profile.hackerrankUrl, label: "HackerRank" },
                                    { icon: Mail, url: profile.email ? `mailto:${profile.email}` : undefined, label: "Email" }
                                ].map((item) => item.url && (
                                    <MagneticButton
                                        key={item.label}
                                        as="a"
                                        href={item.url}
                                        target={item.label === "Email" ? undefined : "_blank"}
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background transition-colors font-medium text-sm"
                                    >
                                        <item.icon size={16} /> {item.label}
                                    </MagneticButton>
                                ))}
                            </div>
                        </BentoCard>

                        <BentoCard className="md:col-span-4 p-2" delay={0.15}>
                            {profile.photoUrl ? (
                                <ImageReveal 
                                    src={blobDisplayUrl(profile.photoUrl)} 
                                    alt="Profile" 
                                    aspectRatio="portrait"
                                    className="w-full h-full object-cover"
                                    containerClassName="w-full h-full rounded-[calc(var(--radius-3xl)-0.5rem)] min-h-[300px]"
                                />
                            ) : (
                                <div className="w-full h-full min-h-[300px] bg-secondary rounded-[calc(var(--radius-3xl)-0.5rem)] flex items-center justify-center">
                                    <User size={64} className="text-muted-foreground/30" />
                                </div>
                            )}
                        </BentoCard>
                    </div>

                    {/* Stats Row */}
                    {(profile.cgpa || profile.semester || projectsCount > 0 || certsCount > 0) && (
                        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "CGPA", value: profile.cgpa },
                                { label: "Semester", value: profile.semester },
                                { label: "Projects", value: projectsCount > 0 ? String(projectsCount) : null },
                                { label: "Certifications", value: certsCount > 0 ? String(certsCount) : null },
                            ].filter((s) => s.value).map(({ label, value }, i) => {
                                const Icon = STAT_ICONS[label] ?? BarChart3;
                                return (
                                    <BentoCard key={label} delay={0.2 + (i * 0.05)} className="p-6 text-center flex flex-col items-center justify-center">
                                        <Icon size={24} className="mb-3 opacity-80" />
                                        <span className="text-3xl font-bold mb-1">{value}</span>
                                        <span className="text-xs uppercase tracking-widest opacity-70">{label}</span>
                                    </BentoCard>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Skills Section */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <BentoCard delay={0.3} className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                <Code2 size={18} className="text-foreground" />
                            </div>
                            <h3 className="font-bold text-lg">Tech Skills</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {techSkills.map((s) => (
                                <span key={s._id} className="ui-chip">{s.name}</span>
                            ))}
                        </div>
                    </BentoCard>

                    <BentoCard delay={0.35} className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                <Wrench size={18} className="text-foreground" />
                            </div>
                            <h3 className="font-bold text-lg">Tools</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {toolSkills.map((s) => (
                                <span key={s._id} className="ui-chip">{s.name}</span>
                            ))}
                        </div>
                    </BentoCard>

                    <BentoCard delay={0.4} className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                <Heart size={18} className="text-foreground" />
                            </div>
                            <h3 className="font-bold text-lg">Soft Skills</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {softSkills.map((s) => (
                                <span key={s._id} className="ui-chip">{s.name}</span>
                            ))}
                        </div>
                    </BentoCard>
                </div>

                {/* Languages, Hobbies & Snake */}
                <div className="grid md:grid-cols-12 gap-6 mb-12">
                    <BentoCard delay={0.45} className="md:col-span-4 p-8">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Globe size={18} /> Languages
                        </h3>
                        <ul className="space-y-4">
                            {languages.map((l) => (
                                <li key={l._id} className="flex justify-between items-center border-b border-background/20 pb-2">
                                    <span className="font-medium">{l.name}</span>
                                    <span className="text-sm opacity-70">{l.proficiency}</span>
                                </li>
                            ))}
                        </ul>
                    </BentoCard>

                    <BentoCard delay={0.5} className="md:col-span-8 p-8 flex flex-col justify-center">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Github size={18} /> Activity Map
                        </h3>
                        <div className="w-full overflow-hidden rounded-xl bg-background border border-border p-6 flex flex-col items-center justify-center min-h-[150px] custom-scroll relative">
                            {mounted ? (
                                <GitHubCalendar
                                    username={githubUsername}
                                    colorScheme={isDark ? "dark" : "light"}
                                    theme={{
                                        light: ['#f4f4f5', '#d4d4d8', '#a1a1aa', '#71717a', '#3f3f46'],
                                        dark: ['#18181b', '#27272a', '#52525b', '#a1a1aa', '#e4e4e7']
                                    }}
                                    blockSize={10}
                                    blockMargin={4}
                                    fontSize={10}
                                />
                            ) : (
                                <div className="h-[120px] w-full animate-pulse bg-muted rounded-md" />
                            )}
                        </div>
                    </BentoCard>
                </div>

                {/* Education Timeline */}
                <BentoCard delay={0.55} className="p-8 md:p-12">
                    <h2 className="text-3xl font-bold mb-10 text-center">Education</h2>
                    <EducationTimeline education={education} />
                </BentoCard>
            </div>
        </div>
    );
}