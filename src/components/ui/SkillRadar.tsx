"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SkillRadarProps {
    skills: { name: string; value: number; category?: string }[];
    className?: string;
    size?: number;
    maxValue?: number;
    levels?: number;
    showLabels?: boolean;
    showGrid?: boolean;
    colors?: {
        grid?: string;
        axis?: string;
        fill?: string;
        stroke?: string;
        label?: string;
    };
}

const DEFAULT_COLORS = {
    grid: "rgba(139, 92, 246, 0.15)",
    axis: "rgba(139, 92, 246, 0.3)",
    fill: "rgba(139, 92, 246, 0.15)",
    stroke: "#8b5cf6",
    label: "#e4e4e7",
};

export default function SkillRadar({
    skills,
    className,
    size = 300,
    maxValue = 100,
    levels = 5,
    showLabels = true,
    showGrid = true,
    colors,
}: SkillRadarProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: size, height: size });

    const mergedColors = { ...DEFAULT_COLORS, ...colors };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const containerWidth = size;
        const containerHeight = size;

        canvas.width = containerWidth * dpr;
        canvas.height = containerHeight * dpr;
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerHeight}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.scale(dpr, dpr);

        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        const radius = Math.min(centerX, centerY) - 40;

        const angleStep = (Math.PI * 2) / skills.length;

        // Draw grid
        if (showGrid) {
            ctx.strokeStyle = mergedColors.grid;
            ctx.lineWidth = 1;

            for (let level = 1; level <= levels; level++) {
                const levelRadius = (radius / levels) * level;
                ctx.beginPath();
                for (let i = 0; i < skills.length; i++) {
                    const angle = angleStep * i - Math.PI / 2;
                    const x = centerX + Math.cos(angle) * levelRadius;
                    const y = centerY + Math.sin(angle) * levelRadius;
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Draw axes
            ctx.strokeStyle = mergedColors.axis;
            for (let i = 0; i < skills.length; i++) {
                const angle = angleStep * i - Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(angle) * radius,
                    centerY + Math.sin(angle) * radius
                );
                ctx.stroke();
            }
        }

        // Draw skill area
        ctx.beginPath();
        ctx.fillStyle = mergedColors.fill;
        ctx.strokeStyle = mergedColors.stroke;
        ctx.lineWidth = 2;

        for (let i = 0; i < skills.length; i++) {
            const angle = angleStep * i - Math.PI / 2;
            const value = Math.min(skills[i].value, maxValue) / maxValue;
            const pointRadius = radius * value;
            const x = centerX + Math.cos(angle) * pointRadius;
            const y = centerY + Math.sin(angle) * pointRadius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw points
        ctx.fillStyle = mergedColors.stroke;
        for (let i = 0; i < skills.length; i++) {
            const angle = angleStep * i - Math.PI / 2;
            const value = Math.min(skills[i].value, maxValue) / maxValue;
            const pointRadius = radius * value;
            const x = centerX + Math.cos(angle) * pointRadius;
            const y = centerY + Math.sin(angle) * pointRadius;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw labels
        if (showLabels) {
            ctx.fillStyle = mergedColors.label;
            ctx.font = "12px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let i = 0; i < skills.length; i++) {
                const angle = angleStep * i - Math.PI / 2;
                const labelRadius = radius + 30;
                const x = centerX + Math.cos(angle) * labelRadius;
                const y = centerY + Math.sin(angle) * labelRadius;

                // Adjust text alignment based on angle
                if (angle > -Math.PI / 2 && angle < Math.PI / 2) {
                    ctx.textAlign = "left";
                } else if (angle > Math.PI / 2 && angle < 3 * Math.PI / 2) {
                    ctx.textAlign = "right";
                } else {
                    ctx.textAlign = "center";
                }

                ctx.fillText(skills[i].name, x, y);
            }
        }

        // Draw value labels
        ctx.fillStyle = mergedColors.label;
        ctx.font = "11px system-ui, sans-serif";
        ctx.textAlign = "right";
        for (let level = 1; level <= levels; level++) {
            const levelRadius = (radius / levels) * level;
            const value = Math.round((level / levels) * maxValue);
            ctx.fillText(
                `${value}`,
                centerX - radius - 10,
                centerY - levelRadius + 4
            );
        }
    }, [skills, size, maxValue, levels, showLabels, showGrid, colors]);

    return (
        <div className={cn("flex justify-center", className)}>
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                style={{ width: size, height: size }}
            />
        </div>
    );
}