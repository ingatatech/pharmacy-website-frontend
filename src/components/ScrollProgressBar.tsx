"use client";

import { useEffect, useState } from "react";

// A thin bar fixed to the very top of the viewport, above the header, that
// fills left-to-right as the page scrolls — same gold used for the navbar
// link hover/active underline (Navbar.tsx), so it reads as part of the same
// brand accent rather than a new color.
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden="true">
      <div className="h-full bg-gold" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}
