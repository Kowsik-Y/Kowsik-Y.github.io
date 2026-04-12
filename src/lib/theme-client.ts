"use client";

import { useCallback, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";

function systemPrefersDark() {
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getCurrentTheme(): ThemeMode {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
}

export function useClientTheme() {
    const [theme, setThemeState] = useState<ThemeMode>(() => {
        if (typeof window === "undefined") return "light";
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        return saved ?? (systemPrefersDark() ? "dark" : "light");
    });

    useEffect(() => {
        const saved = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? null;
        const initialTheme = saved ?? (systemPrefersDark() ? "dark" : "light");
        applyTheme(initialTheme);

        const observer = new MutationObserver(() => {
            setThemeState(getCurrentTheme());
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const setTheme = useCallback((value: ThemeMode, e?: React.MouseEvent) => {

        const updateTheme = () => {
            applyTheme(value);
            localStorage.setItem(STORAGE_KEY, value);
            setThemeState(value);
        };

        if (typeof document === "undefined" || !("startViewTransition" in document) || !e) {
            updateTheme();
            return;
        }

        const x = e.clientX;
        const y = e.clientY;
        const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        document.documentElement.style.setProperty("--theme-x", `${x}px`);
        document.documentElement.style.setProperty("--theme-y", `${y}px`);
        document.documentElement.style.setProperty("--theme-r", `${endRadius}px`);

        document.startViewTransition(() => {
            updateTheme();
        });

    }, []);

    return { theme, setTheme };
}
