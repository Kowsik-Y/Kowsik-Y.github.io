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
        <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <div
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${isUser
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 border border-violet-500/30 text-violet-400"
                    }`}
            >
                {isUser ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed text-wrap ${isUser
                    ? "bg-violet-600 text-white rounded-tr-sm"
                    : "bg-slate-800/80 border border-white/8 text-slate-200 rounded-tl-sm"
                    }`}
            >
                {isUser ? (
                    <p>{msg.content}</p>
                ) : (
                    <ReactMarkdown
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        components={{
                            p: ({ children }: { children: ReactNode }) => <p className="mb-1 last:mb-0">{children}</p>,
                            strong: ({ children }: { children: ReactNode }) => <strong className="font-semibold text-white">{children}</strong>,
                            em: ({ children }: { children: ReactNode }) => <em className="italic text-slate-300">{children}</em>,
                            ul: ({ children }: { children: ReactNode }) => <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
                            ol: ({ children }: { children: ReactNode }) => <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
                            li: ({ children }: { children: ReactNode }) => <li className="text-slate-200">{children}</li>,
                            code: ({ children }: { children: ReactNode }) => <code className="bg-slate-700 text-violet-300 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                            a: ({ children, ...props }: { children: ReactNode;[k: string]: unknown }) => <a {...props as React.AnchorHTMLAttributes<HTMLAnchorElement>} target="_blank" rel="noopener noreferrer" className="text-violet-400 underline underline-offset-2 hover:text-violet-300">{children}</a>,
                            h1: ({ children }: { children: ReactNode }) => <p className="font-bold text-white mt-1">{children}</p>,
                            h2: ({ children }: { children: ReactNode }) => <p className="font-bold text-white mt-1">{children}</p>,
                            h3: ({ children }: { children: ReactNode }) => <p className="font-semibold text-slate-100 mt-0.5">{children}</p>,
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
                className={`fixed bottom-20 right-4 sm:right-6 z-50 w-90 max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-violet-900/30 transition-all duration-300 origin-bottom-right ${open ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white leading-none">Portfolio AI</p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-120 min-h-48 h-full scrollbar-thin">
                    {messages.map((msg, i) => (
                        <MessageBubble key={i} msg={msg} />
                    ))}
                    {loading && (
                        <div className="flex gap-2.5">
                            <div className="shrink-0 w-7 h-7 rounded-full bg-slate-800 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                                <Bot size={14} />
                            </div>
                            <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-white/8">
                                <Loader2 size={14} className="text-violet-400 animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-3 border-t border-white/8">
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/8 focus-within:border-violet-500/50 transition-colors">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                            placeholder="Ask about skills, projects…"
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
                        />
                        <button
                            onClick={send}
                            disabled={!input.trim() || loading}
                            className="shrink-0 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating toggle button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className={`fixed bottom-5 right-4 sm:right-6 z-50 w-13 h-13 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/40 flex items-center justify-center transition-all duration-200`}
                aria-label="Toggle chat"
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>
        </>
    );
}
