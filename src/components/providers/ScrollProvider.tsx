"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", refresh);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}