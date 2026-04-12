"use client";

import { blobDisplayUrl } from "@/lib/blob-url";
import { ICertificate, IAchievement } from "@/types";
import { Award, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-xl glass-card rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/20"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/10 text-muted-foreground cursor-pointer hover:bg-white/20 transition-colors"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>

                {cert.imageUrl && (
                    <div className="relative w-full h-auto aspect-video">
                        <Image
                            src={blobDisplayUrl(cert.imageUrl)}
                            alt={('name' in cert ? cert.name : cert.title) || ''}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60" />
                    </div>
                )}

                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400 shrink-0">
                            <Award size={22} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-foreground leading-snug">{'name' in cert ? cert.name : cert.title}</h2>
                            <p className="text-sm text-violet-300 mt-0.5">{(('issue' in cert ? cert.issue : '') || ('org' in cert ? cert.org : '')) as string}</p>
                            {'description' in cert && cert.description && (
                                <p className="text-xs text-muted-foreground/80 mt-1">{cert.description}</p>
                            )}
                            {cert.date && (
                                <p className="text-xs text-muted-foreground/80 mt-1">{cert.date}</p>
                            )}
                        </div>
                    </div>

                    {cert.link && (
                        <a
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors mt-2"
                        >
                            <ExternalLink size={14} /> View Certificate
                        </a>
                    )}
                </div>
            </div>
        </div>
    );

    if (!mounted) return null;
    return createPortal(modalContent, document.body);
}