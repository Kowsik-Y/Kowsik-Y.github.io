"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ExternalLink, Award } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import CertsCanvasClient from "@/components/three/CertsCanvasClient";
import { blobDisplayUrl } from "@/lib/blob-url";
import type { ICertificate } from "@/types";
import CertDialog from "@/components/ui/certDialog";
import { usePortfolioStore } from "@/lib/stores/portfolioStore";

export default function CertificationsPage() {
    const certs = usePortfolioStore((s) => s.certificates);
    const isLoading = usePortfolioStore((s) => s.loading);
    const hydrated = usePortfolioStore((s) => s.hydrated);
    const fetchOverview = usePortfolioStore((s) => s.fetchOverview);
    const [selected, setSelected] = useState<ICertificate | null>(null);

    useEffect(() => {
        if (!hydrated) {
            void fetchOverview();
        }
    }, [fetchOverview, hydrated]);

    return (
        <div className="relative">
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <CertsCanvasClient />
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
                <FadeIn>
                    <div className="mb-2 text-sm font-medium text-violet-400 uppercase tracking-widest">Credentials</div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">Certifications</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mb-14">Verified credentials and training programs I&apos;ve completed.</p>
                </FadeIn>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (<div key={i} className="glass-card p-6 h-24 animate-pulse" />))}
                    </div>
                ) : certs.length > 0 ? (
                    <div className="space-y-4">
                        {certs.map((cert, i) => (
                            <FadeIn key={String(cert._id)} delay={i * 0.07}>
                                <button
                                    onClick={() => setSelected(cert)}
                                    className="w-full text-left glass-card flex flex-col sm:flex-row overflow-hidden hover:ring-2 hover:ring-violet-500/30 transition-all cursor-pointer group"
                                >
                                    {cert.imageUrl && (
                                        <div className="relative w-full sm:w-32 h-32 sm:h-auto shrink-0">
                                            <Image src={blobDisplayUrl(cert.imageUrl)} alt={cert.name} fill className="object-cover" unoptimized />
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-lg bg-violet-500/15 text-violet-400 shrink-0">
                                                <Award size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors">{cert.name}</h3>
                                                <p className="text-sm text-slate-400">{cert.issuer}</p>
                                                {cert.date && <p className="text-xs text-slate-600 mt-0.5">{cert.date}</p>}
                                            </div>
                                        </div>
                                        <span className="shrink-0 flex items-center gap-1.5 text-xs text-violet-400 border border-violet-500/25 px-3 py-1.5 rounded-lg group-hover:bg-violet-500/10 transition-colors">
                                            <ExternalLink size={13} /> View Details
                                        </span>
                                    </div>
                                </button>
                            </FadeIn>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center text-slate-500">No certifications added yet.</div>
                )}
            </div>

            {selected && <CertDialog cert={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
