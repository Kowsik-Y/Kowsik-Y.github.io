import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";
import Navbar from "@/components/layout/Navbar";
import FadeIn from "@/components/ui/fade-in";
import HeroCanvasClient from "@/components/three/HeroCanvasClient";
import { ArrowRight, Github, Linkedin, User, Code2, Terminal, Mail, Globe } from "lucide-react";
import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";
import { blobDisplayUrl } from "@/lib/blob-url";
import ChatWidget from "@/components/layout/ChatWidget";
import Image from "next/image";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

type HomeProfile = {
  name?: string;
  title?: string;
  bio?: string;
  photoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  leetcodeUrl?: string;
  hackerrankUrl?: string;
  websiteUrl?: string;
  email?: string;
  cgpa?: string;
  semester?: string;
  interests?: string[];
  availability?: string;
};

const getProfile = cache(async (): Promise<HomeProfile | null> => {
  await dbConnect();
  const profile = await Profile.findOneAndUpdate(
    { _key: "main" },
    { $setOnInsert: { _key: "main" } },
    { upsert: true, returnDocument: "after", lean: true }
  );
  return profile as HomeProfile | null;
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();

  const displayName = profile?.name?.trim() || "Kowsik Y";
  const displayTitle = profile?.title?.trim() || "AI & ML Engineer";
  const description =
    profile?.bio?.trim() ||
    `Portfolio of ${displayName}. ${displayTitle}, full-stack developer, and AI agent builder. Explore projects, skills, and achievements.`;

  return {
    title: `${displayName} | AI, ML & Full-Stack Developer Portfolio`,
    description,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: `${displayName} - ${displayTitle}`,
      description,
      url: siteUrl,
      type: "website",
      siteName: displayName,
      images: [
        {
          url: `${siteUrl}/og-default.svg`,
          width: 1200,
          height: 630,
          alt: `${displayName} Portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} - ${displayTitle}`,
      description,
      images: [`${siteUrl}/og-default.svg`],
    },
  };
}

export default async function HomePage() {
  const profile = await getProfile();
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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden sm:mb-0 mb-10">
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
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/15 ui-surface-strong">
                    {photoSrc ? (
                      <Image
                        src={photoSrc}
                        alt={displayName as string}
                        className="w-full h-full object-cover"
                        width={112}
                        height={112}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={40} className="text-muted-foreground" />
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
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-6 ui-border">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  {profile?.availability}
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.1}>
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
                <span className="gradient-text">{displayName}</span>
              </h1>
              <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-3">
                {displayTitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                {displayBio}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {(profile?.interests?.length ? profile.interests : []).map((item) => (
                  <span
                    key={item}
                    className="ui-chip px-3 py-1 rounded-full text-xs font-medium"
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
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-foreground/80 hover:text-foreground font-medium transition-all"
                >
                  Get In Touch
                </Link>
                <div className="flex items-center gap-2">
                  {githubUrl && (
                    <Link
                      href={githubUrl}
                      target="_blank"
                      className="ui-icon-button p-3 rounded-xl"
                      aria-label="GitHub"
                    >
                      <Github size={18} />
                    </Link>
                  )}
                  {linkedinUrl && (
                    <Link
                      href={linkedinUrl}
                      target="_blank"
                      className="ui-icon-button p-3 rounded-xl"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </Link>
                  )}
                  {leetcodeUrl && (
                    <Link
                      href={leetcodeUrl}
                      target="_blank"
                      className="ui-icon-button p-3 rounded-xl"
                      aria-label="LeetCode"
                    >
                      <Code2 size={18} />
                    </Link>
                  )}
                  {hackerrankUrl && (
                    <Link
                      href={hackerrankUrl}
                      target="_blank"
                      className="ui-icon-button p-3 rounded-xl"
                      aria-label="HackerRank"
                    >
                      <Terminal size={18} />
                    </Link>
                  )}
                  {email && (
                    <Link
                      href={`mailto:${email}`}
                      className="ui-icon-button p-3 rounded-xl"
                      aria-label="Email"
                    >
                      <Mail size={18} />
                    </Link>
                  )}
                  {websiteUrl && (
                    <Link
                      href={websiteUrl}
                      target="_blank"
                      className="ui-icon-button p-3 rounded-xl"
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

        {/* ── SEO Content Section ── */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
          <FadeIn>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <h2 className="text-3xl font-bold text-foreground mb-6">Expertise in AI, Machine Learning & Full-Stack Development</h2>
              <p className="mb-4">
                As a passionate technology enthusiast, my journey bridges the gap between complex <strong>Artificial Intelligence (AI)</strong> models and intuitive <strong>Full-Stack web applications</strong>. 
                Whether it&apos;s building scalable architectures, integrating cutting-edge machine learning capabilities into software, or crafting sleek user interfaces, my portfolio reflects a dedication to modern engineering practices.
              </p>
              
              <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">Core Focus Areas</h3>
              <div className="grid sm:grid-cols-3 gap-6 my-8">
                <Link href="/ai-ml-projects" className="glass-card p-6 rounded-xl hover:ring-1 ring-violet-500/50 transition-all group block">
                  <h4 className="text-foreground font-bold mb-2 group-hover:text-violet-400 transition-colors">AI & ML Solutions</h4>
                  <p className="text-sm">Explore deep learning, predictive models, and data-driven architectures.</p>
                </Link>
                <Link href="/full-stack-projects" className="glass-card p-6 rounded-xl hover:ring-1 ring-cyan-500/50 transition-all group block">
                  <h4 className="text-foreground font-bold mb-2 group-hover:text-cyan-400 transition-colors">Full-Stack Development</h4>
                  <p className="text-sm">Discover end-to-end applications built with scalable frontend and backend technologies.</p>
                </Link>
                <Link href="/genai-projects" className="glass-card p-6 rounded-xl hover:ring-1 ring-fuchsia-500/50 transition-all group block">
                  <h4 className="text-foreground font-bold mb-2 group-hover:text-fuchsia-400 transition-colors">Generative AI</h4>
                  <p className="text-sm">See advanced agent builders, LLM integrations, and custom AI chatbots.</p>
                </Link>
              </div>

              <p className="mt-6 mb-4">
                I continuously explore the evolving landscape of <strong>Generative AI</strong> and state-of-the-art backend systems. By combining frameworks like Next.js and React with powerful Python-based ML libraries such as TensorFlow, PyTorch, and LangChain, I create solutions that are both intelligent and user-friendly. Check out my <Link href="/blogs" className="text-violet-400 hover:underline">technical blogs</Link> to learn more about my development processes and insights.
              </p>
            </div>
          </FadeIn>
        </section>

        <ChatWidget />
      </main>
    </>
  );
}
