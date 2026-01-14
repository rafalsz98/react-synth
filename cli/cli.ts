#!/usr/bin/env node
import { dirname, resolve } from "path";
import { pathToFileURL } from "url";
import { mkdir, unlink, writeFile } from "fs/promises";
import chokidar from "chokidar";
import * as esbuild from "esbuild";
import { resetScheduler } from "@react-synth/synth";

async function main(): Promise<void> {
  // Get the file path from command line
  const filePath = process.argv[2];

  if (!filePath) {
    console.log(`
🎹 React Synth - Live coding music with React

Usage: 
  react-synth <song.tsx>     Run a song with hot reload
  npx tsx cli/cli.ts <song.tsx>
`);
    process.exit(0);
  }

  // Convert to absolute path
  const absolutePath = resolve(process.cwd(), filePath);
  const songDir = dirname(absolutePath);

  console.log(`🎵 Loading ${filePath}...`);

  // Create a cache directory in the song's folder for module resolution to work
  const cacheDir = resolve(songDir, ".react-synth");
  await mkdir(cacheDir, { recursive: true });

  async function transpileAndRun(): Promise<void> {
    // Transpile TSX to JS using esbuild
    const result = await esbuild.build({
      entryPoints: [absolutePath],
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node18",
      write: false,
      // Resolve modules from the song's directory
      nodePaths: [resolve(songDir, "node_modules")],
      external: [
        "@react-synth/synth",
        // Externalize native modules and packages with dynamic requires
        "node-web-audio-api",
        "jsdom",
        "tonal",
        // React needs to be externalized to share instances
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
      ],
      jsx: "automatic",
    });

    // Write transpiled code to cache dir (in song's folder for module resolution)
    const tempFile = resolve(cacheDir, `song-${Date.now()}.mjs`);
    await writeFile(tempFile, result.outputFiles[0].text);

    // Import the transpiled module
    const fileUrl = pathToFileURL(tempFile).href;
    await import(fileUrl);

    // Clean up temp file after import
    await unlink(tempFile).catch(() => {});
  }

  await transpileAndRun();
  console.log("🎹 Playing track");

  // Hot reload using chokidar
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const watcher = chokidar.watch(absolutePath, {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("change", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        // Reset the scheduler before reloading to stop old loops
        resetScheduler(120); // BPM will be overwritten by the Track component
        await transpileAndRun();
        console.log("✅ Hot reloaded");
      } catch (e) {
        console.error(
          "❌ Error:",
          e instanceof Error ? e.message : JSON.stringify(e),
        );
      }
    }, 100);
  });

  // Keep the process running
  process.on("SIGINT", () => {
    console.log("\n👋 Stopping...");
    watcher.close();
    process.exit(0);
  });
}

main().catch(console.error);
