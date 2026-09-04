import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";
import Navbar from "@/components/layout/Navbar";
import FadeIn from "@/components/ui/fade-in";
import { ArrowUpRight, Github, Linkedin, User, Code2, Terminal, Mail, Phone, Globe, MapPin } from "lucide-react";
import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";
import { blobDisplayUrl } from "@/lib/blob-url";
import ChatWidget from "@/components/layout/ChatWidget";
import BentoCard from "@/components/ui/BentoCard";
import MagneticButton from "@/components/ui/MagneticButton";
import ImageReveal from "@/components/ui/ImageReveal";
import AITypewriter from "@/components/ui/AITypewriter";

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
  phone?: string;
  cgpa?: string;
  semester?: string;
  interests?: string[];
  availability?: string;
  location?: string;
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
    `Portfolio of ${displayName} (Kowsiky). ${displayTitle}, full-stack developer, and AI agent builder. Explore projects, skills, and achievements.`;

  return {
    title: {
      absolute: `${displayName}`,
    },
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
  };
}

export default async function HomePage() {
  const profile = await getProfile();
  const photoSrc = profile?.photoUrl ? blobDisplayUrl(profile.photoUrl) : null;

  return (
    <>
      <main className="min-h-screen pt-32 pb-20 gen-ai-bg relative overflow-hidden">
        <div className="scanner-line" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Main Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(180px,auto)] gap-4 sm:gap-6">

            {/* 1. Intro Card (Spans 8 columns) */}
            <BentoCard className="md:col-span-8 p-8 sm:p-12 flex flex-col justify-between" delay={0.1}>
                <div className="mb-4">
                  <AITypewriter />
                </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <MagneticButton
                  href="/projects"
                  className="bg-foreground text-background px-6 py-3 rounded-full font-medium hover:scale-95 transition-transform"
                >
                  View My Work
                </MagneticButton>
                <MagneticButton
                  href="/contact"
                  className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-medium hover:scale-95 transition-transform"
                >
                  Contact Me
                </MagneticButton>
              </div>
            </BentoCard>

            {/* 2. Photo Card (Spans 4 columns) */}
            <BentoCard className="md:col-span-4 p-2 sm:p-3" delay={0.15}>
              {photoSrc ? (
                <ImageReveal
                  src={photoSrc}
                  alt={profile?.name ? `Profile photo of ${profile.name}, ${profile.title || 'Developer'}` : "Profile portrait"}
                  ariaDescription="A professional portrait photo of the portfolio owner, positioned prominently on the home page."
                  aspectRatio="portrait"
                  className="w-full h-full"
                  containerClassName="w-full h-full rounded-[calc(var(--radius-3xl)-0.75rem)]"
                />
              ) : (
                <div className="w-full h-full min-h-[300px] bg-secondary rounded-[calc(var(--radius-3xl)-0.75rem)] flex items-center justify-center">
                  <User size={64} className="text-muted-foreground/30" />
                </div>
              )}
            </BentoCard>

            {/* 3. Bio Card (Spans 6 columns) */}
            <BentoCard className="md:col-span-6 p-8" delay={0.2}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">About</h2>
              <p className="text-lg leading-relaxed font-medium">
                {profile?.bio || "Passionate about building intelligent systems — from neural networks to production-ready full-stack apps."}
              </p>
              <Link href="/about" className="inline-flex items-center gap-1 mt-6 text-sm font-bold hover:opacity-70 transition-opacity">
                Read full bio <ArrowUpRight size={16} />
              </Link>
            </BentoCard>

            {/* 4. Interests / Stack (Spans 6 columns) */}
            <BentoCard className="md:col-span-6 p-8 bg-foreground text-foreground" delay={0.25}>
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-6">Expertise</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {(profile?.interests?.length ? profile.interests : ["Deep Learning", "Next.js", "React", "Python", "Generative AI", "TypeScript"]).map((item) => (
                  <span key={item} className="px-4 py-2 rounded-full text-sm font-medium border border-border bg-background">
                    {item}
                  </span>
                ))}
              </div>
              <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-bold text-background/90 hover:text-background transition-colors">
                See projects <ArrowUpRight size={16} />
              </Link>
            </BentoCard>

            {/* 5. Social Links row (Spans 12 columns, grid inside) */}
            <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
              {[
                { label: "GitHub", url: profile?.githubUrl, icon: Github },
                { label: "LinkedIn", url: profile?.linkedinUrl, icon: Linkedin },
                { label: "LeetCode", url: profile?.leetcodeUrl, icon: Code2 },
                { label: "Mail", url: profile?.email ? `mailto:${profile.email}` : undefined, icon: Mail },
                { label: "Phone", url: profile?.phone ? `tel:${profile.phone}` : undefined, icon: Phone },
              ].map((social, i) => social.url ? (
                <BentoCard key={social.label} interactive delay={0.3 + (i * 0.05)} className="p-6 flex flex-col items-center justify-center text-center group">
                  <a href={social.url} target={social.label === "Mail" || social.label === "Phone" ? undefined : "_blank"} rel="noopener noreferrer" className="absolute inset-0 z-10">
                    <span className="sr-only">{social.label}</span>
                  </a>
                  <MagneticButton strength={20} className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground mb-3 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                    <social.icon size={20} />
                  </MagneticButton>
                  <span className="font-semibold text-sm">{social.label}</span>
                </BentoCard>
              ) : null)}
            </div>

          </div>
        </div>

        <ChatWidget />
      </main>
    </>
  );
}