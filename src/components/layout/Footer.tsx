import Link from "next/link";
import { Github, Linkedin, Code2, Terminal, Mail, Globe, Link as LinkIcon, type LucideIcon } from "lucide-react";

async function getProfile() {
    try {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
        const res = await fetch(`${baseUrl}/api/profile`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function Footer() {
    const profile = await getProfile();

    const socials = [
        profile?.githubUrl && { href: profile.githubUrl, label: "GitHub", icon: Github },
        profile?.linkedinUrl && { href: profile.linkedinUrl, label: "LinkedIn", icon: Linkedin },
        profile?.leetcodeUrl && { href: profile.leetcodeUrl, label: "LeetCode", icon: Code2 },
        profile?.hackerrankUrl && { href: profile.hackerrankUrl, label: "HackerRank", icon: Terminal },
        profile?.websiteUrl && { href: profile.websiteUrl, label: "Website", icon: Globe },
        profile?.email && { href: `mailto:${profile.email}`, label: "Email", icon: Mail },
        ...((profile?.customLinks ?? []).filter((cl: { label: string; url: string }) => cl.url).map((cl: { label: string; url: string }) => ({ href: cl.url, label: cl.label || cl.url, icon: LinkIcon }))),
    ].filter(Boolean) as { href: string; label: string; icon: LucideIcon }[];

    return (
        <footer className="relative mt-20">
            {/* Animated gradient top border */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent mt-px" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                        <p className="text-sm font-medium text-foreground/80">{profile?.name}</p>
                        {profile?.email && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Get in touch —{" "}
                                <a
                                    href={`mailto:${profile.email}`}
                                    className="text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    {profile.email}
                                </a>
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {socials.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="ui-icon-button p-2.5 rounded-xl hover:neon-glow-violet-sm transition-all duration-300"
                            >
                                <Icon size={16} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
