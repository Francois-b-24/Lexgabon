"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function CustomCursor() {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const onMove = (e: MouseEvent) =>
      setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    const over = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("a,button,[role='button']")) setHover(true);
    };
    const out = () => setHover(false);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  if (reduce || !fine) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
      animate={{ x: pos.x - 16, y: pos.y - 16, scale: hover ? 1.6 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <div className="h-8 w-8 rounded-full border border-lg-gold/30 bg-lg-navy/20" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
    </motion.div>
  );
}
