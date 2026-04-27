import type { Metadata, Viewport } from "next";
import { cache } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeToaster from "@/components/theme-toaster";
import NextTopLoader from 'nextjs-toploader';
import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type SiteProfile = {
  name?: string;
  title?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  email?: string;
};

const getSiteProfile = cache(async (): Promise<SiteProfile | null> => {
  await dbConnect();
  const profile = await Profile.findOneAndUpdate(
    { _key: "main" },
    { $setOnInsert: { _key: "main" } },
    { upsert: true, returnDocument: "after", lean: true }
  );
  return profile as SiteProfile | null;
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getSiteProfile();
  const displayName = profile?.name?.trim() || "Kowsik Y";
  const displayTitle = profile?.title?.trim() || "AI, ML & Full-Stack Portfolio";
  const description =
    profile?.bio?.trim() ||
    "Portfolio of Kowsik Y — Artificial Intelligence & Machine Learning student, full-stack developer, and AI agent builder.";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${displayName} — ${displayTitle}`,
      template: `%s | ${displayName}`,
    },
    description,
    keywords: [
      "AI",
      "Machine Learning",
      "Deep Learning",
      "React",
      "Next.js",
      "Python",
      "portfolio",
      "Kowsik",
      "full-stack developer",
      "AI agent",
    ],
    authors: [{ name: displayName, url: siteUrl }],
    creator: displayName,
    publisher: displayName,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: `${displayName} — ${displayTitle}`,
      description,
      url: siteUrl,
      siteName: displayName,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: `${siteUrl}/og-default.svg`,
          width: 1200,
          height: 630,
          alt: `${displayName} Portfolio`,
        },
      ],
      emails: profile?.email ? [profile.email] : undefined,
    },
    other: {
      "og:logo": `${siteUrl}/og-default.svg`
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} — ${displayTitle}`,
      description,
      creator: "@kowsiky",
      images: [`${siteUrl}/og-default.svg`],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

function createPersonJsonLd(profile: SiteProfile | null) {
  const displayName = profile?.name?.trim() || "Kowsik Y";
  const displayTitle = profile?.title?.trim() || "AI & ML Engineer";
  const displayDescription =
    profile?.bio?.trim() ||
    "Artificial Intelligence & Machine Learning student, full-stack developer, and AI agent builder.";

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    url: siteUrl,
    sameAs: [profile?.githubUrl, profile?.linkedinUrl].filter(Boolean),
    jobTitle: displayTitle,
    description: displayDescription,
    knowsAbout: [
      "Artificial Intelligence",
      "Machine Learning",
      "Deep Learning",
      "React",
      "Next.js",
      "Python",
      "Full-Stack Development",
    ],
  };
}

function createWebsiteJsonLd(profile: SiteProfile | null) {
  const displayName = profile?.name?.trim() || "Kowsik Y";
  const displayTitle = profile?.title?.trim() || "AI, ML & Full-Stack Portfolio";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${displayName} — ${displayTitle}`,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/projects?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function createNavigationJsonLd(profile: SiteProfile | null) {
  const displayName = profile?.name?.trim() || "Kowsik Y";

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      { "@type": "SiteNavigationElement", position: 1, name: "About", description: `Learn about ${displayName} — AI & ML engineering student, full-stack developer, and AI agent builder. Explore skills, education, and experience.`, url: `${siteUrl}/about` },
      { "@type": "SiteNavigationElement", position: 2, name: "Projects", description: `Explore projects built by ${displayName} — from AI-powered apps to full-stack platforms and intelligent systems.`, url: `${siteUrl}/projects` },
      { "@type": "SiteNavigationElement", position: 3, name: "Blogs", description: `Read technical articles, tutorials, and insights on AI, Machine Learning, and web development written by ${displayName}.`, url: `${siteUrl}/blogs` },
      { "@type": "SiteNavigationElement", position: 4, name: "Certifications", description: `View ${displayName}'s professional certifications in AI, Machine Learning, and software engineering.`, url: `${siteUrl}/certifications` },
      { "@type": "SiteNavigationElement", position: 5, name: "Achievements", description: `Review highlights, awards, and milestones from ${displayName}'s journey in tech and development.`, url: `${siteUrl}/achievements` },
      { "@type": "SiteNavigationElement", position: 6, name: "Contact", description: `Get in touch with ${displayName} for collaborations, projects, or professional inquiries.`, url: `${siteUrl}/contact` },
    ],
    name: `${displayName} Navigation`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getSiteProfile();
  const personJsonLd = createPersonJsonLd(profile);
  const websiteJsonLd = createWebsiteJsonLd(profile);
  const navigationJsonLd = createNavigationJsonLd(profile);

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color="#8b5cf6" height={3} showSpinner={false} shadow="0 0 10px #8b5cf6,0 0 5px #8b5cf6" />
        {children}
        <ThemeToaster />
      </body>
    </html>
  );
}
