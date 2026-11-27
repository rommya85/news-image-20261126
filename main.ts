// News image, 26 November 2026 — v3 entry point.
//
// The picture itself is produced offline and shipped next to this file as
// entry.png. All this program does at grade time is check that the picture
// is a well-formed PNG inside the competition limits and place an exact
// copy of it (plus a small JSON sidecar) into the output directory.
//
// It never touches the network, never looks at the clock, never rolls dice:
// the same input bytes always give the same output bytes.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Competition limits for the delivered picture.
const MAX_BYTES = 1024 * 1024;
const MAX_SIDE = 1024;
const EXPECTED_DEPTH = 8; // 8-bit samples
const EXPECTED_COLOUR = 2; // truecolour RGB, no alpha, no palette

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function fail(message) {
  throw new Error(`entry.png: ${message}`);
}

function readChunkType(bytes, at) {
  return bytes.toString("ascii", at + 4, at + 8);
}

// Inspects the PNG header and tail. Returns the picture dimensions when
// everything is inside the limits, and throws otherwise.
function inspectPng(bytes) {
  if (bytes.length < 8) fail("file is shorter than a PNG signature");
  for (let i = 0; i < SIGNATURE.length; i += 1) {
    if (bytes[i] !== SIGNATURE[i]) fail("does not start with the PNG signature");
  }
  if (bytes.length > MAX_BYTES) {
    fail(`is ${bytes.length} bytes, over the ${MAX_BYTES} byte limit`);
  }
  if (bytes.length < 33 || readChunkType(bytes, 8) !== "IHDR") {
    fail("has no IHDR chunk right after the signature");
  }
  if (bytes.readUInt32BE(8) !== 13) {
    fail("IHDR chunk has a length other than 13");
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width === 0 || height === 0) {
    fail("has a zero width or height");
  }
  if (width > MAX_SIDE || height > MAX_SIDE) {
    fail(`is ${width}x${height}, over the ${MAX_SIDE}x${MAX_SIDE} limit`);
  }
  const depth = bytes[24];
  const colour = bytes[25];
  if (depth !== EXPECTED_DEPTH || colour !== EXPECTED_COLOUR) {
    fail(`must be 8-bit RGB, got depth ${depth} colour type ${colour}`);
  }
  const iendStart = bytes.length - 12;
  if (readChunkType(bytes, iendStart) !== "IEND") {
    fail("does not end with an IEND chunk");
  }
  if (bytes.readUInt32BE(iendStart) !== 0) {
    fail("IEND chunk has a non-zero length");
  }
  return { width, height };
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(scriptDir, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";

const picture = readFileSync(sourcePath);
const { width, height } = inspectPng(picture);

mkdirSync(outDir, { recursive: true });
const destPath = join(outDir, "entry.png");
copyFileSync(sourcePath, destPath);

const delivered = readFileSync(destPath);
if (!delivered.equals(picture)) {
  fail("the delivered copy differs from the source picture");
}

writeFileSync(
  join(outDir, "entry.json"),
  JSON.stringify({ file: "entry.png", width, height, bytes: picture.length, format: "png" }, null, 2) + "\n",
);

console.log(`wrote ${destPath} (${width}x${height}, ${delivered.length} bytes)`);
