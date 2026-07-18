"use client";

import { useRef, useEffect, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface TerminalProps {
    className?: string;
    initialCommands?: string[];
    prompt?: string;
    theme?: {
        background?: string;
        foreground?: string;
        cursor?: string;
    };
}

const DEFAULT_THEME = {
    background: "#0d1117",
    foreground: "#e6edf3",
    cursor: "#8b5cf6",
};

const COMMANDS: Record<string, { description: string; output: string[] }> = {
    help: {
        description: "Show available commands",
        output: [
            "Available commands:",
            "  help          - Show this help message",
            "  about         - About me",
            "  skills        - List my skills",
            "  projects      - Show featured projects",
            "  contact       - Contact information",
            "  clear         - Clear terminal",
            "  echo <text>   - Print text",
            "  date          - Show current date",
            "  whoami        - Show user info",
        ],
    },
    about: {
        description: "About me",
        output: [
            "Kowsik Y - AI & ML Engineer",
            "Passionate about building intelligent systems — from neural networks to production-ready full-stack apps.",
            "Currently pursuing B.Tech in AI & ML at Bannari Amman Institute of Technology.",
        ],
    },
    skills: {
        description: "List my skills",
        output: [
            "Tech: Python, TypeScript, React, Next.js, TensorFlow, PyTorch",
            "Tools: Docker, Git, AWS, PostgreSQL, MongoDB",
            "Soft: Problem Solving, Communication, Team Leadership",
        ],
    },
    projects: {
        description: "Featured projects",
        output: [
            "1. Neural Style Transfer - PyTorch implementation of artistic style transfer",
            "2. Full-Stack E-Commerce - Next.js + Node.js with payment integration",
            "3. LLM Agent Framework - TypeScript framework for building AI agents",
            "4. Computer Vision Pipeline - Real-time object detection with YOLOv8",
        ],
    },
    contact: {
        description: "Contact information",
        output: [
            "Email: kowsik@example.com",
            "GitHub: github.com/Kowsik-Y",
            "LinkedIn: linkedin.com/in/kowsik-y",
            "Website: kowsik.me",
        ],
    },
    whoami: {
        description: "Show user info",
        output: [
            "user: kowsik",
            "role: AI & ML Engineer",
            "location: India",
            "shell: /bin/zsh",
        ],
    },
    date: {
        description: "Show current date",
        output: [new Date().toString()],
    },
    clear: {
        description: "Clear terminal",
        output: [],
    },
};

export default function Terminal({
    className = "",
    initialCommands = ["help"],
    prompt = "kowsik@portfolio:~$ ",
    theme = DEFAULT_THEME,
}: TerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (initialized || !terminalRef.current) return;

        const xterm = new XTerm({
            cursorBlink: true,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: 14,
            lineHeight: 1.5,
            theme: {
                background: theme.background,
                foreground: theme.foreground,
                cursor: theme.cursor,
            },
            convertEol: true,
            scrollback: 1000,
        });

        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);

        xterm.open(terminalRef.current);
        fitAddon.fit();

        xterm.write(`Welcome to Kowsik's Portfolio Terminal\r\n`);
        xterm.write(`Type 'help' for available commands\r\n\r\n`);
        xterm.write(`${prompt} `);

        initialCommands.forEach((cmd) => {
            handleCommand(xterm, cmd.trim());
        });

        xterm.onData((data) => handleInput(xterm, data, prompt));

        window.addEventListener("resize", () => fitAddon.fit());

        xtermRef.current = xterm;
        fitAddonRef.current = fitAddon;
        setInitialized(true);

        return () => {
            window.removeEventListener("resize", () => fitAddon.fit());
            xterm.dispose();
        };
    }, [initialized, prompt, theme, initialCommands]);

    const handleInput = (xterm: XTerm, data: string, promptStr: string) => {
        const charCode = data.charCodeAt(0);

        if (charCode === 13) {
            const line = xterm.buffer.active.getLine(xterm.buffer.active.cursorY);
            const cmdLine = line?.translateToString().replace(promptStr, "").trim() || "";
            xterm.write("\r\n");
            handleCommand(xterm, cmdLine);
            xterm.write(`${promptStr} `);
        } else if (charCode === 8 || charCode === 127) {
            if (xterm.buffer.active.cursorX > promptStr.length) {
                xterm.write("\b \b");
            }
        } else if (charCode >= 32 && charCode <= 126) {
            xterm.write(data);
        }
    };

    const handleCommand = (xterm: XTerm, cmd: string) => {
        const [command, ...args] = cmd.split(" ").filter(Boolean);
        const lowerCmd = command.toLowerCase();

        if (lowerCmd === "clear") {
            xterm.clear();
            return;
        }

        if (lowerCmd === "echo") {
            xterm.write(`${args.join(" ")}\r\n`);
            return;
        }

        const cmdDef = COMMANDS[lowerCmd];
        if (cmdDef) {
            cmdDef.output.forEach((line) => xterm.write(`${line}\r\n`));
        } else if (command) {
            xterm.write(`Command not found: ${command}\r\nType 'help' for available commands\r\n`);
        }
    };

    return (
        <div
            ref={terminalRef}
            className={`rounded-xl border border-border bg-[#0d1117] ${className}`}
            style={{ minHeight: "300px", width: "100%" }}
        />
    );
}