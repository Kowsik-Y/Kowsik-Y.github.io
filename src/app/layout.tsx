import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kowsik Y — AI & ML Engineer",
    template: "%s | Kowsik Y",
  },
  description:
    "Portfolio of Kowsik Y — Artificial Intelligence & Machine Learning student, full-stack developer, and AI agent builder.",
  keywords: ["AI", "Machine Learning", "React", "Next.js", "portfolio", "Kowsik"],
  authors: [{ name: "Kowsik Y" }],
  openGraph: {
    title: "Kowsik Y — AI & ML Engineer",
    description: "Portfolio of Kowsik Y — AI/ML student & full-stack developer.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kowsik Y — AI & ML Engineer",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
