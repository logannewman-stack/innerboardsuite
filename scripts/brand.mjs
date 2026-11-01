// The colour rule, enforced on the built site: every colour the site paints is one of the hex codes in the client's
// design for The Practice (November 1, 2026; the client: "only use the hex codes in the file"), at full strength or
// as the design's own tints. The palette below is every code that design uses, its light and dark modes and its
// drawn details included. Images (the photos, the marks, the book cover) keep their own colours and are not read.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const PALETTE = new Set([
  // The design's tokens: navy, bone, paper, gold, white, muted, line, gold soft, on navy muted, OS blue and OS ink.
  "1b2332", "e7dccf", "f3ede5", "b08d57", "fbf8f3", "5d6270", "d8ccbc", "cbb089", "b4b8c2", "213b60", "2c4e7e",
  // Its dark mode.
  "141a26", "212a3b", "efe7dc", "a7acb8", "2e3849", "c6a46e", "d6bc92", "0e131c", "1a2f4d", "8faad4",
  // The app previews, the score card, the diagrams and the drawn panels, as the design colours them.
  "151a24", "262b36", "2e3a52", "2e4c78", "323c51", "3a3127", "3c4354", "4a6a9a", "545c40", "6b7080", "8a6a58",
  "8a8f9c", "8e6e3c", "8e7a60", "b59e78", "b9a98d", "bfae92", "cdbea6", "d3c6b0", "d8c8ae", "ddae7c", "e2d6c6",
  "e3b47a", "e6d2a8", "e9dfcf", "e9eef4", "eae1d0", "eae1d3", "eee6da", "efe6d8", "f0e9df", "f2d7a1", "fff8e6",
  "ffffff", "000000"
]);
const NAMED = /(?<![\w-])(white|black|gr[ae]y|silver|red|blue|green|navy|teal|gold|orange|tan|beige|ivory|wheat|linen|brown|maroon|olive|purple|pink)(?![\w-])/gi;

const root = new URL("../dist", import.meta.url).pathname;
const problems = new Map();
const note = (msg, path) => {
  const where = problems.get(msg) || new Set();
  where.add(relative(root, path));
  problems.set(msg, where);
};

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.css$/.test(path)) css(readFileSync(path, "utf8"), path);
    else if (/\.(html|svg)$/.test(path)) markup(readFileSync(path, "utf8"), path);
  }
}

// The CSS inside a page: <style> blocks, style attributes and SVG paint attributes.
function markup(text, path) {
  for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css(m[1], path);
  for (const m of text.matchAll(/\sstyle="([^"]*)"/gi)) css(`x{${m[1]}}`, path);
  for (const m of text.matchAll(/\s(fill|stroke|stop-color|color|flood-color)="([^"]*)"/gi)) value(m[1], m[2], path);
}

function css(text, path) {
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const b of text.matchAll(/\{([^{}]*)\}/g)) for (const m of b[1].matchAll(/([-\w]+)\s*:\s*([^;]+)/g)) value(m[1].toLowerCase(), m[2], path);
}

function value(prop, v, path) {
  if (/^(font|grid|transition|animation|will-change|content|counter|quotes|src)/.test(prop)) return;
  for (const m of v.matchAll(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi)) {
    let hex = m[1].toLowerCase();
    if (hex.length <= 4) hex = [...hex.slice(0, 3)].map((c) => c + c).join("");
    colour(hex.slice(0, 6), path);
  }
  for (const m of v.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi)) colour([m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join(""), path);
  if (/hsla?\(|color-mix\(/i.test(v)) note(`a colour outside the palette's notation (${prop})`, path);
  if (!/^--/.test(prop)) for (const m of v.matchAll(NAMED)) note(`the colour name "${m[1]}" (${prop})`, path);
}

function colour(hex, path) {
  if (!PALETTE.has(hex)) note(`#${hex} is not in the design's palette`, path);
}

walk(root);
if (problems.size) {
  for (const [msg, where] of problems) console.error(`${msg}: ${[...where].slice(0, 3).join(", ")}`);
  process.exit(1);
}
console.log("brand: every colour is from the design's palette");
