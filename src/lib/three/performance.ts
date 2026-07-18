"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function usePerformanceMonitor() {
  const statsRef = useRef<{
    fps: number;
    frameTime: number;
    memory: number;
    drawCalls: number;
    triangles: number;
  }>({
    fps: 60,
    frameTime: 16.67,
    memory: 0,
    drawCalls: 0,
    triangles: 0,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const update = useCallback(() => {
    frameCountRef.current++;
    const now = performance.now();
    const delta = now - lastTimeRef.current;

    if (delta >= 1000) {
      statsRef.current.fps = Math.round((frameCountRef.current * 1000) / delta);
      statsRef.current.frameTime = delta / frameCountRef.current;
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  }, []);

  return { stats: statsRef.current, update };
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export function useLowEndDevice(): boolean {
  const [lowEnd, setLowEnd] = useState(false);

  useEffect(() => {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    const isLowEnd = (memory && memory < 4) || (cores && cores < 4) || connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
    setLowEnd(isLowEnd);
  }, []);

  return lowEnd;
}

export function getOptimalSettings() {
  const lowEnd = useLowEndDevice();
  const reduced = useReducedMotion();

  return useMemo(() => ({
    particleCount: lowEnd ? 1000 : reduced ? 2000 : 5000,
    dpr: lowEnd ? 1 : window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio,
    enablePostprocessing: !lowEnd && !reduced,
    enableShadows: !lowEnd,
    shadowMapSize: lowEnd ? 512 : 1024,
    frustumCulled: true,
    instancing: true,
  }), [lowEnd, reduced]);
}

import { useRef, useCallback, useState, useEffect } from "react";