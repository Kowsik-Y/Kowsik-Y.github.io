import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FadeIn from "@/components/ui/fade-in";
import HeroCanvasClient from "@/components/three/HeroCanvasClient";
import { ArrowRight, Github, Linkedin, User, Code2, Terminal, Mail, Globe } from "lucide-react";
import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";
import { blobDisplayUrl } from "@/lib/blob-url";
import ChatWidget from "@/components/layout/ChatWidget";

async function getPageData() {
  await dbConnect();
  const [profile] = await Promise.all([
    Profile.findOneAndUpdate(
      { _key: "main" },
      { $setOnInsert: { _key: "main" } },
      { upsert: true, returnDocument: "after", lean: true }
    )
  ]);
  return {
    profile: profile as { name?: string; title?: string; bio?: string; photoUrl?: string; githubUrl?: string; linkedinUrl?: string; leetcodeUrl?: string; hackerrankUrl?: string; websiteUrl?: string; email?: string; cgpa?: string; semester?: string; interests?: string[]; availability?: string } | null
  };
}

export default async function HomePage() {
  const { profile } = await getPageData();
  const photoSrc = profile?.photoUrl ? blobDisplayUrl(profile.photoUrl) : null;
  const displayName = profile?.name;
  const displayTitle = profile?.title;
  const displayBio = profile?.bio;
  const githubUrl = profile?.githubUrl;
  const linkedinUrl = profile?.linkedinUrl;
  const leetcodeUrl = profile?.leetcodeUrl;
  const hackerrankUrl = profile?.hackerrankUrl;
  const websiteUrl = profile?.websiteUrl;
  const email = profile?.email;



  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <HeroCanvasClient />

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
            <FadeIn delay={0}>
              <div className="mb-6 flex justify-center">
                {/* Mosaic boxes hero photo */}
                <div className="relative w-28 h-28">
                  {/* Floating accent boxes */}
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-lg bg-violet-500/30 rotate-12 border border-violet-400/40" />
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-lg bg-cyan-500/25 -rotate-12 border border-cyan-400/35" />
                  <div className="absolute top-0 -right-3 w-4 h-4 rounded-md bg-violet-400/30 rotate-45 border border-violet-300/40" />
                  {/* Main square frame */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/20 bg-slate-900 border border-violet-500/30">
                    {photoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoSrc}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={40} className="text-slate-500" />
                      </div>
                    )}
                    {/* Grid overlay — boxes */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
                        backgroundSize: "18px 18px",
                      }}
                    />
                    <div className="absolute inset-0 bg-linear-to-br from-violet-500/15 via-transparent to-cyan-500/15 pointer-events-none" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-violet-400/30 pointer-events-none" />
                </div>
              </div>
            </FadeIn>

            {(profile?.availability) && (
              <FadeIn delay={0.05}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-slate-400 mb-6 border border-violet-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  {profile?.availability}
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.1}>
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
                <span className="gradient-text">{displayName}</span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-300 font-medium mb-3">
                {displayTitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
                {displayBio}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {(profile?.interests?.length ? profile.interests : []).map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-violet-500/25 text-violet-300 bg-violet-500/10"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/projects"
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all glow-violet"
                >
                  View My Work
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-slate-300 hover:text-white font-medium transition-all"
                >
                  Get In Touch
                </Link>
                <div className="flex items-center gap-2">
                  {githubUrl && (
                    <Link
                      href={githubUrl}
                      target="_blank"
                      className="p-3 rounded-xl glass text-slate-400 hover:text-violet-400 transition-colors"
                      aria-label="GitHub"
                    >
                      <Github size={18} />
                    </Link>
                  )}
                  {linkedinUrl && (
                    <Link
                      href={linkedinUrl}
                      target="_blank"
                      className="p-3 rounded-xl glass text-slate-400 hover:text-cyan-400 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </Link>
                  )}
                  {leetcodeUrl && (
                    <Link
                      href={leetcodeUrl}
                      target="_blank"
                      className="p-3 rounded-xl glass text-slate-400 hover:text-yellow-400 transition-colors"
                      aria-label="LeetCode"
                    >
                      <Code2 size={18} />
                    </Link>
                  )}
                  {hackerrankUrl && (
                    <Link
                      href={hackerrankUrl}
                      target="_blank"
                      className="p-3 rounded-xl glass text-slate-400 hover:text-emerald-400 transition-colors"
                      aria-label="HackerRank"
                    >
                      <Terminal size={18} />
                    </Link>
                  )}
                  {email && (
                    <Link
                      href={`mailto:${email}`}
                      className="p-3 rounded-xl glass text-slate-400 hover:text-rose-400 transition-colors"
                      aria-label="Email"
                    >
                      <Mail size={18} />
                    </Link>
                  )}
                  {websiteUrl && (
                    <Link
                      href={websiteUrl}
                      target="_blank"
                      className="p-3 rounded-xl glass text-slate-400 hover:text-violet-400 transition-colors"
                      aria-label="Website"
                    >
                      <Globe size={18} />
                    </Link>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
        <ChatWidget />
      </main>
    </>
  );
}
