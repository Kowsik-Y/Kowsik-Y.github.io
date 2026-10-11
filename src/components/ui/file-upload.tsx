"use client";

import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, X, Loader2, FileText, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export default function FileUpload({
  value,
  onChange,
  label = "Resume PDF",
  accept = ".pdf,application/pdf",
}: Props) {
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
      alert("Upload failed. Make sure your server/storage configuration is valid.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground/80">{label}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              mode === "upload"
                ? "bg-violet-600 text-white font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload size={11} className="inline mr-1" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              mode === "url"
                ? "bg-violet-600 text-white font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon size={11} className="inline mr-1" />
            URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border/60 hover:border-violet-500/50 rounded-xl p-5 text-center cursor-pointer transition-colors bg-foreground/[0.02]"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-violet-500" />
              <p className="text-xs text-muted-foreground">Uploading resume document...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center mb-1">
                <FileText size={20} />
              </div>
              <p className="text-xs font-medium text-foreground/90">Click to upload new Resume PDF</p>
              <p className="text-[11px] text-muted-foreground">PDF document up to 10MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFile}
          />
        </div>
      ) : (
        <Input
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="/resume.pdf or https://..."
          className="bg-foreground/5 border-border/60 text-foreground text-sm"
        />
      )}

      {value && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-foreground/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-500 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {value.split("/").pop() || "resume.pdf"}
              </p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-violet-500 hover:underline flex items-center gap-1"
              >
                View current file <ExternalLink size={10} />
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setUrlInput("");
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Clear resume"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
