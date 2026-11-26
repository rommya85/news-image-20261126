// news-image-20261126 — one-day world news image.
// The front page is rendered offline and shipped as entry.png; this program
// copies it to the output directory and verifies it is a whole PNG inside
// the competition limits before writing: PNG signature, size and dimensions,
// and the trailing IEND chunk that proves the file is not truncated.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const dst = join(outDir, "entry.png");

const bytes = readFileSync(src);
if (
  bytes.length < 8 ||
  bytes[0] !== 0x89 ||
  bytes[1] !== 0x50 ||
  bytes[2] !== 0x4e ||
  bytes[3] !== 0x47
) {
  throw new Error("entry.png is not a PNG file");
}
if (bytes.length > 1048576) {
  throw new Error("entry.png exceeds the 1 MiB limit");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error("entry.png exceeds 1024x1024 pixels");
}
// A whole PNG ends with the IEND chunk: length 0, type "IEND", CRC ae426082.
const iend = bytes.subarray(bytes.length - 12);
if (
  iend[0] !== 0x00 ||
  iend[1] !== 0x00 ||
  iend[2] !== 0x00 ||
  iend[3] !== 0x00 ||
  iend[4] !== 0x49 ||
  iend[5] !== 0x45 ||
  iend[6] !== 0x4e ||
  iend[7] !== 0x44 ||
  iend[8] !== 0xae ||
  iend[9] !== 0x42 ||
  iend[10] !== 0x60 ||
  iend[11] !== 0x82
) {
  throw new Error("entry.png is truncated: missing IEND chunk");
}
mkdirSync(outDir, { recursive: true });
copyFileSync(src, dst);
console.log(`wrote ${dst} (${bytes.length} bytes, ${width}x${height})`);
