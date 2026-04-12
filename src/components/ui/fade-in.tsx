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
}: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay, ease: "circOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
