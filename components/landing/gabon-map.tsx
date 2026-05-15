"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useId, useRef } from "react";

/**
 * Contour du Gabon (projection plate simplifiée) dérivé des données
 * Natural Earth (ne_50m_admin_0_countries, domaine public).
 */
const GABON_PATH =
  "M 713.3 66.0 L 701.0 101.3 L 694.2 141.1 L 703.0 169.4 L 703.8 191.2 L 702.0 199.5 L 724.8 196.7 L 775.8 179.9 L 826.3 177.9 L 851.6 188.7 L 865.5 222.6 L 879.4 250.2 L 880.1 263.4 L 866.5 283.5 L 858.0 296.1 L 829.4 303.6 L 820.3 319.5 L 804.2 340.5 L 800.6 371.0 L 796.1 411.7 L 826.7 421.5 L 838.3 434.9 L 869.8 450.5 L 885.9 465.8 L 881.6 498.8 L 878.6 543.4 L 883.2 588.6 L 875.5 615.0 L 878.5 632.2 L 869.0 662.7 L 853.3 674.6 L 846.1 700.7 L 840.4 713.2 L 845.8 726.2 L 829.4 742.7 L 800.1 742.4 L 800.2 729.1 L 793.4 715.9 L 777.7 694.6 L 760.8 715.1 L 722.6 733.6 L 669.2 720.2 L 650.6 683.6 L 628.5 655.3 L 610.5 649.1 L 587.4 664.0 L 589.1 681.4 L 594.2 690.8 L 590.5 710.3 L 533.6 734.7 L 516.9 724.8 L 484.3 732.1 L 466.5 724.5 L 462.1 732.4 L 464.9 772.5 L 456.6 796.7 L 476.8 804.0 L 489.1 818.1 L 481.5 829.8 L 482.6 846.5 L 507.4 862.0 L 513.9 871.9 L 504.4 890.6 L 500.7 905.4 L 506.6 917.9 L 493.0 921.5 L 478.3 920.3 L 451.7 896.7 L 412.3 921.6 L 397.0 954.5 L 370.3 917.4 L 325.5 878.8 L 282.6 822.5 L 196.7 750.2 L 197.3 743.7 L 236.9 758.5 L 225.8 746.0 L 198.0 734.8 L 176.9 728.1 L 169.5 708.0 L 144.4 678.4 L 129.3 660.2 L 156.2 668.9 L 156.3 659.0 L 124.5 648.8 L 123.4 634.4 L 93.4 583.6 L 132.2 620.6 L 145.0 621.0 L 158.9 609.4 L 143.7 605.7 L 128.9 603.5 L 136.3 575.7 L 129.0 581.0 L 115.4 584.1 L 77.1 538.7 L 67.6 520.3 L 42.2 468.4 L 59.5 485.6 L 84.9 474.8 L 97.6 473.3 L 129.0 433.4 L 133.2 365.1 L 137.5 331.8 L 142.1 346.1 L 154.1 358.7 L 193.6 369.6 L 204.4 363.7 L 223.7 349.9 L 165.5 338.8 L 143.9 310.9 L 133.9 292.7 L 164.4 285.7 L 173.5 299.0 L 177.0 289.7 L 169.7 237.1 L 178.6 229.0 L 188.6 224.1 L 200.9 232.1 L 211.4 237.8 L 224.0 240.6 L 236.0 235.2 L 277.9 235.4 L 357.4 235.6 L 427.0 235.9 L 426.8 190.9 L 426.4 127.6 L 426.1 65.2 L 429.7 51.4 L 459.7 45.5 L 539.7 47.6 L 577.0 46.4 L 612.1 50.9 L 651.0 53.6 L 702.6 52.1 L 713.3 66.0 Z";

/** Libreville (capitale), WGS84 — même projection que le tracé */
function librevilleSvg(): [number, number] {
  const lon = 9.4542;
  const lat = 0.4162;
  const minLon = 8.703125;
  const maxLon = 14.480566;
  const minLat = -3.916309;
  const maxLat = 2.302197;
  const w = maxLon - minLon;
  const h = maxLat - minLat;
  const pad = 0.05;
  const scale = 1000 / (Math.max(w, h) * (1 + 2 * pad));
  const ox = minLon - w * pad;
  const oy = maxLat + h * pad;
  return [(lon - ox) * scale, (oy - lat) * scale];
}

const [LIBREVILLE_CX, LIBREVILLE_CY] = librevilleSvg();

export function GabonMap() {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const filterId = `gabon-glow-${uid}`;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    /** Fenêtre large : le tracé évolue sur tout le passage du bloc dans le viewport */
    offset: ["start 0.94", "end 0.06"],
  });

  /** Hors animation scroll : progression figée à 1 (carte entièrement visible) */
  const staticProgress = useMotionValue(1);
  const scrollSource = reduce ? staticProgress : scrollYProgress;

  /** Léger amortissement pour que le trait reste lisible même au scroll rapide */
  const drawProgress = useSpring(scrollSource, {
    stiffness: reduce ? 999 : 44,
    damping: reduce ? 90 : 18,
    mass: 0.72,
    restDelta: 0.001,
  });

  const pathLength = useTransform(drawProgress, [0, 1], reduce ? [1, 1] : [0, 1]);
  const fillOpacity = useTransform(
    drawProgress,
    reduce ? [0, 1] : [0, 0.34, 0.52, 0.72, 1],
    reduce ? [1, 1] : [0, 0.45, 1, 1, 0],
  );
  const dotOpacity = useTransform(
    drawProgress,
    reduce ? [0, 1] : [0, 0.48, 0.62, 0.82, 1],
    reduce ? [1, 1] : [0, 0, 1, 1, 0],
  );
  const dotScale = useTransform(
    drawProgress,
    reduce ? [0, 1] : [0, 0.52, 0.68, 0.88, 1],
    reduce ? [1, 1] : [0.82, 0.82, 1, 1, 0.88],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-[min(480px,58vw)] w-[min(480px,58vw)] opacity-[0.94]"
    >
      <svg
        viewBox="0 0 900 960"
        className="h-full w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Carte stylisée du Gabon, capitale Libreville"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={GABON_PATH}
          fill="rgba(196, 154, 42, 0.1)"
          stroke="#C49A2A"
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          filter={`url(#${filterId})`}
          style={{ pathLength, fillOpacity }}
        />

        <motion.g
          pointerEvents="auto"
          initial={false}
          style={{
            opacity: dotOpacity,
            scale: dotScale,
            transformOrigin: `${LIBREVILLE_CX}px ${LIBREVILLE_CY}px`,
            transformBox: "fill-box",
          }}
        >
          <circle
            cx={LIBREVILLE_CX}
            cy={LIBREVILLE_CY}
            r="11"
            fill="rgba(11, 31, 58, 0.4)"
            className="pointer-events-none"
          />
          <circle
            cx={LIBREVILLE_CX}
            cy={LIBREVILLE_CY}
            r="6"
            fill="#C49A2A"
            stroke="rgba(245, 241, 232, 0.45)"
            strokeWidth="1.5"
            className="cursor-default"
          >
            <title>Libreville — capitale du Gabon</title>
          </circle>
        </motion.g>
      </svg>
    </div>
  );
}
