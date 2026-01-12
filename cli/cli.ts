import { resolve, toFileUrl } from "@std/path";
import { renderSynth } from "./bootstrap.ts";

// Get the file path from command line
const filePath = Deno.args[0];

if (!filePath) {
  console.log(`
🎹 React Synth - Live coding music with React

Usage: 
  synth <song.tsx>     Run a song with hot reload
`);
  Deno.exit(0);
}

// Convert to absolute file URL for dynamic import
const absolutePath = resolve(Deno.cwd(), filePath);
const fileUrl = toFileUrl(absolutePath).href;

console.log(`🎵 Loading ${filePath}...`);

async function loadAndRender() {
  // Cache-bust to get fresh module
  const module = await import(`${fileUrl}?t=${Date.now()}`);
  renderSynth(module.default);
}

await loadAndRender();
console.log("🎹 Playing track");

// Hot reload
let debounce: number | undefined;
for await (const event of Deno.watchFs(absolutePath)) {
  if (event.kind === "modify") {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      try {
        await loadAndRender();
        console.log("✅ Hot reloaded");
      } catch (e) {
        console.error(
          "❌ Error:",
          e instanceof Error ? e.message : JSON.stringify(e),
        );
      }
    }, 100);
  }
}
