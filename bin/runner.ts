/**
 * Runner - imports and plays user's synth file
 */
import { playSynth } from "synth";
import { resolve, toFileUrl } from "@std/path";

const filePath = Deno.args[0];
if (!filePath) {
  console.error("No file specified");
  Deno.exit(1);
}

// Convert to absolute file URL for dynamic import
const absolutePath = resolve(Deno.cwd(), filePath);
const fileUrl = toFileUrl(absolutePath).href;

const module = await import(fileUrl);

const Track = module.default;
if (!Track) {
  console.error("File must export a default function component");
  Deno.exit(1);
}

// Call the component to get the synth tree
const tree = Track();

// Play it
await playSynth(tree, { verbose: true });
