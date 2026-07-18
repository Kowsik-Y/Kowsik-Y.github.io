"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    strength?: number;
    as?: any; // Kept for backwards compatibility but not recommended
    href?: string;
    target?: string;
    rel?: string;
    type?: "button" | "submit" | "reset";
    [key: string]: any;
}

export default function MagneticButton({
    children,
    className = "",
    onClick,
    strength = 15,
    as,
    href,
    target,
    rel,
    type = "button",
    ...props
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        
        setPosition({ x: middleX * (strength / 100), y: middleY * (strength / 100) });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    const innerProps = {
        onClick,
        className: `relative z-10 flex items-center justify-center ${className}`,
        ...props
    };

    // If a custom component is passed (Client-side only)
    if (as) {
        const Component = as;
        return (
            <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className="relative cursor-pointer">
                <Component href={href} target={target} rel={rel} {...innerProps}>{children}</Component>
            </motion.div>
        );
    }

    // If an href is passed, use Next Link or standard anchor
    if (href) {
        const isExternal = href.startsWith("http") || href.startsWith("mailto");
        return (
            <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className="relative cursor-pointer">
                {isExternal ? (
                    <a href={href} target={target || "_blank"} rel={rel || "noopener noreferrer"} {...innerProps}>{children}</a>
                ) : (
                    <Link href={href} target={target} rel={rel} {...innerProps}>{children}</Link>
                )}
            </motion.div>
        );
    }

    // Default to button
    return (
        <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className="relative cursor-pointer">
            <button type={type} {...innerProps}>{children}</button>
        </motion.div>
    );
}
