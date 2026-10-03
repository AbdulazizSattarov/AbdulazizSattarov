// Generates public/audio/whoosh.wav: a short synthesized noise sweep used by
// the TitleCard sound-effect example. Starts at sample 0 (no leading silence).
// Replace it with your own SFX any time.
import { writeFileSync, mkdirSync } from "node:fs";

const sampleRate = 48000;
const seconds = 0.9;
const n = Math.floor(sampleRate * seconds);
const data = new Int16Array(n);

let lp = 0;
for (let i = 0; i < n; i++) {
  const t = i / n;
  const env = Math.sin(Math.PI * Math.pow(t, 0.6)) ** 2; // swell in, fade out
  const cutoff = 0.02 + 0.25 * Math.sin(Math.PI * t); // filter sweep
  lp += cutoff * (Math.random() * 2 - 1 - lp); // one-pole low-pass noise
  data[i] = Math.max(-1, Math.min(1, lp * env * 2.2)) * 32767;
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.byteLength, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.byteLength, 40);

mkdirSync("public/audio", { recursive: true });
writeFileSync("public/audio/whoosh.wav", Buffer.concat([header, Buffer.from(data.buffer)]));
console.log("Wrote public/audio/whoosh.wav");
