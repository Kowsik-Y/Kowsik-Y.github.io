"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    sparkline?: number[];
    className?: string;
    format?: (val: string | number) => string;
    animate?: boolean;
    duration?: number;
}

export default function MetricCard({
    label,
    value,
    icon,
    trend,
    sparkline,
    className,
    format,
    animate = true,
    duration = 1500,
}: MetricCardProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || !animate) {
            setDisplayValue(Number(value));
            return;
        }

        const startTime = performance.now();
        const startValue = 0;
        const endValue = Number(value);

        const animateValue = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * eased;
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animateValue);
            }
        };

        requestAnimationFrame(animateValue);
    }, [isVisible, animate, duration, value]);

    const formattedValue = format ? format(displayValue) : displayValue.toLocaleString();

    return (
        <div
            ref={ref}
            className={cn(
                "glass-card p-6 relative overflow-hidden",
                className
            )}
        >
            {icon && (
                <div className="absolute top-4 right-4 text-muted-foreground/30">
                    {icon}
                </div>
            )}

            <div className="space-y-2">
                <p className="text-sm text-muted-foreground/80 uppercase tracking-widest font-medium">
                    {label}
                </p>

                <p className="text-3xl sm:text-4xl font-bold text-foreground">
                    {formattedValue}
                </p>

                {trend && (
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "flex items-center gap-1 text-sm font-medium",
                                trend.positive !== false
                                    ? "text-green-400"
                                    : "text-red-400"
                            )}
                        >
                            {trend.positive !== false ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            )}
                            {Math.abs(trend.value).toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">{trend.label}</span>
                    </div>
                )}

                {sparkline && sparkline.length > 0 && (
                    <div className="h-16 mt-2" aria-hidden="true">
                        <svg viewBox={`0 0 ${sparkline.length * 4} 64`} className="w-full h-full" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d={sparkline
                                    .map((point, i) => {
                                        const x = i * 4;
                                        const y = 64 - (point / Math.max(...sparkline)) * 56;
                                        return `${i === 0 ? "M" : "L"}${x} ${y}`;
                                    })
                                    .join(" ")}
                                stroke="url(#sparkline-gradient)"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}