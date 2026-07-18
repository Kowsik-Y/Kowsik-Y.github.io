"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface ImageRevealProps {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    aspectRatio?: "video" | "square" | "portrait" | "auto";
    objectFit?: "cover" | "contain";
    ariaDescription?: string;
}

export default function ImageReveal({
    src,
    alt,
    className = "",
    containerClassName = "",
    aspectRatio = "video",
    objectFit = "cover",
    ariaDescription,
}: ImageRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Subtle parallax effect for the image (only apply if cover)
    const y = useTransform(scrollYProgress, [0, 1], objectFit === "cover" ? ["-10%", "10%"] : ["0%", "0%"]);

    const aspectClasses = {
        video: "aspect-video",
        square: "aspect-square",
        portrait: "aspect-[3/4]",
        auto: "",
    };

    return (
        <div 
            ref={containerRef}
            className={`relative overflow-hidden rounded-2xl group ${aspectClasses[aspectRatio]} ${containerClassName}`}
        >
            <motion.div 
                className="absolute inset-0 z-10 bg-card origin-top"
                initial={{ scaleY: 1 }}
                whileInView={{ scaleY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.div 
                className="absolute inset-0 w-full h-full flex items-center justify-center"
                style={{ y }}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    loading="eager"
                    className={`transition-transform duration-1000 group-hover:scale-105 ${objectFit === "cover" ? "object-cover" : "object-contain"} ${className}`}
                    unoptimized
                    aria-description={ariaDescription}
                />
            </motion.div>
            
            {/* Inner shadow/border for crisp look */}
            <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] pointer-events-none z-20" />
        </div>
    );
}
