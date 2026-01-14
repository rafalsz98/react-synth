import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { dirname, join } from "path";
import type { AudioContext as AudioContextType } from "node-web-audio-api";

const sampleCache = new Map<string, AudioBuffer>();

// Resolve samples directory from the package location
function getSamplesDir(): string {
  try {
    // Use createRequire to find the package location
    const require = createRequire(import.meta.url);
    const packageMain = require.resolve("@react-synth/synth");
    const packageDir = dirname(packageMain);
    // In the published package, samples are at src/samples relative to package root
    // dist/index.js -> ../src/samples
    return join(packageDir, "..", "src", "samples");
  } catch {
    // Fallback: resolve relative to this file (works during development)
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFile);
    return join(currentDir, "..", "samples");
  }
}

const samplesDir = getSamplesDir();

function getSamplePath(name: string): string {
  return join(samplesDir, `${name}.flac`);
}

export async function loadSample(
  audioContext: AudioContextType,
  name: string,
): Promise<AudioBuffer> {
  if (sampleCache.has(name)) {
    return sampleCache.get(name)!;
  }

  const path = getSamplePath(name);
  const fileData = await readFile(path);
  const audioBuffer = await audioContext.decodeAudioData(
    fileData.buffer as ArrayBuffer,
  );
  sampleCache.set(name, audioBuffer);
  return audioBuffer;
}
