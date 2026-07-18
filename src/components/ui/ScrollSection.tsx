"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  pin?: boolean;
  pinSpacing?: boolean;
  start?: string;
  end?: string;
  scrub?: number | boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

export default function ScrollSection({
  children,
  className = "",
  id,
}: ScrollSectionProps) {
  // GSAP pinning and ScrollTrigger was causing severe layout thrashing, overlapping, 
  // and blank pages due to conflicting wrapper divs and fixed/absolute positioning.
  // We're replacing it with a clean pass-through. 
  // Background canvases (like HeroCanvas) already use CSS 'fixed' or 'absolute' positioning, 
  // which works perfectly without JS-based pinning.
  // Entrance animations are handled elegantly by the <FadeIn> component using framer-motion.
  return (
    <div id={id} className={className}>
      {children}
    </div>
  );
}