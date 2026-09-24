"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin progress bar at the top of the page during navigation.
 * Similar to NProgress but built with CSS transitions only.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // On route change: complete the bar and hide
    setProgress(100);
    const t = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  // Expose a way to start the bar from link clicks
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http")) return;
      if (target.getAttribute("target") === "_blank") return;

      // Start progress bar
      setVisible(true);
      setProgress(15);

      // Simulate slow crawl
      let p = 15;
      const tick = () => {
        p = p + (90 - p) * 0.08;
        setProgress(p);
        rafRef.current = requestAnimationFrame(tick);
      };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        rafRef.current = requestAnimationFrame(tick);
      }, 100);
    }

    window.addEventListener("click", handleClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleClick, { capture: true });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] origin-left bg-primary transition-all"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        transitionDuration: progress === 100 ? "150ms" : "400ms",
        transitionTimingFunction: progress === 100 ? "ease-out" : "ease",
      }}
    />
  );
}
