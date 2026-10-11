"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  ExternalLink,
  Copy,
  Check,
  FileText,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  Layers,
  File,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import BentoCard from "@/components/ui/BentoCard";
import MagneticButton from "@/components/ui/MagneticButton";

interface Props {
  resumeUrl: string;
  name: string;
  title: string;
  email?: string;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export default function ResumeViewerClient({
  resumeUrl,
  name,
  title,
  email,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.15);
  const [rotation, setRotation] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"continuous" | "single">("continuous");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});
  const pdfDocRef = useRef<any>(null);
  const renderTasksRef = useRef<{ [key: number]: any }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = () => {
    const fullUrl = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success("Resume link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Load PDF.js library & Document
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!window.pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/pdfjs/pdf.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load PDF.js engine"));
            document.head.appendChild(script);
          });
        }

        if (!isMounted) return;

        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument(resumeUrl);
        const doc = await loadingTask.promise;

        if (!isMounted) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages || 1);
        setLoading(false);
      } catch (err: any) {
        console.error("PDF load error:", err);
        if (isMounted) {
          setError("Failed to render PDF with custom controls.");
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [resumeUrl]);

  // 2. Render Page to Canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      const doc = pdfDocRef.current;
      const canvas = canvasRefs.current[pageNumber];
      if (!doc || !canvas) return;

      try {
        if (renderTasksRef.current[pageNumber]) {
          renderTasksRef.current[pageNumber].cancel();
        }

        const page = await doc.getPage(pageNumber);
        const viewport = page.getViewport({ scale, rotation });
        const context = canvas.getContext("2d");
        if (!context) return;

        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(dpr, dpr);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTasksRef.current[pageNumber] = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(`Page ${pageNumber} render error:`, err);
        }
      }
    },
    [scale, rotation]
  );

  // 3. Trigger Re-render on view/scale/page/fullscreen changes
  useEffect(() => {
    if (!pdfDocRef.current || loading) return;

    if (viewMode === "continuous") {
      for (let i = 1; i <= numPages; i++) {
        renderPage(i);
      }
    } else {
      renderPage(currentPage);
    }
  }, [viewMode, currentPage, scale, rotation, numPages, loading, isFullscreen, renderPage]);

  // Zoom controls
  const handleZoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.15).toFixed(2)));
  const handleZoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.15).toFixed(2)));
  const handleZoomReset = () => setScale(1.15);
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  // Page navigation
  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  // Print function
  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = resumeUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    };
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen((f) => !f);
  };

  // Keyboard escape & body scroll lock + hide navbar for fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("resume-fullscreen");
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFullscreen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        document.body.classList.remove("resume-fullscreen");
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("resume-fullscreen");
    }
  }, [isFullscreen]);

  // Reusable Viewer inner contents
  const renderViewerContent = (inFullscreen: boolean) => (
    <>
      {/* ── Bespoke Custom Controls Bar ── */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-2 sm:p-2.5 rounded-xl bg-card border border-border/60 shadow-xs mb-3">
        {/* Group 1: Page Navigation */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border/40 text-xs">
          {viewMode === "single" ? (
            <>
              <button
                type="button"
                onClick={prevPage}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-md hover:bg-background text-foreground/80 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 font-mono font-medium">
                {currentPage} / {numPages}
              </span>
              <button
                type="button"
                onClick={nextPage}
                disabled={currentPage >= numPages}
                className="p-1.5 rounded-md hover:bg-background text-foreground/80 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <span className="px-3 py-1 font-mono text-xs font-medium text-foreground/80 flex items-center gap-1.5">
              <FileText size={13} className="text-violet-500" />
              {numPages} {numPages === 1 ? "Page" : "Pages"}
            </span>
          )}

          {/* View Mode Switcher */}
          <div className="h-4 w-px bg-border/60 mx-1" />
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "continuous" ? "single" : "continuous")}
            className="px-2 py-1 rounded-md text-[11px] font-medium hover:bg-background text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            title={viewMode === "continuous" ? "Switch to Single Page view" : "Switch to Continuous Scroll view"}
          >
            {viewMode === "continuous" ? (
              <>
                <Layers size={12} className="text-violet-500" /> Continuous
              </>
            ) : (
              <>
                <File size={12} className="text-violet-500" /> Single
              </>
            )}
          </button>
        </div>

        {/* Group 2: Zoom Controls */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border/40 text-xs">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.6}
            className="p-1.5 rounded-md hover:bg-background text-foreground/80 hover:text-foreground disabled:opacity-30 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          <button
            type="button"
            onClick={handleZoomReset}
            className="px-2.5 py-1 rounded-md font-mono font-medium hover:bg-background text-foreground/90 transition-colors"
            title="Reset Zoom (115%)"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 2.5}
            className="p-1.5 rounded-md hover:bg-background text-foreground/80 hover:text-foreground disabled:opacity-30 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
        </div>

        {/* Group 3: Document View Actions */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border/40 text-xs">
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-md hover:bg-background text-foreground/80 hover:text-foreground transition-colors"
            title="Rotate 90° Clockwise"
          >
            <RotateCw size={15} />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded-md hover:bg-background text-foreground/80 hover:text-foreground transition-colors"
            title="Print Document"
          >
            <Printer size={15} />
          </button>

          {inFullscreen ? (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-2.5 py-1 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-1.5 font-medium text-xs"
              title="Exit Fullscreen (Esc)"
            >
              <Minimize2 size={14} />
              <span>Exit (Esc)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md hover:bg-background text-foreground/80 hover:text-foreground transition-colors"
              title="Fullscreen View"
            >
              <Maximize2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── Document Canvas Render Area ── */}
      <div
        className={`w-full overflow-auto rounded-xl bg-muted/40 border border-border/50 p-4 sm:p-8 flex flex-col items-center custom-scroll ${
          inFullscreen ? "flex-1" : "min-h-[650px] max-h-[82vh]"
        }`}
      >
        {loading && (
          <div className="my-auto flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-foreground">Rendering Resume...</p>
            <p className="text-xs text-muted-foreground mt-1">Applying high-DPI vector canvas</p>
          </div>
        )}

        {error && (
          <div className="my-auto flex flex-col items-center justify-center py-16 text-center max-w-md">
            <p className="text-sm font-semibold text-rose-500 mb-2">{error}</p>
            <p className="text-xs text-muted-foreground mb-4">
              You can still view the resume using the direct links below.
            </p>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold"
            >
              Open PDF in New Window
            </a>
          </div>
        )}

        {/* Continuous Stack View (All Pages) */}
        {!loading && !error && viewMode === "continuous" && (
          <div className="flex flex-col items-center gap-8 w-full">
            {Array.from({ length: numPages }, (_, idx) => idx + 1).map((pageNum) => (
              <div key={pageNum} className="flex flex-col items-center group">
                <div className="shadow-2xl rounded-lg overflow-hidden border border-border/60 bg-white transition-all hover:shadow-3xl">
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[pageNum] = el;
                    }}
                    className="block max-w-full"
                  />
                </div>
                <span className="mt-2 text-[11px] font-mono text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                  Page {pageNum} of {numPages}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Single Page View */}
        {!loading && !error && viewMode === "single" && (
          <div className="flex flex-col items-center my-auto">
            <div className="shadow-2xl rounded-lg overflow-hidden border border-border/60 bg-white transition-all hover:shadow-3xl">
              <canvas
                ref={(el) => {
                  canvasRefs.current[currentPage] = el;
                }}
                className="block max-w-full"
              />
            </div>
            <span className="mt-3 text-[11px] font-mono text-muted-foreground">
              Page {currentPage} of {numPages}
            </span>
          </div>
        )}
      </div>

      {/* Bottom quick bar */}
      <div className="mt-3 px-3 py-2 bg-secondary/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-mono">Kowsik_Y_Resume.pdf • Verified Document</span>
        <div className="flex items-center gap-3">
          <a
            href={resumeUrl}
            download="Kowsik_Y_Resume.pdf"
            className="font-semibold text-foreground hover:underline inline-flex items-center gap-1"
          >
            <Download size={12} /> Download PDF
          </a>
          <span>•</span>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-violet-500 hover:underline inline-flex items-center gap-1"
          >
            Direct Link <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-24 relative gen-ai-bg overflow-hidden">
      <div className="scanner-line" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back link & Title */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-semibold uppercase tracking-wider mb-3">
                <FileText size={13} /> Curriculum Vitae
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {name}&apos;s Resume
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                {title || "AI & ML Engineer • Full-Stack Developer"}
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-background/80 hover:bg-secondary text-sm font-medium transition-colors shadow-xs"
                title="Copy shareable link"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Link"}
              </button>

              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background text-sm font-medium transition-colors"
              >
                <ExternalLink size={16} /> Open PDF
              </a>

              <a
                href={resumeUrl}
                download="Kowsik_Y_Resume.pdf"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background hover:opacity-90 text-sm font-semibold shadow-soft transition-all"
              >
                <Download size={16} /> Download
              </a>
            </div>
          </div>
        </div>

        {/* ── Document Viewer: in-page OR portal fullscreen ── */}
        {mounted && isFullscreen ? (
          createPortal(
            <div className="fixed inset-0 z-[999999] bg-background p-3 sm:p-5 flex flex-col h-screen w-screen overflow-hidden">
              <div className="flex-1 w-full flex flex-col h-full bg-card rounded-2xl border border-border/80 shadow-2xl p-3 sm:p-4 overflow-hidden">
                {renderViewerContent(true)}
              </div>
            </div>,
            document.body
          )
        ) : (
          <BentoCard className="overflow-hidden shadow-2xl relative flex flex-col p-3 sm:p-5 mb-8" delay={0.1}>
            {renderViewerContent(false)}
          </BentoCard>
        )}

        {/* Contact Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BentoCard className="p-6 md:col-span-2 flex flex-col justify-between" delay={0.2}>
            <div>
              <h2 className="text-lg font-bold mb-2">Interested in working together?</h2>
              <p className="text-muted-foreground text-sm">
                I&apos;m open to software engineering, AI/ML engineering, and research internships or full-time roles.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <MagneticButton
                href="/contact"
                className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:scale-95 transition-transform"
              >
                Get in Touch
              </MagneticButton>
              <MagneticButton
                href="/projects"
                className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:scale-95 transition-transform"
              >
                Browse Projects
              </MagneticButton>
            </div>
          </BentoCard>

          <BentoCard className="p-6 flex flex-col justify-between text-center items-center" delay={0.25}>
            <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center mb-3">
              <FileText size={24} />
            </div>
            <h3 className="font-semibold text-sm">Verified Credentials</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Explore certifications, awards, and verified technical badges.
            </p>
            <Link
              href="/certifications"
              className="text-xs font-semibold text-violet-500 hover:underline"
            >
              View Certifications →
            </Link>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
