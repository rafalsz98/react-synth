"use client";

import React, { useState, type ReactNode } from "react";
import { Play, Square } from "lucide-react";

type CodePlayerProps = {
  highlighted: ReactNode;
  filename?: string;
};

export function CodePlayer({
  highlighted,
  filename = "song.tsx",
}: CodePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="rounded-xl border border-fd-border bg-fd-card overflow-hidden shadow-lg w-full max-w-2xl mx-auto">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-fd-border bg-fd-muted/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <div className="text-xs font-mono text-fd-muted-foreground">
          {filename}
        </div>
        <div className="w-10" />
      </div>

      {/* Code content */}
      <div className="relative">
        <div className="p-6 overflow-x-auto text-sm leading-relaxed text-left [&_pre]:bg-transparent! [&_code]:bg-transparent! [&_pre]:m-0">
          {highlighted}
        </div>

        {/* <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute bottom-6 right-6 p-3 rounded-full bg-fd-primary text-fd-primary-foreground shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center justify-center"
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            <Square className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current" />
          )}
        </button> */}
      </div>
    </div>
  );
}
