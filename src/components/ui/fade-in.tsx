"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export default function FadeIn({
    children,
    delay = 0,
    className = "",
    direction = "up",
}: FadeInProps) {
    const initial = {
        opacity: 0,
        y: direction === "up" ? 24 : direction === "down" ? -24 : 0,
        x: direction === "left" ? 24 : direction === "right" ? -24 : 0,
    };

    return (
        <motion.div
            initial={initial}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
