#!/usr/bin/env node
import { resolve } from "path";
import {
  createServer,
  type ModuleNode,
  normalizePath,
  type ViteDevServer,
} from "vite";
import { JSDOM } from "jsdom";
import { type ComponentType, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

// Create fake DOM for React
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>');

// Polyfill globals that React needs
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;

let root: Root | null = null;

function renderSong(SongComponent: ComponentType): void {
  const container = document.getElementById("root")!;

  if (!root) {
    root = createRoot(container);
  }

  root.render(createElement(SongComponent));
}

async function main(): Promise<void> {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log(`
🎹 React Synth - Live coding music with React

Usage: 
  npx react-synth <song.tsx>     Run a song with hot reload
`);
    process.exit(0);
  }

  // Use normalizePath for consistent forward slashes (Vite uses forward slashes internally)
  const absolutePath = normalizePath(resolve(process.cwd(), filePath));
  console.log(`🎵 Loading ${filePath}...`);

  const vite: ViteDevServer = await createServer({
    configFile: false,
    root: process.cwd(),
    server: {
      middlewareMode: true,
      hmr: true,
    },
    appType: "custom",
    optimizeDeps: {
      exclude: ["@react-synth/synth", "node-web-audio-api"],
    },
    ssr: {
      external: ["node-web-audio-api", "jsdom"],
      noExternal: ["@react-synth/synth", "tonal"],
    },
    esbuild: {
      jsx: "automatic",
    },
    logLevel: "info",
  });

  let currentModuleUrl: string | null = null;

  async function loadSong(): Promise<void> {
    const url = `${absolutePath}?t=${Date.now()}`;

    // Invalidate the previous module if it exists
    if (currentModuleUrl) {
      const mod = await vite.moduleGraph.getModuleByUrl(currentModuleUrl);
      if (mod) {
        invalidateModuleAndImporters(mod);
      }
    }

    currentModuleUrl = url;
    const module = await vite.ssrLoadModule(url);

    // Auto-render the default export if it's a component
    if (module.default && typeof module.default === "function") {
      renderSong(module.default);
    } else {
      console.warn(
        "⚠️  No default export found. Song file should export a React component as default.",
      );
    }
  }

  // Recursively invalidate a module and all its importers
  function invalidateModuleAndImporters(mod: ModuleNode): void {
    vite.moduleGraph.invalidateModule(mod);
    for (const importer of mod.importers) {
      invalidateModuleAndImporters(importer);
    }
  }

  // Collect all dependencies (imports) of a module recursively
  function collectDependencies(
    mod: ModuleNode,
    visited: Set<string> = new Set(),
  ): Set<string> {
    if (mod.file) {
      visited.add(mod.file);
    }

    for (const imported of mod.ssrImportedModules) {
      if (imported.file && !visited.has(imported.file)) {
        collectDependencies(imported, visited);
      }
    }

    return visited;
  }

  // Check if a file is a dependency of the song module
  function isDependencyOfSong(changedFile: string): boolean {
    const songMod = vite.moduleGraph.getModulesByFile(absolutePath);
    if (!songMod || songMod.size === 0) {
      return false;
    }

    for (const mod of songMod) {
      const deps = collectDependencies(mod);
      if (deps.has(changedFile)) {
        return true;
      }
    }

    return false;
  }

  await loadSong();
  console.log("🎹 Playing track");
  console.log("   Watching for changes...");

  let debounce: ReturnType<typeof setTimeout> | undefined;

  vite.watcher.on("change", async (changedPath) => {
    // Normalize to forward slashes to match Vite's module graph
    const normalizedChanged = normalizePath(resolve(changedPath));

    // Reload if the song file itself changed, or any of its dependencies
    if (!isDependencyOfSong(normalizedChanged)) {
      return;
    }

    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      try {
        await loadSong();
        console.log(`✅ Hot reloaded (${changedPath})`);
      } catch (e) {
        console.error("❌ Error:", e instanceof Error ? e.message : String(e));
      }
    }, 50);
  });

  process.on("SIGINT", async () => {
    console.log("\n👋 Stopping...");
    await vite.close();
    process.exit(0);
  });
}

main().catch(console.error);
