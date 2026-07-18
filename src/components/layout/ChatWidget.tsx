"use client";

import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === "user";
    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs border ${isUser
                    ? "bg-foreground text-background border-foreground"
                    : "bg-secondary text-foreground border-border"
                    }`}
            >
                {isUser ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed text-wrap ${isUser
                    ? "bg-foreground text-background rounded-tr-sm"
                    : "bg-secondary text-foreground rounded-tl-sm border border-border"
                    }`}
            >
                {isUser ? (
                    <p>{msg.content}</p>
                ) : (
                    <ReactMarkdown
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        components={{
                            p: ({ children }: { children: ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }: { children: ReactNode }) => <strong className="font-bold">{children}</strong>,
                            em: ({ children }: { children: ReactNode }) => <em className="italic opacity-90">{children}</em>,
                            ul: ({ children }: { children: ReactNode }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                            ol: ({ children }: { children: ReactNode }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                            li: ({ children }: { children: ReactNode }) => <li className="opacity-90">{children}</li>,
                            code: ({ children }: { children: ReactNode }) => <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs font-mono border border-border/50">{children}</code>,
                            a: ({ children, ...props }: { children: ReactNode;[k: string]: unknown }) => <a {...props as React.AnchorHTMLAttributes<HTMLAnchorElement>} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70 font-semibold">{children}</a>,
                            h1: ({ children }: { children: ReactNode }) => <p className="font-bold mt-2 mb-1 text-base">{children}</p>,
                            h2: ({ children }: { children: ReactNode }) => <p className="font-bold mt-2 mb-1 text-base">{children}</p>,
                            h3: ({ children }: { children: ReactNode }) => <p className="font-semibold mt-1 mb-1">{children}</p>,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any}
                    >
                        {msg.content}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
}

const GREETING: Message = {
    role: "assistant",
    content:
        "Hi! 👋 I'm Kowsik Y. Ask me anything — about my projects, skills, background, or how to get in touch!",
};

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([GREETING]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const send = async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput("");

        const userMsg: Message = { role: "user", content: text };
        const next = [...messages, userMsg];
        setMessages(next);
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply ?? "Sorry, something went wrong." },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Couldn't connect. Please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Chat panel */}
            <div
                className={`fixed bottom-24 right-4 sm:right-6 z-50 w-96 max-w-[calc(100vw-2rem)] flex flex-col bg-card border border-border shadow-2xl rounded-[var(--radius-3xl)] overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${open ? "scale-100 opacity-100 pointer-events-auto translate-y-0" : "scale-95 opacity-0 pointer-events-none translate-y-4"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-secondary border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center border border-border">
                            <Bot size={18} className="text-background" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground leading-tight">Ask Kowsik</p>
                            <p className="text-xs font-semibold text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 max-h-[500px] min-h-[300px] h-full scrollbar-thin">
                    {messages.map((msg, i) => (
                        <MessageBubble key={i} msg={msg} />
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-secondary border border-border text-foreground flex items-center justify-center">
                                <Bot size={14} />
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-secondary border border-border flex items-center justify-center">
                                <Loader2 size={16} className="text-foreground/50 animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-card border-t border-border">
                    <div className="flex items-center gap-2 bg-secondary rounded-full pl-5 pr-2 py-2 border border-border focus-within:border-foreground/30 transition-colors">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                            placeholder="Message..."
                            className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
                        />
                        <button
                            onClick={send}
                            disabled={!input.trim() || loading}
                            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed hover:scale-95 transition-transform"
                        >
                            <Send size={14} className="-ml-0.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating toggle button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-foreground text-background shadow-2xl flex items-center justify-center transition-transform hover:scale-95 active:scale-90`}
                aria-label="Toggle chat"
            >
                {open ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </>
    );
}
