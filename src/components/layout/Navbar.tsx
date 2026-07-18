"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useClientTheme } from "@/lib/theme-client";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/blogs", label: "Blogs" },
];

const MORE_LINKS = [
    { href: "/certifications", label: "Certifications" },
    { href: "/achievements", label: "Achievements" },
    { href: "/contact", label: "Contact" },
];


function ThemeToggle({ onToggle }: { onToggle?: () => void }) {
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    const { theme, setTheme } = useClientTheme();
    const isDark = theme === "dark";

    if (!mounted) return <button type="button" className="ui-icon-button" aria-hidden="true"><Sun size={14} /></button>;
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
                setTheme(isDark ? "light" : "dark", e);
                onToggle?.();
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background transition-colors"
        >
            <AnimatePresence mode="wait">
                {isDark ? (
                    <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Sun size={14} />
                    </motion.span>
                ) : (
                    <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Moon size={14} />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navRefs = useRef<(HTMLLIElement | null)[]>([]);
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY > 20);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        // Calculate pill position whenever pathname changes to bypass layoutId scroll bugs completely
        const activeIndex = [...NAV_LINKS, ...MORE_LINKS].findIndex(link => link.href === pathname);
        if (activeIndex !== -1 && navRefs.current[activeIndex]) {
            const el = navRefs.current[activeIndex];
            if (el) {
                setPillStyle({
                    left: el.offsetLeft,
                    width: el.offsetWidth,
                    opacity: 1
                });
            }
        } else {
            setPillStyle(prev => ({ ...prev, opacity: 0 }));
        }
    }, [pathname]);

    return (
        <motion.header layoutRoot className="fixed top-0 inset-x-0 z-50 flex justify-center mt-6 px-4 pointer-events-none">
            <nav className="pointer-events-auto">
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex items-center p-1.5 rounded-full transition-all duration-500 shadow-soft ${
                    scrolled
                        ? "glass-nav"
                        : "bg-background/80 border border-border"
                }`}>
                    
                    {/* Desktop links */}
                    <ul className="hidden md:flex items-center relative z-10">
                        {pillStyle.opacity > 0 && (
                            <motion.div
                                className="absolute top-0 bottom-0 bg-foreground rounded-full z-0"
                                initial={false}
                                animate={{
                                    left: pillStyle.left,
                                    width: pillStyle.width,
                                    opacity: pillStyle.opacity
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        {[...NAV_LINKS, ...MORE_LINKS].map(({ href, label }, i) => {
                            const active = pathname === href;
                            return (
                                <li 
                                    key={href} 
                                    className="relative z-10 flex"
                                    ref={el => { navRefs.current[i] = el; }}
                                >
                                    <Link
                                        href={href}
                                        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${active
                                            ? "text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <span className="relative z-10">{label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="hidden md:block ml-2 mr-1">
                        <ThemeToggle />
                    </div>

                    {/* Mobile toggle */}
                    <div className="md:hidden flex items-center gap-2 px-2">
                        <span className="text-sm font-medium ml-2">Menu</span>
                        <button
                            className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center relative overflow-hidden"
                            onClick={() => setOpen(!open)}
                            aria-label="Toggle menu"
                        >
                            <div className={`absolute transition-all duration-300 ease-out transform ${open ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}>
                                <Menu size={14} />
                            </div>
                            <div className={`absolute transition-all duration-300 ease-out transform ${open ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}>
                                <X size={14} />
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* Mobile menu dropdown */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 10, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
                            className="md:hidden absolute top-full left-0 right-0 mt-4 pointer-events-auto"
                        >
                            <div className="glass-nav rounded-3xl p-4 flex flex-col gap-2 shadow-soft">
                                <ul className="flex flex-col">
                                    {[...NAV_LINKS, ...MORE_LINKS].map(({ href, label }) => {
                                        const active = pathname === href;
                                        return (
                                            <li key={href}>
                                                <Link
                                                    href={href}
                                                    onClick={() => setOpen(false)}
                                                    className={`block px-4 py-3 rounded-2xl text-base font-medium transition-colors ${
                                                        active 
                                                            ? "bg-foreground text-background" 
                                                            : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                                    }`}
                                                >
                                                    {label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <div className="pt-4 mt-2 border-t border-border flex items-center justify-between px-2">
                                    <span className="text-sm font-medium">Appearance</span>
                                    <ThemeToggle onToggle={() => setOpen(false)} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </motion.header>
    );
}
