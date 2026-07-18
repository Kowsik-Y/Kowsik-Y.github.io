"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
    scale?: boolean;
    blur?: boolean;
    duration?: number;
}

const directionOffset = {
    up: { x: 0, y: 30 },
    down: { x: 0, y: -30 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
    none: { x: 0, y: 0 },
};

export default function FadeIn({
    children,
    delay = 0,
    className = "",
    direction = "up",
    scale = false,
    blur = false,
    duration = 0.7,
}: FadeInProps) {
    const offset = directionOffset[direction];
    return (
        <motion.div
            initial={{
                opacity: 0,
                x: offset.x,
                y: offset.y,
                scale: scale ? 0.95 : 1,
                filter: blur ? "blur(6px)" : "blur(0px)",
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
            }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
