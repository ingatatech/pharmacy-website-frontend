"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Types `text` out one character at a time, with a gold caret that blinks
// while idle (before typing starts, and again once it finishes) and stays
// solid while actively "writing" — the same distinction a real text-input
// cursor makes between busy and waiting. Renders the full text a second
// time, visually hidden, so screen readers get the real content instead of
// a stream of partial updates (the animated copy is aria-hidden).
export function TypewriterText({
  text,
  startDelay = 0,
  speed = 35,
  onDone,
  cursorClassName = "bg-gold",
  keepCursorWhenDone = true,
}: {
  text: string;
  startDelay?: number;
  speed?: number;
  onDone?: () => void;
  cursorClassName?: string;
  /** false hands the caret off to whatever types next (e.g. headline -> subheading) instead of leaving it lingering here. */
  keepCursorWhenDone?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (prefersReducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(text.length);
      setTyping(false);
      setDone(true);
      onDoneRef.current?.();
      return;
    }

    setCount(0);
    setTyping(false);
    setDone(false);
    let index = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const startTimeout = setTimeout(() => {
      setTyping(true);
      intervalId = setInterval(() => {
        index += 1;
        setCount(index);
        if (index >= text.length) {
          if (intervalId) clearInterval(intervalId);
          setTyping(false);
          setDone(true);
          onDoneRef.current?.();
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, startDelay, speed, prefersReducedMotion]);

  return (
    <>
      <span aria-hidden="true">
        {text.slice(0, count)}
        {(!done || keepCursorWhenDone) && (
          <span
            className={`ml-0.5 inline-block h-[0.85em] w-[3px] shrink-0 translate-y-[0.08em] align-middle ${cursorClassName} ${
              typing ? "" : "typewriter-cursor-idle"
            }`}
          />
        )}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
