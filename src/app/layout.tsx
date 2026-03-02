import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.dev";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kowsik Y — AI & ML Engineer",
    template: "%s | Kowsik Y",
  },
  description:
    "Portfolio of Kowsik Y — Artificial Intelligence & Machine Learning student, full-stack developer, and AI agent builder.",
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
  authors: [{ name: "Kowsik Y", url: siteUrl }],
  creator: "Kowsik Y",
  publisher: "Kowsik Y",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Kowsik Y — AI & ML Engineer",
    description:
      "Portfolio of Kowsik Y — AI/ML student & full-stack developer.",
    url: siteUrl,
    siteName: "Kowsik Y",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kowsik Y — AI & ML Engineer",
    description:
      "Portfolio of Kowsik Y — AI/ML student & full-stack developer.",
    creator: "@kowsiky",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kowsik Y",
  url: siteUrl,
  sameAs: [
    "https://github.com/kowsik",
    "https://linkedin.com/in/kowsik",
  ],
  jobTitle: "AI & ML Engineer",
  description:
    "Artificial Intelligence & Machine Learning student, full-stack developer, and AI agent builder.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
