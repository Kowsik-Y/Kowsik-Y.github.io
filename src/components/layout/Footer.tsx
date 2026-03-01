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
        <footer className="border-t border-white/5 mt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-9 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-slate-500">{profile?.name}</p>
                    {profile?.email && (
                        <p className="text-xs text-slate-600 mt-0.5">
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
                <div className="flex items-center gap-3">
                    {socials.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                        >
                            <Icon size={18} />
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}

