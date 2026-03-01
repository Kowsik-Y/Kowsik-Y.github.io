"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    FolderKanban,
    Award,
    Trophy,
    Zap,
    LogOut,
    Cpu,
    ChevronRight,
    GraduationCap,
    Globe,
    Heart,
    User,
} from "lucide-react";

const LINKS = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/profile", label: "Profile", icon: User },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/certificates", label: "Certificates", icon: Award },
    { href: "/admin/achievements", label: "Achievements", icon: Trophy },
    { href: "/admin/skills", label: "Skills", icon: Zap },
    { href: "/admin/education", label: "Education", icon: GraduationCap },
    { href: "/admin/languages", label: "Languages", icon: Globe },
    { href: "/admin/hobbies", label: "Hobbies", icon: Heart },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex flex-col w-60 sticky top-0 h-screen glass border-r border-white/5 px-4 py-6">
            {/* Logo */}
            <div className="flex items-center gap-2 font-bold text-base mb-8 px-2">
                <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
                    <Cpu size={16} />
                </span>
                <span className="gradient-text">Admin</span>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-1 flex-1">
                {LINKS.map(({ href, label, icon: Icon, exact }) => {
                    const active = exact ? pathname === href : pathname.startsWith(href) && pathname !== "/admin" || pathname === href;
                    // Simpler: just check startsWith + exact combo
                    const isActive = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                ? "bg-violet-500/20 text-violet-300"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                            {isActive && <ChevronRight size={14} className="ml-auto" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign out */}
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-colors"
            >
                <LogOut size={16} />
                Sign Out
            </button>
        </aside>
    );
}
