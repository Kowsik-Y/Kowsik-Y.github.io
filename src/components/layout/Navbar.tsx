"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useClientTheme } from "@/lib/theme-client";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/blogs", label: "Blogs" },
    { href: "/certifications", label: "Certifications" },
    { href: "/achievements", label: "Achievements" },
    { href: "/contact", label: "Contact" },
];

function NavLink({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`px-3 py-2 md:py-1.5 rounded-lg text-sm font-medium flex-1 flex w-full transition-colors ${active
                ? "ui-chip text-violet-700 dark:text-violet-300"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-foreground/5"
                }`}
        >
            {label}
        </Link>
    );
}

function ThemeToggle({ onToggle }: { onToggle?: () => void }) {
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    const { theme, setTheme } = useClientTheme();
    const isDark = theme === "dark";

    if (!mounted) return <button type="button" className="ui-icon-button rounded-lg p-2 opacity-0" aria-hidden="true"><Sun size={16} /></button>;
    return (
        <button
            type="button"

            onClick={(e) => {
                setTheme(isDark ? "light" : "dark", e);
                onToggle?.();
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="ui-icon-button rounded-lg p-2"
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 inset-x-0 z-20">
            <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="ui-surface shadow-lg shadow-black/5 dark:shadow-none backdrop-blur supports-backdrop-filter:bg-background/60 mt-3 rounded-2xl px-5 py-3 flex items-center justify-end sm:justify-center">

                    {/* Desktop links */}
                    <ul className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ href, label }) => {
                            const active = pathname === href;
                            return (
                                <li key={href}>
                                    <NavLink
                                        href={href}
                                        label={label}
                                        active={active}

                                    />
                                </li>
                            );
                        })}
                    </ul>

                    <div className="hidden md:block ml-3">
                        <ThemeToggle />
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden ui-icon-button rounded-lg h-9 w-9 flex items-center justify-center relative overflow-hidden"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        <div className={`absolute transition-all duration-300 ease-out transform ${open ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}>
                            <Menu size={18} />
                        </div>
                        <div className={`absolute transition-all duration-300 ease-out transform ${open ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}>
                            <X size={18} />
                        </div>
                    </button>
                </div>

                {/* Mobile menu */}
                <div
                    className={`md:hidden grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                        }`}
                >
                    <div className="overflow-hidden">
                        <div className="ui-surface shadow-lg shadow-black/5 dark:shadow-none backdrop-blur supports-backdrop-filter:bg-background/60 rounded-2xl px-4 py-4 flex flex-col gap-1">
                            <ul className="flex flex-col gap-1">
                                {NAV_LINKS.map(({ href, label }) => {
                                    const active = pathname === href;
                                    return (
                                        <li key={href}>
                                            <NavLink
                                                href={href}
                                                label={label}
                                                active={active}
                                                onClick={() => setOpen(false)}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="pt-3 mt-2 border-t border-border flex items-center justify-between px-3">
                                <span className="text-sm font-medium text-muted-foreground">Theme Preference</span>
                                <ThemeToggle onToggle={() => setOpen(false)} />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
