import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">404 — Page Not Found</h1>
      <p className="text-xl text-muted-foreground mb-2 leading-relaxed">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <p className="text-base text-muted-foreground mb-8 leading-relaxed">If you followed a link here, it may be outdated.</p>
      <Link href="/" className="text-foreground font-bold hover:opacity-70 inline-flex items-center gap-2">
        <ArrowLeft size={16} />Return Home
      </Link>
    </div>
  );
}
