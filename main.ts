import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const SOURCE = "entry.png";
const LIMIT_BYTES = 1048576;
const LIMIT_PX = 1024;

const data = readFileSync(SOURCE);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!data.subarray(0, 8).equals(pngMagic)) {
  throw new Error("entry.png is not a PNG file");
}
if (data.length > LIMIT_BYTES) {
  throw new Error(`entry.png is ${data.length} bytes, over the ${LIMIT_BYTES} byte limit`);
}
if (data.length < 33 || data.toString("ascii", 12, 16) !== "IHDR") {
  throw new Error("entry.png has no IHDR chunk where one is expected");
}
const width = data.readUInt32BE(16);
const height = data.readUInt32BE(20);
const bitDepth = data[24];
const colourType = data[25];
if (width > LIMIT_PX || height > LIMIT_PX) {
  throw new Error(`entry.png is ${width}x${height}, over the ${LIMIT_PX}x${LIMIT_PX} limit`);
}
if (bitDepth !== 8 || colourType !== 2) {
  throw new Error(`entry.png must be 8-bit RGB, got depth ${bitDepth} colour ${colourType}`);
}
const iendAt = data.length - 12;
if (data.toString("ascii", iendAt + 4, iendAt + 8) !== "IEND") {
  throw new Error("entry.png does not end with an IEND chunk");
}
if (data.readUInt32BE(iendAt) !== 0) {
  throw new Error("entry.png IEND chunk has a non-zero length");
}

mkdirSync(OUT_DIR, { recursive: true });
const target = join(OUT_DIR, "entry.png");
copyFileSync(SOURCE, target);
const written = readFileSync(target);
if (!written.equals(data)) {
  throw new Error("copied entry.png differs from the source");
}
writeFileSync(join(OUT_DIR, "entry.json"), JSON.stringify({
  file: "entry.png",
  width,
  height,
  bytes: data.length,
  format: "png",
}, null, 2) + "\n");
console.log(`wrote ${target} (${width}x${height}, ${statSync(target).size} bytes)`);
