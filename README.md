[![make.fun](https://make.fun/badge.svg)](https://make.fun/bounty/news-image-20261126/leaderboard)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

# Sum up 26 November's world news in one image — v3

Entry for the [make.fun bounty](https://make.fun/bounty/news-image-20261126/leaderboard):
a program that writes a single 1024×1024 picture summing up the world news
of 26 November 2026.

v3 packs the day denser than v2: **35 verified stories** (3 hero stories, 10
numbered cards, 22 more in the "also on" list) across 7 regions, a dotted
world map with numbered pins, a UTC timeline of the day's six key moments, a
six-number stat strip, and a status chip (CONFIRMED / OFFICIAL / CLAIMED /
LEAKED / REPORTED) on every picture card. A DATE CHECK box flags the one
story whose date is easy to get wrong.

## How it runs

`main.ts` (Node, no dependencies, no network) reads the finished picture
`entry.png` from its own directory, validates it (PNG signature, ≤ 1 MiB,
1024×1024, 8-bit RGB, IEND last with length 0), and copies it byte-for-byte
to `$MAKEFUN_OUTPUT_DIR/entry.png`, plus an `entry.json` sidecar. Same input,
same output, every run.

## Files

- `main.ts` — the entry program
- `entry.png` — the v3 picture (578,918 bytes)
- `LICENSE` — MIT
