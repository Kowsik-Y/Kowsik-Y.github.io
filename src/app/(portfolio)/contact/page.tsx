"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Github, Linkedin, Code2, Terminal, Copy, Check, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sectionBreadcrumbs } from "@/lib/breadcrumbs";
import type { IProfile } from "@/types";
import { usePortfolioStore } from "@/lib/stores/portfolioStore";
import BentoCard from "@/components/ui/BentoCard";
import MagneticButton from "@/components/ui/MagneticButton";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
    const [submitting, setSubmitting] = useState(false);
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
    const profile = (usePortfolioStore((s) => s.profile) ?? {}) as Partial<IProfile>;
    const fetchOverview = usePortfolioStore((s) => s.fetchOverview);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormValues) => {
        setSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                toast.success("Message sent! I'll get back to you soon.");
                reset();
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch {
            toast.error("Failed to send. Please email me directly.");
        } finally {
            setSubmitting(false);
        }
    };

    const contactLinks = [
        profile.email && { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
        profile.githubUrl && { icon: Github, label: "GitHub", value: `@${profile.githubUrl.replace(/\/$/, "").split("/").pop()}`, href: profile.githubUrl },
        profile.linkedinUrl && { icon: Linkedin, label: "LinkedIn", value: `@${profile.linkedinUrl.replace(/\/$/, "").split("/").pop()}`, href: profile.linkedinUrl },
        profile.leetcodeUrl && { icon: Code2, label: "LeetCode", value: `@${profile.leetcodeUrl.replace(/\/$/, "").split("/").pop()}`, href: profile.leetcodeUrl },
        profile.hackerrankUrl && { icon: Terminal, label: "HackerRank", value: `@${profile.hackerrankUrl.replace(/\/$/, "").split("/").pop()}`, href: profile.hackerrankUrl },
    ].filter(Boolean) as { icon: LucideIcon; label: string; value: string; href: string }[];

    const copyValue = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedLabel(label);
            toast.success(`${label} copied`);
            setTimeout(() => setCopiedLabel(null), 2000);
        } catch {
            toast.error("Clipboard access failed");
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 dot-pattern">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Let&apos;s Connect</h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        I&apos;m always open to new opportunities, collaborations, or just a chat about AI and technology.
                    </p>
                </div>

                <div className="grid md:grid-cols-12 gap-6">
                    {/* Form */}
                    <BentoCard className="md:col-span-7 p-8 sm:p-10" delay={0.1}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <Label htmlFor="name" className="font-semibold mb-2 block">Name</Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="Your name"
                                    className="h-12 bg-secondary border-transparent focus:bg-background focus:border-foreground transition-colors rounded-xl px-4"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="email" className="font-semibold mb-2 block">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="you@example.com"
                                    className="h-12 bg-secondary border-transparent focus:bg-background focus:border-foreground transition-colors rounded-xl px-4"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="message" className="font-semibold mb-2 block">Message</Label>
                                <Textarea
                                    id="message"
                                    {...register("message")}
                                    placeholder="Tell me your message..."
                                    rows={5}
                                    className="bg-secondary border-transparent focus:bg-background focus:border-foreground transition-colors rounded-xl p-4 resize-none"
                                />
                                {errors.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.message.message}</p>}
                            </div>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-12 rounded-full font-bold text-base"
                            >
                                {submitting ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    </BentoCard>

                    {/* Contact links */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                        {contactLinks.map(({ icon: Icon, label, value, href }, i) => (
                            <BentoCard key={label} delay={0.15 + (i * 0.05)} className="p-4 flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                                    <Icon size={20} className="text-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                                    <a 
                                        href={href} 
                                        target={href.startsWith("mailto") ? undefined : "_blank"} 
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium truncate block hover:opacity-70 transition-opacity"
                                    >
                                        {value}
                                    </a>
                                </div>
                                <MagneticButton
                                    as="button"
                                    type="button"
                                    strength={15}
                                    onClick={() => copyValue(href.startsWith("mailto:") ? value : href, label)}
                                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors"
                                    aria-label={`Copy ${label}`}
                                >
                                    {copiedLabel === label ? (
                                        <Check size={16} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={16} />
                                    )}
                                </MagneticButton>
                            </BentoCard>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}