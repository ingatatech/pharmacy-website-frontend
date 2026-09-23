"use client";

import { useEffect, useState } from "react";

export function LegalToc({ sections }: { sections: { id: string; label: string }[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    // IntersectionObserver's narrow trigger band can skip past short
    // sections entirely on a fast scroll and leave the highlight stuck. A
    // simple "which section's top has scrolled past the reading line"
    // check on every scroll is more robust for a list of short sections.
    function updateActive() {
      const threshold = 140;
      let current = elements[0]?.id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= threshold) {
          current = el.id;
        }
      }
      if (current) setActiveId(current);
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [sections]);

  return (
    <nav className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">On this page</p>
      <ul className="mt-4 space-y-0.5 border-l border-slate-200">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block border-l-2 py-1.5 pl-4 text-sm transition-colors duration-200 ${
                activeId === id
                  ? "border-teal-700 font-medium text-teal-800"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
