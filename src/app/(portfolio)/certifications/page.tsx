"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Award } from "lucide-react";
import { blobDisplayUrl } from "@/lib/blob-url";
import type { ICertificate } from "@/types";
import CertDialog from "@/components/ui/certDialog";
import { usePortfolioStore } from "@/lib/stores/portfolioStore";
import BentoCard from "@/components/ui/BentoCard";
import ImageReveal from "@/components/ui/ImageReveal";

export default function CertificationsPage() {
    const certs = usePortfolioStore((s) => s.certificates);
    const isLoading = usePortfolioStore((s) => s.loading);
    const fetchOverview = usePortfolioStore((s) => s.fetchOverview);
    const [selected, setSelected] = useState<ICertificate | null>(null);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    return (
        <div className="min-h-screen pt-32 pb-20 dot-pattern">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Certifications</h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Verified credentials, courses, and training programs I&apos;ve completed.
                    </p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (<div key={i} className="bento-card p-6 h-32 animate-pulse bg-secondary" />))}
                    </div>
                ) : certs.length > 0 ? (
                    <div className="grid gap-4">
                        {certs.map((cert, i) => (
                            <BentoCard 
                                key={String(cert._id)} 
                                delay={i * 0.05} 
                                interactive
                                onClick={() => setSelected(cert)} 
                                className="flex flex-col sm:flex-row overflow-hidden group p-2"
                            >
                                {cert.imageUrl ? (
                                    <div className="w-full sm:w-48 h-32 shrink-0">
                                        <ImageReveal 
                                            src={blobDisplayUrl(cert.imageUrl)} 
                                            alt={cert.name} 
                                            aspectRatio="auto"
                                            className="w-full h-full object-cover"
                                            containerClassName="w-full h-full rounded-2xl"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full sm:w-48 h-32 shrink-0 bg-secondary rounded-2xl flex items-center justify-center">
                                        <Award size={32} className="text-muted-foreground/30" />
                                    </div>
                                )}
                                <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-1">
                                    <div>
                                        <h3 className="font-bold text-xl mb-1 group-hover:opacity-70 transition-opacity">{cert.name}</h3>
                                        <p className="font-medium text-muted-foreground">{cert.issuer}</p>
                                        {cert.date && <p className="text-sm text-muted-foreground/70 mt-2">{cert.date}</p>}
                                    </div>
                                    <span className="shrink-0 flex items-center gap-1.5 text-sm font-bold w-fit px-4 py-2 rounded-full bg-foreground text-background opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        View Details <ExternalLink size={14} />
                                    </span>
                                </div>
                            </BentoCard>
                        ))}
                    </div>
                ) : (
                    <div className="bento-card p-12 text-center text-muted-foreground">No certifications added yet.</div>
                )}
            </div>

            {selected && <CertDialog cert={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}