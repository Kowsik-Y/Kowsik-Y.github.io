"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface UseScrollSyncOptions {
  onProgress?: (progress: number) => void;
  onEnter?: () => void;
  onLeave?: () => void;
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: number | boolean;
}

export function useScrollSync(options: UseScrollSyncOptions = {}) {
  const {
    onProgress,
    onEnter,
    onLeave,
    trigger,
    start = "top bottom",
    end = "bottom top",
    scrub = 1,
  } = options;

  const progressRef = useRef(0);
  const triggerRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      triggerRef.current = gsap.timeline({
        scrollTrigger: {
          trigger: trigger || undefined,
          start,
          end,
          scrub,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            onProgress?.(self.progress);
          },
          onEnter,
          onLeave,
          onEnterBack: onEnter,
          onLeaveBack: onLeave,
        },
      });
    });

    return () => ctx.revert();
  }, [trigger, start, end, scrub, onProgress, onEnter, onLeave]);

  return { progress: progressRef.current, timeline: triggerRef.current };
}

export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollY(y);
      setScrollProgress(max > 0 ? y / max : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return { scrollY, scrollProgress };
}

import { useState } from "react";