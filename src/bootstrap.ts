import { JSDOM } from "jsdom";
import React from "react";
import { createRoot, type Root } from "react-dom/client";

// Create fake DOM for React
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>');

// Polyfill globals that React needs
// deno-lint-ignore no-explicit-any
(globalThis as any).document = dom.window.document;
// deno-lint-ignore no-explicit-any
(globalThis as any).window = dom.window;

let root: Root | null = null;

export function renderSynth(Component: React.FC): void {
  const container = document.getElementById("root")!;

  if (!root) {
    root = createRoot(container);
  }

  root.render(React.createElement(Component));
}
