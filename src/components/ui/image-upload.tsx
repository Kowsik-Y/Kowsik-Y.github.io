"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Link, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blobDisplayUrl } from "@/lib/blob-url";

interface Props {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label = "Image" }: Props) {
    const [mode, setMode] = useState<"upload" | "url">("upload");
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput] = useState(value ?? "");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: "POST",
                body: file,
            });
            if (!res.ok) throw new Error("Upload failed");
            const { url } = await res.json();
            onChange(url);
        } catch {
            alert("Upload failed. Check BLOB_READ_WRITE_TOKEN in .env.local");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/80">{label}</span>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setMode("upload")}
                        className={`text-xs px-2 py-0.5 rounded transition-colors ${mode === "upload" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Upload size={11} className="inline mr-1" />Upload
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("url")}
                        className={`text-xs px-2 py-0.5 rounded transition-colors ${mode === "url" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Link size={11} className="inline mr-1" />URL
                    </button>
                </div>
            </div>

            {mode === "upload" ? (
                <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-violet-500/50 transition-colors"
                >
                    {uploading ? (
                        <Loader2 size={20} className="animate-spin mx-auto text-violet-400" />
                    ) : (
                        <>
                            <Upload size={20} className="mx-auto text-muted-foreground/80 mb-1" />
                            <p className="text-xs text-muted-foreground/80">Click to upload image</p>
                        </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
            ) : (
                <Input
                    value={urlInput}
                    onChange={(e) => { setUrlInput(e.target.value); onChange(e.target.value); }}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10 text-foreground text-sm"
                />
            )}

            {value && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 group">
                    <Image src={blobDisplayUrl(value)} alt="preview" fill className="object-cover" unoptimized />
                    <button
                        type="button"
                        onClick={() => { onChange(""); setUrlInput(""); }}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={14} className="text-foreground" />
                    </button>
                </div>
            )}
        </div>
    );
}
