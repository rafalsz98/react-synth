#!/usr/bin/env node

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, isAbsolute } from "node:path";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, "..");

const args = process.argv.slice(2);

// Parse flags
const watchMode = args.includes("--watch") || args.includes("-w");
const filteredArgs = args.filter((arg) => arg !== "--watch" && arg !== "-w");

if (filteredArgs.length === 0) {
  console.log(`
🎹 Synth - Live coding music with JSX

Usage: synth [options] <file.tsx>

Options:
  -w, --watch    Watch mode - automatically reload on file changes

Examples:
  npx synth my-song.tsx           Run a synth file once
  npx synth --watch my-song.tsx   Run in watch mode (live coding)

Learn more: https://github.com/synth/synth
`);
  process.exit(0);
}

const userFile = filteredArgs[0];
const filePath = isAbsolute(userFile) ? userFile : resolve(process.cwd(), userFile);

const runnerPath = resolve(packageRoot, "bin", "runner.ts");

const denoArgs = [
  "run",
  "--allow-ffi",
  "--allow-read",
  "--allow-env",
  "--unstable-ffi",
];

if (watchMode) {
  denoArgs.push("--watch=" + filePath);
  console.log("🎵 Starting synth in watch mode...");
  console.log("   Edit your file to hear changes live!\n");
}

denoArgs.push(runnerPath, filePath);

const deno = spawn("deno", denoArgs, {
  stdio: "inherit",
  cwd: packageRoot,
});

deno.on("error", (err) => {
  if (err.code === "ENOENT") {
    console.error("Error: Deno is not installed or not in PATH.");
    console.error("Install Deno: https://deno.land/#installation");
    process.exit(1);
  }
  console.error("Error spawning Deno:", err.message);
  process.exit(1);
});

deno.on("close", (code) => {
  process.exit(code ?? 0);
});

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  deno.kill("SIGINT");
});
