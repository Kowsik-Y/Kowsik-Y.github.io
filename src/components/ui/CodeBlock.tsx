"use client";

import { useRef, useEffect, useState } from "react";
import { createHighlighter } from "shiki";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
    code: string;
    language?: string;
    fileName?: string;
    showLineNumbers?: boolean;
    highlightLines?: number[];
    theme?: string;
    className?: string;
}

const LANGUAGES = [
    "typescript",
    "javascript",
    "python",
    "rust",
    "go",
    "cpp",
    "java",
    "html",
    "css",
    "json",
    "yaml",
    "markdown",
    "bash",
    "sql",
    "dockerfile",
];

export default function CodeBlock({
    code,
    language = "typescript",
    fileName,
    showLineNumbers = true,
    highlightLines = [],
    theme = "github-dark",
    className,
}: CodeBlockProps) {
    const [highlightedCode, setHighlightedCode] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const highlighterRef = useRef<Promise<Awaited<ReturnType<typeof createHighlighter>>>>(
        createHighlighter({ themes: ["github-dark", "github-light"], langs: LANGUAGES })
    );

    useEffect(() => {
        const highlight = async () => {
            const highlighter = await highlighterRef.current;
            const html = highlighter.codeToHtml(code, {
                lang: language,
                theme,
            });
            setHighlightedCode(html);
        };
        highlight();
    }, [code, language, showLineNumbers, highlightLines, theme]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("relative rounded-xl overflow-hidden border border-border bg-[#0d1117]", className)}>
            {(fileName || language) && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-[#161b22]">
                    <span className="text-xs text-muted-foreground font-mono">
                        {fileName || language}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
                        aria-label="Copy code"
                    >
                        {copied ? (
                            <>
                                <Check size={14} className="text-green-400" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            )}
            <div className="p-4 overflow-x-auto" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </div>
    );
}