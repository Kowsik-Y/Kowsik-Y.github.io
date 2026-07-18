"use client";

import { useState, useEffect, useRef } from "react";

interface AnimatedCounterProps {
    value: string;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export default function AnimatedCounter({
    value,
    duration = 1200,
    prefix = "",
    suffix = "",
    className = "",
}: AnimatedCounterProps) {
    const parsed = Number(value);
    const isNumeric = Number.isFinite(parsed);
    const decimals = value.includes(".") ? (value.split(".")[1]?.length ?? 0) : 0;
    const [display, setDisplay] = useState(0);
    const [triggered, setTriggered] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    // Intersection observer — only animate when visible
    useEffect(() => {
        if (!ref.current || !isNumeric) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !triggered) {
                    setTriggered(true);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [isNumeric, triggered]);

    // Count-up animation
    useEffect(() => {
        if (!triggered || !isNumeric) return;

        let raf = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(parsed * eased);
            if (progress < 1) {
                raf = requestAnimationFrame(tick);
            }
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [triggered, duration, isNumeric, parsed]);

    if (!isNumeric) {
        return <span ref={ref} className={className}>{prefix}{value}{suffix}</span>;
    }

    return (
        <span ref={ref} className={className}>
            {prefix}
            {display.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}
            {suffix}
        </span>
    );
}
