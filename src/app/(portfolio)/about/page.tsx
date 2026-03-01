"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FadeIn from "@/components/ui/fade-in";
import SkillIcon from "@/components/ui/skill-icon";
import HeroCanvasClient from "@/components/three/HeroCanvasClient";
import { Code2, Wrench, Heart, Globe, MapPin, User, Github, Linkedin, Terminal, Mail, Link as LinkIcon } from "lucide-react";
import type { ISkill, IEducation, ILanguage, IHobby, IProfile } from "@/types";
import { blobDisplayUrl } from "@/lib/blob-url";

const SkillPill = ({ label, color }: { label: string; color: string }) => (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${color}`}>
        <SkillIcon name={label} size={12} />
        {label}
    </span>
);

const PillSkeleton = () => (
    <span className="inline-block h-7 w-20 rounded-full bg-white/5 animate-pulse" />
);

const CardSkeleton = () => (
    <div className="glass-card p-6 h-full">
        <div className="h-4 w-24 rounded bg-white/5 animate-pulse mb-4" />
        <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => <PillSkeleton key={i} />)}
        </div>
    </div>
);

export default function AboutPage() {
    const [profile, setProfile] = useState<Partial<IProfile>>({});
    const [skills, setSkills] = useState<ISkill[]>([]);
    const [education, setEducation] = useState<IEducation[]>([]);
    const [languages, setLanguages] = useState<ILanguage[]>([]);
    const [hobbies, setHobbies] = useState<IHobby[]>([]);
    const [projectsCount, setProjectsCount] = useState(0);
    const [certsCount, setCertsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [snakeLoaded, setSnakeLoaded] = useState(false);
    const [snakeMouse, setSnakeMouse] = useState({ x: 0, y: 0 });
    const [snakeHover, setSnakeHover] = useState(false);
    const [statsState, setStatsState] = useState<"loading" | "loaded" | "error">("loading");
    const [streakState, setStreakState] = useState<"loading" | "loaded" | "error">("loading");

    useEffect(() => {
        Promise.all([
            fetch("/api/profile").then((r) => r.json()),
            fetch("/api/skills").then((r) => r.json()),
            fetch("/api/education").then((r) => r.json()),
            fetch("/api/languages").then((r) => r.json()),
            fetch("/api/hobbies").then((r) => r.json()),
            fetch("/api/projects").then((r) => r.json()),
            fetch("/api/certificates").then((r) => r.json()),
        ]).then(([pr, sk, ed, la, ho, proj, certs]) => {
            setProfile(pr);
            setSkills(sk);
            setEducation(ed);
            setLanguages(la);
            setHobbies(ho);
            setProjectsCount(Array.isArray(proj) ? proj.length : 0);
            setCertsCount(Array.isArray(certs) ? certs.length : 0);
        }).finally(() => setLoading(false));
    }, []);

    const techSkills = skills.filter((s) => s.category === "Tech");
    const toolSkills = skills.filter((s) => s.category === "Tool");
    const softSkills = skills.filter((s) => s.category === "Soft");

    return (
        <div className="relative">
            {/* Three.js Neural Net Background */}
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <HeroCanvasClient />
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
                <FadeIn>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-16">
                        <div className="shrink-0">
                            {/* Mosaic boxes profile photo */}
                            <div className="relative w-44 h-44 sm:w-52 sm:h-52">
                                {/* Floating accent boxes */}
                                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-violet-500/25 rotate-12 border border-violet-400/40 backdrop-blur-sm" />
                                <div className="absolute -top-2 left-8 w-5 h-5 rounded-md bg-cyan-400/30 rotate-45 border border-cyan-300/40" />
                                <div className="absolute -bottom-5 -right-5 w-12 h-12 rounded-xl bg-cyan-500/20 -rotate-12 border border-cyan-400/30 backdrop-blur-sm" />
                                <div className="absolute -bottom-2 right-10 w-4 h-4 rounded bg-violet-400/35 rotate-12 border border-violet-300/40" />
                                <div className="absolute top-1/2 -left-6 w-6 h-6 rounded-lg bg-violet-600/30 -rotate-6 border border-violet-500/40" />
                                <div className="absolute top-1/3 -right-4 w-5 h-5 rounded-lg bg-cyan-500/25 rotate-12 border border-cyan-400/35" />
                                {/* Main square photo frame */}
                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/25 bg-slate-900 border border-violet-500/30">
                                    {profile.photoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={blobDisplayUrl(profile.photoUrl)}
                                            alt={profile.name || "Kowsik Y"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User size={56} className="text-slate-500" />
                                        </div>
                                    )}
                                    {/* Grid overlay — boxes effect */}
                                    <div
                                        className="absolute inset-0 pointer-events-none opacity-20"
                                        style={{
                                            backgroundImage:
                                                "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
                                            backgroundSize: "26px 26px",
                                        }}
                                    />
                                    {/* Corner glow */}
                                    <div className="absolute inset-0 bg-linear-to-br from-violet-500/15 via-transparent to-cyan-500/15 pointer-events-none" />
                                </div>
                                {/* Outer glow ring */}
                                <div className="absolute inset-0 rounded-2xl ring-1 ring-violet-400/30 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <div className="mb-2 text-sm font-medium text-violet-400 uppercase tracking-widest">
                                About Me
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                                Crafting <span className="gradient-text">Intelligent</span> Solutions
                            </h1>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                                {profile.bio || "Passionate about building intelligent systems — from neural networks to production-ready full-stack apps. Currently pursuing B.Tech in AI & ML at Bannari Amman Institute of Technology."}
                            </p>

                            {/* Social links */}
                            <div className="flex flex-wrap items-center gap-2 mt-5">
                                {profile.githubUrl && (
                                    <Link href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-slate-400 bg-white/5 hover:text-violet-400 hover:border-violet-500/40 transition-colors">
                                        <Github size={13} /> GitHub
                                    </Link>
                                )}
                                {profile.linkedinUrl && (
                                    <Link href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-slate-400 bg-white/5 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
                                        <Linkedin size={13} /> LinkedIn
                                    </Link>
                                )}
                                {profile.leetcodeUrl && (
                                    <Link href={profile.leetcodeUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-slate-400 bg-white/5 hover:text-yellow-400 hover:border-yellow-500/40 transition-colors">
                                        <Code2 size={13} /> LeetCode
                                    </Link>
                                )}
                                {profile.hackerrankUrl && (
                                    <Link href={profile.hackerrankUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-slate-400 bg-white/5 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors">
                                        <Terminal size={13} /> HackerRank
                                    </Link>
                                )}
                                {profile.email && (
                                    <Link href={`mailto:${profile.email}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-slate-400 bg-white/5 hover:text-rose-400 hover:border-rose-500/40 transition-colors">
                                        <Mail size={13} /> {profile.email}
                                    </Link>
                                )}
                                {profile.websiteUrl && (
                                    <Link href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-slate-400 bg-white/5 hover:text-violet-400 hover:border-violet-500/40 transition-colors">
                                        <Globe size={13} /> Website
                                    </Link>
                                )}
                                {(profile.customLinks ?? []).map((cl, i) => cl.url && (
                                    <Link key={i} href={cl.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-slate-400 bg-white/5 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
                                        <LinkIcon size={13} /> {cl.label || cl.url}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Quick Stats */}
                {(profile.cgpa || profile.semester || projectsCount > 0 || certsCount > 0) && (
                    <FadeIn delay={0.05}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
                            {[
                                { label: "CGPA", value: profile.cgpa },
                                { label: "Semester", value: profile.semester },
                                { label: "Projects", value: projectsCount > 0 ? String(projectsCount) : null },
                                { label: "Certifications", value: certsCount > 0 ? String(certsCount) : null },
                            ].filter((s) => s.value).map(({ label, value }) => (
                                <div key={label} className="glass-card p-5 text-center">
                                    <p className="text-2xl sm:text-3xl font-bold gradient-text">{value}</p>
                                    <p className="text-sm text-slate-500 mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                )}

                {/* Skills */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {/* Tech */}
                    <FadeIn delay={0.1}>
                        {loading ? <CardSkeleton /> : (
                            <div className="glass-card p-6 h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <Code2 className="text-violet-400" size={20} />
                                    <span className="font-semibold text-sm text-slate-300 uppercase tracking-wide">Tech Skills</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {techSkills.map((s) => (
                                        <SkillPill key={s._id} label={s.name} color="border-violet-500/30 text-violet-300 bg-violet-500/10" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </FadeIn>

                    {/* Tools */}
                    <FadeIn delay={0.15}>
                        {loading ? <CardSkeleton /> : (
                            <div className="glass-card p-6 h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <Wrench className="text-cyan-400" size={20} />
                                    <span className="font-semibold text-sm text-slate-300 uppercase tracking-wide">Tools &amp; Frameworks</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {toolSkills.map((s) => (
                                        <SkillPill key={s._id} label={s.name} color="border-cyan-500/30 text-cyan-300 bg-cyan-500/10" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </FadeIn>

                    {/* Soft */}
                    <FadeIn delay={0.2}>
                        {loading ? <CardSkeleton /> : (
                            <div className="glass-card p-6 h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <Heart className="text-pink-400" size={20} />
                                    <span className="font-semibold text-sm text-slate-300 uppercase tracking-wide">Soft Skills</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {softSkills.map((s) => (
                                        <SkillPill key={s._id} label={s.name} color="border-pink-500/30 text-pink-300 bg-pink-500/10" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </FadeIn>
                </div>

                {/* Education */}
                <FadeIn delay={0.25}>
                    <h2 className="text-2xl font-bold mb-6">Education</h2>
                    <div className="space-y-4 mb-16">
                        {loading ? (
                            [...Array(2)].map((_, i) => (
                                <div key={i} className="glass-card p-6 animate-pulse">
                                    <div className="h-4 w-64 bg-white/5 rounded mb-3" />
                                    <div className="h-3 w-48 bg-white/5 rounded mb-2" />
                                    <div className="h-3 w-36 bg-white/5 rounded" />
                                </div>
                            ))
                        ) : education.map((edu) => (
                            <div key={edu._id} className="glass-card p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <h3 className="font-semibold text-white">{edu.school}</h3>
                                    <span className="text-sm text-slate-500">{edu.years}</span>
                                </div>
                                <p className="text-violet-300 text-sm mb-1">{edu.degree}</p>
                                <div className="flex items-center gap-2 flex-wrap text-sm">
                                    {edu.detail && <span className="text-slate-400">{edu.detail}</span>}
                                    {edu.detail && edu.location && <span className="text-slate-600">·</span>}
                                    {edu.location && (
                                        edu.mapsUrl ? (
                                            <Link
                                                href={edu.mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                                            >
                                                <MapPin size={12} />
                                                {edu.location}
                                            </Link>
                                        ) : (
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <MapPin size={12} />
                                                {edu.location}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeIn>

                {/* Languages & Hobbies */}
                <FadeIn delay={0.3}>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="text-cyan-400" size={18} />
                                <span className="font-semibold text-sm text-slate-300 uppercase tracking-wide">Languages</span>
                            </div>
                            {loading ? (
                                <div className="space-y-2">
                                    {[...Array(2)].map((_, i) => <div key={i} className="h-3 w-40 bg-white/5 rounded animate-pulse" />)}
                                </div>
                            ) : (
                                <ul className="text-slate-400 text-sm space-y-1">
                                    {languages.map((l) => (
                                        <li key={l._id}>{l.name} — {l.proficiency}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Heart className="text-violet-400" size={18} />
                                <span className="font-semibold text-sm text-slate-300 uppercase tracking-wide">Hobbies</span>
                            </div>
                            {loading ? (
                                <div className="space-y-2">
                                    {[...Array(2)].map((_, i) => <div key={i} className="h-3 w-48 bg-white/5 rounded animate-pulse" />)}
                                </div>
                            ) : (
                                <ul className="text-slate-400 text-sm space-y-1">
                                    {hobbies.map((h) => (
                                        <li key={h._id}>{h.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </FadeIn>

                {/* GitHub Stats */}
                {!loading && (() => {
                    const ghUsername = profile.githubUrl
                        ? profile.githubUrl.replace(/\/$/, "").split("/").pop()
                        : null;
                    if (!ghUsername) return null;
                    return (
                        <FadeIn delay={0.35}>
                            {/* Section heading + activity link buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-16 mb-6">
                                <h2 className="text-2xl font-bold">GitHub Activity</h2>
                                {(profile.githubActivityLinks ?? []).filter((cl) => cl.url).length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {(profile.githubActivityLinks ?? []).filter((cl) => cl.url).map((cl, i) => (
                                            <a
                                                key={i}
                                                href={cl.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-violet-500/30 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 hover:border-violet-500/50 transition-colors"
                                            >
                                                <Github size={12} />
                                                {cl.label || cl.url}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Analytics + Streak */}
                            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                                {/* Stats card */}
                                <a
                                    href={profile.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glass-card p-1 flex items-center justify-center rounded-2xl hover:ring-2 hover:ring-violet-500/40 transition-all min-h-35"
                                >
                                    {!profile.githubStatsUrl || statsState === "error" ? (
                                        <span className="text-slate-500 text-sm">Stats unavailable</span>
                                    ) : (
                                        <div className="relative w-full">
                                            {statsState === "loading" && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="h-24 w-full rounded-xl bg-white/5 animate-pulse" />
                                                </div>
                                            )}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={profile.githubStatsUrl}
                                                alt="GitHub Stats"
                                                className={`w-full rounded-xl transition-opacity duration-300 ${statsState === "loaded" ? "opacity-100" : "opacity-0"}`}
                                                loading="lazy"
                                                onLoad={() => setStatsState("loaded")}
                                                onError={() => setStatsState("error")}
                                            />
                                        </div>
                                    )}
                                </a>

                                {/* Streak card */}
                                <a
                                    href={profile.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glass-card p-1 flex items-center justify-center rounded-2xl hover:ring-2 hover:ring-cyan-500/40 transition-all min-h-35"
                                >
                                    {!profile.githubStreakUrl || streakState === "error" ? (
                                        <span className="text-slate-500 text-sm">Streak stats unavailable</span>
                                    ) : (
                                        <div className="relative w-full">
                                            {streakState === "loading" && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="h-24 w-full rounded-xl bg-white/5 animate-pulse" />
                                                </div>
                                            )}
                                            <img
                                                src={profile.githubStreakUrl}
                                                alt="GitHub Streak Stats"
                                                className={`w-full rounded-xl transition-opacity duration-300 ${streakState === "loaded" ? "opacity-100" : "opacity-0"}`}
                                                loading="lazy"
                                                onLoad={() => setStreakState("loaded")}
                                                onError={() => setStreakState("error")}
                                            />
                                        </div>
                                    )}
                                </a>
                            </div>

                            {/* Contribution Snake */}
                            <div className="relative glass-card p-4 rounded-2xl mb-6">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
                                    Contribution Snake
                                </p>
                                <img
                                    src="/api/github-snake"
                                    alt="GitHub Contribution Snake"
                                    className="w-full rounded-lg"
                                    loading="lazy"
                                    onLoad={() => setSnakeLoaded(true)}
                                    onError={() => setSnakeLoaded(false)}
                                />
                            </div>

                            {/* Extra Links (Socials custom links) */}
                            {(profile.customLinks ?? []).filter((cl) => cl.url).length > 0 && (
                                <div className="glass-card p-5 rounded-2xl">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
                                        More Links
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(profile.customLinks ?? []).filter((cl) => cl.url).map((cl, i) => (
                                            <a
                                                key={i}
                                                href={cl.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-slate-400 bg-white/5 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                                            >
                                                <LinkIcon size={12} />
                                                {cl.label || cl.url}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </FadeIn>
                    );
                })()}
            </div>
        </div>
    );
}
