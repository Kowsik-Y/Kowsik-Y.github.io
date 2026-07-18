"use client";

import { blobDisplayUrl } from "@/lib/blob-url";
import { ICertificate, IAchievement } from "@/types";
import { Award, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import MagneticButton from "@/components/ui/MagneticButton";

export default function CertDialog({ cert, onClose }: { cert: ICertificate | IAchievement; onClose: () => void }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-xl bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-md border border-border text-foreground cursor-pointer hover:bg-background transition-colors"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>

                {cert.imageUrl && (
                    <div className="relative w-full h-auto aspect-video bg-secondary">
                        <Image
                            src={blobDisplayUrl(cert.imageUrl)}
                            alt={('name' in cert ? cert.name : cert.title) || ''}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                )}

                <div className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 flex flex-col items-center justify-center rounded-2xl bg-secondary text-foreground shrink-0">
                            <Award size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-foreground leading-snug mb-1">
                                {'name' in cert ? cert.name : cert.title}
                            </h2>
                            <p className="text-sm font-semibold text-muted-foreground">
                                {(('issue' in cert ? cert.issue : '') || ('org' in cert ? cert.org : '')) as string}
                            </p>
                            {'description' in cert && cert.description && (
                                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{cert.description}</p>
                            )}
                            {cert.date && (
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mt-4">{cert.date}</p>
                            )}
                        </div>
                    </div>

                    {cert.link && (
                        <MagneticButton
                            as="a"
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-foreground text-background font-bold transition-transform hover:scale-[0.98]"
                        >
                            <ExternalLink size={16} /> View Credential
                        </MagneticButton>
                    )}
                </div>
            </div>
        </div>
    );

    if (!mounted) return null;
    return createPortal(modalContent, document.body);
}