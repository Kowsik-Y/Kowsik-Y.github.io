"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/blogs", label: "Blogs" },
    { href: "/certifications", label: "Certifications" },
    { href: "/achievements", label: "Achievements" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 inset-x-0 z-50">
            <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="border border-[#ffffff14] shadow-none bg-background/15 backdrop-blur supports-backdrop-filter:bg-background/60 mt-3 rounded-2xl px-5 py-3 flex items-center justify-end sm:justify-center">

                    {/* Desktop links */}
                    <ul className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ href, label }) => {
                            const active = pathname === href;
                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active
                                            ? "bg-violet-500/20 text-violet-300"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden text-slate-400 hover:text-white"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="border border-[#ffffff14] shadow-none bg-background/15 backdrop-blur supports-backdrop-filter:bg-background/60 mt-2 rounded-2xl px-5 py-4 md:hidden">
                        <ul className="flex flex-col gap-1">
                            {NAV_LINKS.map(({ href, label }) => {
                                const active = pathname === href;
                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            onClick={() => setOpen(false)}
                                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                                                ? "bg-violet-500/20 text-violet-300"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
}
