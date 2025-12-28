/**
 * Bootstrap React in Deno/Node.js environment
 * Creates a fake DOM so react-dom can work
 */
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

/**
 * Render a React component as a synth
 * The component tree will be rendered to a fake DOM,
 * but useEffect hooks will trigger real audio
 */
export function renderSynth(Component: React.FC): void {
  const container = document.getElementById("root")!;

  if (!root) {
    root = createRoot(container);
  }

  root.render(React.createElement(Component));
}

/**
 * Cleanup the synth renderer
 */
export function unmountSynth(): void {
  if (root) {
    root.unmount();
    root = null;
  }
}
