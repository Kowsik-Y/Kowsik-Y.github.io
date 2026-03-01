"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/image-upload";
import { blobDisplayUrl } from "@/lib/blob-url";
import { Plus, Trash2, Github, Globe, Link as LinkIcon, type LucideIcon } from "lucide-react";

import type { IProfile } from "@/types";

const EMPTY: IProfile = {
    name: "", title: "", bio: "", photoUrl: "",
    githubUrl: "", linkedinUrl: "", email: "",
    leetcodeUrl: "", hackerrankUrl: "", websiteUrl: "",
    githubStatsUrl: "", githubStreakUrl: "", snakeSourceUrl: "",
    cgpa: "", semester: "", interests: [], availability: "",
    customLinks: [],
    githubActivityLinks: [],
};

function SectionHeader({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return (
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Icon size={15} className="text-violet-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}

export default function AdminProfilePage() {
    const [form, setForm] = useState<IProfile>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/profile")
            .then((r) => r.json())
            .then((data: Partial<IProfile>) => {
                setForm({ ...EMPTY, ...data });
            })
            .finally(() => setLoading(false));
    }, []);

    const set = (field: keyof IProfile) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const addCustomLink = () =>
        setForm((prev) => ({ ...prev, customLinks: [...(prev.customLinks ?? []), { label: "", url: "" }] }));

    const removeCustomLink = (i: number) =>
        setForm((prev) => ({ ...prev, customLinks: (prev.customLinks ?? []).filter((_, idx) => idx !== i) }));

    const setCustomLink = (i: number, field: "label" | "url", value: string) =>
        setForm((prev) => ({
            ...prev,
            customLinks: (prev.customLinks ?? []).map((l, idx) => idx === i ? { ...l, [field]: value } : l),
        }));

    const addGhLink = () =>
        setForm((prev) => ({ ...prev, githubActivityLinks: [...(prev.githubActivityLinks ?? []), { label: "", url: "" }] }));

    const removeGhLink = (i: number) =>
        setForm((prev) => ({ ...prev, githubActivityLinks: (prev.githubActivityLinks ?? []).filter((_, idx) => idx !== i) }));

    const setGhLink = (i: number, field: "label" | "url", value: string) =>
        setForm((prev) => ({
            ...prev,
            githubActivityLinks: (prev.githubActivityLinks ?? []).map((l, idx) => idx === i ? { ...l, [field]: value } : l),
        }));

    const handleSave = async () => {
        setSaving(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...payload } = form as IProfile & { _id?: string };
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) toast.success("Profile saved!");
            else toast.error("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-6 w-32 bg-white/5 rounded" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-white/5 rounded" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-1">Profile</h1>
            <p className="text-slate-500 text-sm mb-8">
                Edit your public profile. Changes reflect on the home and about pages instantly.
            </p>

            <div className="space-y-6">

                {/* ── Identity ── */}
                <div className="glass-card p-6 space-y-5">
                    <SectionHeader icon={Globe} label="Identity" />

                    <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-violet-500/30 shrink-0 bg-white/5">
                            {form.photoUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={blobDisplayUrl(form.photoUrl)} alt="Profile photo" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1">
                            <ImageUpload label="Profile Photo" value={form.photoUrl} onChange={(url) => setForm((prev) => ({ ...prev, photoUrl: url }))} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-300 mb-1 block">Full Name</Label>
                            <Input value={form.name} onChange={set("name")} placeholder="e.g. Kowsik Y" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-1 block">Title / Role</Label>
                            <Input value={form.title} onChange={set("title")} placeholder="e.g. AI & ML Engineer" className="bg-white/5 border-white/10 text-white" />
                        </div>
                    </div>

                    <div>
                        <Label className="text-slate-300 mb-1 block">Bio</Label>
                        <Textarea value={form.bio} onChange={set("bio")} rows={4} placeholder="Passionate about building intelligent systems…" className="bg-white/5 border-white/10 text-white resize-none" />
                    </div>

                    <div>
                        <Label className="text-slate-300 mb-1 block">Availability Badge</Label>
                        <p className="text-slate-500 text-xs mb-1.5">Shown on the hero. Leave blank to hide.</p>
                        <Input value={form.availability ?? ""} onChange={set("availability")} placeholder="Open to Internships & Opportunities" className="bg-white/5 border-white/10 text-white" />
                    </div>

                    <div>
                        <Label className="text-slate-300 mb-1 block">Interest Tags</Label>
                        <p className="text-slate-500 text-xs mb-1.5">Separate with commas.</p>
                        <Textarea
                            value={(form.interests ?? []).join(", ")}
                            onChange={(e) => setForm((prev) => ({ ...prev, interests: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }))}
                            rows={2}
                            placeholder="Agent AI Development, Full Stack Development, Generative AI & ML"
                            className="bg-white/5 border-white/10 text-white resize-none"
                        />
                    </div>
                </div>

                {/* ── Socials ── */}
                <div className="glass-card p-6 space-y-4">
                    <SectionHeader icon={Globe} label="Socials" />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-300 mb-1 block">LinkedIn URL</Label>
                            <Input value={form.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/username" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-1 block">Email</Label>
                            <Input value={form.email ?? ""} onChange={set("email")} placeholder="you@example.com" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-1 block">LeetCode URL</Label>
                            <Input value={form.leetcodeUrl ?? ""} onChange={set("leetcodeUrl")} placeholder="https://leetcode.com/username" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-1 block">HackerRank URL</Label>
                            <Input value={form.hackerrankUrl ?? ""} onChange={set("hackerrankUrl")} placeholder="https://hackerrank.com/username" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-slate-300 mb-1 block">Website / Portfolio URL</Label>
                            <Input value={form.websiteUrl ?? ""} onChange={set("websiteUrl")} placeholder="https://yoursite.com" className="bg-white/5 border-white/10 text-white" />
                        </div>
                    </div>

                    {/* Custom extra links */}
                    <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <LinkIcon size={13} className="text-slate-500" />
                                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Extra Links</span>
                            </div>
                            <button
                                type="button"
                                onClick={addCustomLink}
                                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-lg hover:bg-violet-500/10 transition-colors"
                            >
                                <Plus size={12} /> Add Link
                            </button>
                        </div>
                        {(form.customLinks ?? []).length === 0 && (
                            <p className="text-xs text-slate-600 italic">No extra links yet. Add links to Kaggle, Medium, YouTube, etc.</p>
                        )}
                        <div className="space-y-2">
                            {(form.customLinks ?? []).map((link, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Input
                                        value={link.label}
                                        onChange={(e) => setCustomLink(i, "label", e.target.value)}
                                        placeholder="Label (e.g. Kaggle)"
                                        className="bg-white/5 border-white/10 text-white w-36 shrink-0 text-sm"
                                    />
                                    <Input
                                        value={link.url}
                                        onChange={(e) => setCustomLink(i, "url", e.target.value)}
                                        placeholder="https://..."
                                        className="bg-white/5 border-white/10 text-white flex-1 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCustomLink(i)}
                                        className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                                        aria-label="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── GitHub ── */}
                <div className="glass-card p-6 space-y-4">
                    <SectionHeader icon={Github} label="GitHub" />

                    <div>
                        <Label className="text-slate-300 mb-1 block">GitHub URL</Label>
                        <Input value={form.githubUrl} onChange={set("githubUrl")} placeholder="https://github.com/username" className="bg-white/5 border-white/10 text-white" />
                    </div>

                    <div>
                        <Label className="text-slate-300 mb-1 block">GitHub Stats Image URL</Label>
                        <p className="text-slate-500 text-xs mb-1.5">
                            Generate at{" "}
                            <a href="https://github.com/anuraghazra/github-readme-stats" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">github-readme-stats</a>.
                        </p>
                        <Input value={form.githubStatsUrl ?? ""} onChange={set("githubStatsUrl")} placeholder="https://github-readme-stats.vercel.app/api?username=..." className="bg-white/5 border-white/10 text-white font-mono text-xs" />
                    </div>

                    <div>
                        <Label className="text-slate-300 mb-1 block">GitHub Streak Stats Image URL</Label>
                        <p className="text-slate-500 text-xs mb-1.5">
                            Generate at{" "}
                            <a href="https://streak-stats.demolab.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">streak-stats.demolab.com</a>.
                        </p>
                        <Input value={form.githubStreakUrl ?? ""} onChange={set("githubStreakUrl")} placeholder="https://streak-stats.demolab.com/?user=..." className="bg-white/5 border-white/10 text-white font-mono text-xs" />
                    </div>

                    <div>
                        <Label className="text-slate-300 mb-1 block">Contribution Snake URL</Label>
                        <p className="text-slate-500 text-xs mb-1.5">Raw SVG from your GitHub Actions output branch. Proxied live — no storage needed.</p>
                        <Input value={form.snakeSourceUrl ?? ""} onChange={set("snakeSourceUrl")} placeholder="https://raw.githubusercontent.com/USERNAME/USERNAME/output/github-contribution-grid-snake-dark.svg" className="bg-white/5 border-white/10 text-white font-mono text-xs" />
                    </div>

                    {/* GitHub activity extra links */}
                    <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <LinkIcon size={13} className="text-slate-500" />
                                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Activity Links</span>
                            </div>
                            <button
                                type="button"
                                onClick={addGhLink}
                                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-lg hover:bg-violet-500/10 transition-colors"
                            >
                                <Plus size={12} /> Add Link
                            </button>
                        </div>
                        {(form.githubActivityLinks ?? []).length === 0 && (
                            <p className="text-xs text-slate-600 italic">No activity links yet. Add links to specific repos, README, etc.</p>
                        )}
                        <div className="space-y-2">
                            {(form.githubActivityLinks ?? []).map((link, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Input
                                        value={link.label}
                                        onChange={(e) => setGhLink(i, "label", e.target.value)}
                                        placeholder="Label (e.g. Repos)"
                                        className="bg-white/5 border-white/10 text-white w-36 shrink-0 text-sm"
                                    />
                                    <Input
                                        value={link.url}
                                        onChange={(e) => setGhLink(i, "url", e.target.value)}
                                        placeholder="https://..."
                                        className="bg-white/5 border-white/10 text-white flex-1 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeGhLink(i)}
                                        className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                                        aria-label="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Quick Stats ── */}
                <div className="glass-card p-6 space-y-4">
                    <SectionHeader icon={Globe} label="Quick Stats" />
                    <p className="text-slate-500 text-xs -mt-1">Shown on Home &amp; About pages.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-300 mb-1 block">CGPA</Label>
                            <Input value={form.cgpa ?? ""} onChange={set("cgpa")} placeholder="e.g. 7.76/10" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-1 block">Semester</Label>
                            <Input value={form.semester ?? ""} onChange={set("semester")} placeholder="e.g. 4th" className="bg-white/5 border-white/10 text-white" />
                        </div>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                    {saving ? "Saving…" : "Save Profile"}
                </Button>
            </div>
        </div>
    );
}

