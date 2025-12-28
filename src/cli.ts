/**
 * React Synth CLI
 *
 * Usage: deno run --allow-read --allow-env --allow-sys src/cli.ts <song.tsx>
 */
import { resolve, toFileUrl } from "@std/path";
import { renderSynth } from "./bootstrap.ts";

// Get the file path from command line
const filePath = Deno.args[0];

if (!filePath) {
  console.log(`
🎹 React Synth - Live coding music with React

Usage: 
  deno task play <song.tsx>     Run a song once
  deno task dev                 Run with hot reload

Example:
  deno task play examples/simple.tsx
`);
  Deno.exit(0);
}

// Convert to absolute file URL for dynamic import
const absolutePath = resolve(Deno.cwd(), filePath);
const fileUrl = toFileUrl(absolutePath).href;

console.log(`🎵 Loading ${filePath}...`);

try {
  // Dynamically import the song file
  const module = await import(fileUrl);

  const Song = module.default;
  if (!Song) {
    console.error("❌ File must export a default function component");
    Deno.exit(1);
  }

  // Render the React component
  renderSynth(Song);

  console.log(`
🎹 React Synth is playing!
   Press Ctrl+C to stop
`);

  // Keep the process alive
  await new Promise(() => {
    // Never resolves - keeps the process running
    setInterval(() => {}, 1000);
  });
} catch (error) {
  console.error("❌ Error loading song:", error);
  Deno.exit(1);
}
