"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface BentoCardProps {
    children: ReactNode;
    className?: string;
    interactive?: boolean;
    onClick?: () => void;
    delay?: number;
}

export default function BentoCard({
    children,
    className = "",
    interactive = false,
    onClick,
    delay = 0,
}: BentoCardProps) {
    const isClickable = interactive || !!onClick;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay, type: "spring", bounce: 0.3 }}
            className={`bento-card shadow-soft ${isClickable ? "bento-card-interactive cursor-pointer" : ""} ${className}`}
            onClick={onClick}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick?.() : undefined}
        >
            {children}
        </motion.div>
    );
}
