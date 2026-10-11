import type { Metadata } from "next";
import { cache } from "react";
import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";
import ResumeViewerClient from "@/components/portfolio/ResumeViewerClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

type ProfileData = {
  name?: string;
  title?: string;
  bio?: string;
  email?: string;
  resumeUrl?: string;
};

const getProfile = cache(async (): Promise<ProfileData | null> => {
  try {
    await dbConnect();
    const profile = await Profile.findOne({ _key: "main" }).lean();
    return profile as ProfileData | null;
  } catch {
    return null;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const displayName = profile?.name?.trim() || "Kowsik Y";
  const displayTitle = profile?.title?.trim() || "AI & ML Engineer";
  const title = `Resume | ${displayName} - ${displayTitle}`;
  const description = `View and download the verified resume and curriculum vitae of ${displayName}, specializing in AI & Machine Learning, Generative AI, and Full-Stack Engineering.`;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `${siteUrl}/resume`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/resume`,
      type: "profile",
      siteName: displayName,
      images: [
        {
          url: `${siteUrl}/og-default.svg`,
          width: 1200,
          height: 630,
          alt: `${displayName} Resume Preview`,
        },
      ],
    },
  };
}

export default async function ResumePage() {
  const profile = await getProfile();
  const resumeUrl = profile?.resumeUrl || "/resume.pdf";
  const name = profile?.name?.trim() || "Kowsik Y";
  const title = profile?.title?.trim() || "AI & ML Engineer • Full-Stack Developer";

  return (
    <ResumeViewerClient
      resumeUrl={resumeUrl}
      name={name}
      title={title}
      email={profile?.email}
    />
  );
}
