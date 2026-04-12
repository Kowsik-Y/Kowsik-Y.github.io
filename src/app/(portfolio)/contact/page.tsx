"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send, Mail, Github, Linkedin, Code2, Terminal, Copy, type LucideIcon } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ContactCanvasClient from "@/components/three/ContactCanvasClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sectionBreadcrumbs } from "@/lib/breadcrumbs";
import type { IProfile } from "@/types";
import { usePortfolioStore } from "@/lib/stores/portfolioStore";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
    const [submitting, setSubmitting] = useState(false);
    const profile = (usePortfolioStore((s) => s.profile) ?? {}) as Partial<IProfile>;
    const hydrated = usePortfolioStore((s) => s.hydrated);
    const fetchOverview = usePortfolioStore((s) => s.fetchOverview);

    useEffect(() => {
        if (!hydrated) {
            void fetchOverview();
        }
    }, [fetchOverview, hydrated]);

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

    // Build contact links dynamically from profile
    const contactLinks = [
        profile.email && {
            icon: Mail,
            label: "Email",
            value: profile.email,
            href: `mailto:${profile.email}`,
        },
        profile.githubUrl && {
            icon: Github,
            label: "GitHub",
            value: `@${profile.githubUrl.replace(/\/$/, "").split("/").pop()}`,
            href: profile.githubUrl,
        },
        profile.linkedinUrl && {
            icon: Linkedin,
            label: "LinkedIn",
            value: `@${profile.linkedinUrl.replace(/\/$/, "").split("/").pop()}`,
            href: profile.linkedinUrl,
        },
        profile.leetcodeUrl && {
            icon: Code2,
            label: "LeetCode",
            value: `@${profile.leetcodeUrl.replace(/\/$/, "").split("/").pop()}`,
            href: profile.leetcodeUrl,
        },
        profile.hackerrankUrl && {
            icon: Terminal,
            label: "HackerRank",
            value: `@${profile.hackerrankUrl.replace(/\/$/, "").split("/").pop()}`,
            href: profile.hackerrankUrl,
        },
    ].filter(Boolean) as { icon: LucideIcon; label: string; value: string; href: string }[];

    const copyValue = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error("Clipboard access failed");
        }
    };

    return (
        <div className="relative">
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <ContactCanvasClient />
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
                <Breadcrumbs
                    className="mb-6"
                    items={sectionBreadcrumbs("Contact", "/contact")}
                />
                <FadeIn>
                    <div className="mb-2 text-sm font-medium text-violet-400 uppercase tracking-widest">
                        Get In Touch
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        Let&apos;s <span className="gradient-text">Connect</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mb-14">
                        I&apos;m always open to new opportunities, collaborations, or just a chat about AI
                        and technology.
                    </p>
                </FadeIn>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* Form */}
                    <FadeIn delay={0.1}>
                        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 space-y-5">
                            <div>
                                <Label htmlFor="name" className="text-foreground/80 mb-1.5 block">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="Your name"
                                    className="ui-surface text-foreground placeholder:text-muted-foreground focus:border-primary"
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-foreground/80 mb-1.5 block">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="you@example.com"
                                    className="ui-surface text-foreground placeholder:text-muted-foreground focus:border-primary"
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="message" className="text-foreground/80 mb-1.5 block">
                                    Message
                                </Label>
                                <Textarea
                                    id="message"
                                    {...register("message")}
                                    placeholder="Tell me your message..."
                                    rows={5}
                                    className="ui-surface text-foreground placeholder:text-muted-foreground focus:border-primary resize-none"
                                />
                                {errors.message && (
                                    <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Send size={15} className="mr-2" />
                                {submitting ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    </FadeIn>

                    {/* Contact links */}
                    <FadeIn delay={0.2}>
                        <div className="space-y-4">
                            {contactLinks.map(({ icon: Icon, label, value, href }) => (
                                <div key={label} className="flex items-center gap-3 glass-card p-5">
                                    <a
                                        href={href}
                                        target={href.startsWith("mailto") ? undefined : "_blank"}
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 min-w-0 flex-1"
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                            <Icon size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">{label}</p>
                                            <p className="text-sm text-foreground font-medium truncate">{value}</p>
                                        </div>
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => copyValue(href.startsWith("mailto:") ? value : href, label)}
                                        className="ui-icon-button shrink-0 rounded-md p-2"
                                        aria-label={`Copy ${label}`}
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
