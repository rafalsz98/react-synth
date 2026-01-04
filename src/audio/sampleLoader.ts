/**
 * Sample Loader - Loads and caches audio samples from disk
 */
import type { AudioContext as AudioContextType } from "node-web-audio-api";

const sampleCache = new Map<string, AudioBuffer>();

/**
 * Get the file path for a sample name
 */
function getSamplePath(name: string): string {
  const baseDir = new URL("../samples", import.meta.url).pathname;
  // On Windows, remove leading slash from /C:/... paths
  const normalizedDir =
    Deno.build.os === "windows" && baseDir.startsWith("/")
      ? baseDir.slice(1)
      : baseDir;
  return `${normalizedDir}/${name}.flac`;
}

/**
 * Load a sample by name and return its AudioBuffer
 * Results are cached for performance
 */
export async function loadSample(
  audioContext: AudioContextType,
  name: string,
): Promise<AudioBuffer> {
  if (sampleCache.has(name)) {
    return sampleCache.get(name)!;
  }

  const path = getSamplePath(name);
  const fileData = await Deno.readFile(path);
  const audioBuffer = await audioContext.decodeAudioData(fileData.buffer);
  sampleCache.set(name, audioBuffer);
  return audioBuffer;
}
