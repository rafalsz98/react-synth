"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";

const BAR_COUNT = 50;

// Client-only rendering helper
const emptySubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

// Generate muted colors across the spectrum
function getBarColor(index: number, total: number): string {
  const hue = (index / total) * 280 + 260; // Purple to pink to orange spectrum
  return `hsl(${hue % 360}, 50%, 45%)`;
}

export function Waveform() {
  const isClient = useIsClient();

  if (!isClient) {
    return <div style={{ height: "200px" }} aria-hidden="true" />;
  }

  return (
    <div
      className="flex items-end justify-center gap-0.5 w-full pointer-events-none select-none"
      style={{ height: "200px" }}
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const wavePosition = (i / BAR_COUNT) * Math.PI * 2;
        const baseHeight = 35 + Math.sin(wavePosition * 2) * 15;

        const heights = [
          baseHeight + Math.sin(wavePosition) * 12,
          baseHeight + 10 + Math.sin(wavePosition + 0.5) * 14,
          baseHeight + Math.sin(wavePosition + 1) * 10,
          baseHeight + 12 + Math.sin(wavePosition + 1.5) * 12,
          baseHeight + Math.sin(wavePosition) * 12,
        ];

        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: "6px",
              background: `linear-gradient(to top, ${getBarColor(i, BAR_COUNT)}, ${getBarColor(i + 8, BAR_COUNT)})`,
              boxShadow: `0 0 8px ${getBarColor(i, BAR_COUNT)}30`,
            }}
            initial={{ height: `${baseHeight}%` }}
            animate={{
              height: heights.map((h) => `${Math.min(75, Math.max(15, h))}%`),
            }}
            transition={{
              duration: 1.8 + (i % 6) * 0.25,
              delay: (i % 10) * 0.1,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
