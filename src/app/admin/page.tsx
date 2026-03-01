import Link from "next/link";
import { FolderKanban, Award, Trophy, Zap, GraduationCap, Globe, Heart, User, Pencil } from "lucide-react";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Certificate from "@/models/Certificate";
import Achievement from "@/models/Achievement";
import Skill from "@/models/Skill";
import Education from "@/models/Education";
import Language from "@/models/Language";
import Hobby from "@/models/Hobby";
import Profile from "@/models/Profile";
import { blobDisplayUrl } from "@/lib/blob-url";

async function getCounts() {
    await dbConnect();
    const [projects, certs, achievements, skills, education, languages, hobbies, profile] = await Promise.all([
        Project.countDocuments(),
        Certificate.countDocuments(),
        Achievement.countDocuments(),
        Skill.countDocuments(),
        Education.countDocuments(),
        Language.countDocuments(),
        Hobby.countDocuments(),
        Profile.findOneAndUpdate(
            { _key: "main" },
            { $setOnInsert: { _key: "main" } },
            { upsert: true, returnDocument: "after", lean: true }
        ),
    ]);
    return { projects, certs, achievements, skills, education, languages, hobbies, profile: profile as { name?: string; title?: string; bio?: string; photoUrl?: string } | null };
}

export default async function AdminDashboard() {
    const counts = await getCounts();

    const CARDS = [
        { label: "Projects", value: counts.projects, icon: FolderKanban, href: "/admin/projects", color: "text-violet-400 bg-violet-500/15" },
        { label: "Certificates", value: counts.certs, icon: Award, href: "/admin/certificates", color: "text-cyan-400 bg-cyan-500/15" },
        { label: "Achievements", value: counts.achievements, icon: Trophy, href: "/admin/achievements", color: "text-amber-400 bg-amber-500/15" },
        { label: "Skills", value: counts.skills, icon: Zap, href: "/admin/skills", color: "text-pink-400 bg-pink-500/15" },
        { label: "Education", value: counts.education, icon: GraduationCap, href: "/admin/education", color: "text-emerald-400 bg-emerald-500/15" },
        { label: "Languages", value: counts.languages, icon: Globe, href: "/admin/languages", color: "text-sky-400 bg-sky-500/15" },
        { label: "Hobbies", value: counts.hobbies, icon: Heart, href: "/admin/hobbies", color: "text-rose-400 bg-rose-500/15" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-slate-500 text-sm mb-8">Overview of your portfolio content.</p>

            {/* Profile quick-edit card */}
            <div className="glass-card p-5 mb-8 flex items-center gap-5">
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-violet-500/30 shrink-0 bg-white/5">
                    {counts.profile?.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={blobDisplayUrl(counts.profile.photoUrl)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    )}
                    {!counts.profile?.photoUrl && (
                        <div className="w-full h-full flex items-center justify-center">
                            <User size={24} className="text-slate-500" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{counts.profile?.name || "Kowsik Y"}</p>
                    <p className="text-sm text-violet-300 truncate">{counts.profile?.title || "AI & ML Engineer"}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{counts.profile?.bio || "No bio set"}</p>
                </div>
                <Link
                    href="/admin/profile"
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                >
                    <Pencil size={14} />
                    Edit Profile
                </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                {CARDS.slice(0, 4).map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass-card p-6">
                        <div className={`inline-flex p-2.5 rounded-xl mb-4 ${color}`}>
                            <Icon size={20} />
                        </div>
                        <p className="text-3xl font-bold text-white">{value}</p>
                        <p className="text-sm text-slate-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
                {CARDS.slice(4).map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass-card p-6">
                        <div className={`inline-flex p-2.5 rounded-xl mb-4 ${color}`}>
                            <Icon size={20} />
                        </div>
                        <p className="text-3xl font-bold text-white">{value}</p>
                        <p className="text-sm text-slate-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 glass-card p-6">
                <p className="text-sm text-slate-500">
                    Welcome to your portfolio CMS. Use the sidebar to manage projects, certifications,
                    achievements, skills, education, languages, and hobbies. Changes are reflected on the public site immediately.
                </p>
            </div>
        </div>
    );
}
