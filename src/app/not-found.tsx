import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">404 - Not Found</h2>
      <p className="text-xl text-muted-foreground mb-6 leading-relaxed">Could not find requested resource</p>
      <Link href="/" className="text-foreground font-bold hover:opacity-70 inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Return Home
      </Link>
    </div>
  );
}
