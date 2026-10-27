// The colour rule from the InnerBoard brand book (v1.0), enforced on the built site. Every colour the
// site paints is one of the book's hex codes, solid. Nothing blends: no see-through tints, gradients,
// glows, soft shadows, blurs, blend modes or part-faded layers, because each of those paints colours
// the book does not list. Images (the app screenshots, the logos, the book cover) keep their own colours
// and are not read. Fades in and out while something moves are allowed; resting states must be solid.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const BOOK = {
  // Leah Roling, the InnerBoard umbrella, Academy, Inner Lab, InnerBoard OS, INQ Certification.
  d09342: "Leah amber", e4ae9b: "Leah peach", fbeee6: "Leah blush", f2ece0: "ivory base", "1b1916": "ink",
  "7a3a4a": "InnerBoard rose", "5a2832": "InnerBoard deep", a8757e: "InnerBoard soft", "3a3631": "InnerBoard graphite",
  "1a5d63": "Academy teal", "0d3438": "Academy deep", "5ba0a7": "Academy soft", a26b3d: "Academy bronze", ebe0c9: "Academy cream",
  db61b5: "Inner Lab pink", a8418c: "Inner Lab deep", eda5d2: "Inner Lab soft", fdf1f5: "Inner Lab blush", "4a2e20": "Inner Lab chocolate",
  "4f6d8c": "OS steel", "0d3054": "OS deep navy", "8aa3bf": "OS soft", e6e7ea: "OS pale",
  d4af37: "INQ gold", e8cf7a: "INQ soft gold", "2d2a26": "INQ slate dark", "6e6660": "INQ slate mid", b8b2a8: "INQ slate soft"
};
// Painted inside the app's own screenshots to match them (the typing animation's input field).
const ALLOW = new Set(["f9f6ee"]);
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
    if (statSync(path).isDirectory()) { if (name !== "app") walk(path); }
    else if (/\.css$/.test(path)) css(readFileSync(path, "utf8"), path);
    else if (/\.(html|svg)$/.test(path)) markup(readFileSync(path, "utf8"), path);
  }
}

// The CSS inside a page: <style> blocks, style attributes and SVG paint attributes.
function markup(text, path) {
  for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css(m[1], path);
  for (const m of text.matchAll(/\sstyle="([^"]*)"/gi)) css(`x{${m[1]}}`, path);
  for (const m of text.matchAll(/\s(fill|stroke|stop-color|color|flood-color)="([^"]*)"/gi)) value(m[1], m[2], path);
  for (const m of text.matchAll(/\s(opacity|fill-opacity|stroke-opacity|stop-opacity)="([^"]*)"/gi)) opacity(m[1], m[2], path);
  if (/<(linear|radial)Gradient\b/i.test(text)) note("an SVG gradient", path);
}

function css(text, path) {
  // Comments paint nothing, nor does Tailwind's plumbing: its @property --tw-* registrations and its preflight's
  // placeholder colour (the site has no text fields, so no placeholder is ever drawn).
  text = text.replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@property\s+--tw-[-\w]+\s*\{[^{}]*\}/g, "")
    .replace(/@supports\s*\(color:\s*color-mix\([^{]*\{\s*::placeholder\s*\{[^{}]*\}\s*\}/g, "");
  // Opacity in the middle of a keyframe is a fade in motion, not a resting colour.
  const still = text.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  for (const b of text.matchAll(/\{([^{}]*)\}/g)) for (const m of b[1].matchAll(/([-\w]+)\s*:\s*([^;]+)/g)) value(m[1].toLowerCase(), m[2], path);
  for (const b of still.matchAll(/\{([^{}]*)\}/g)) for (const m of b[1].matchAll(/(?<![-\w])((?:fill-|stroke-|stop-|flood-)?opacity)\s*:\s*([^;]+)/gi)) opacity(m[1], m[2], path);
}

function value(prop, v, path) {
  if (/^(font|grid|transition|animation|will-change|content|counter|quotes|--tw-)/.test(prop)) return;
  // A mask's colours are only its alpha (black shows, transparent hides): it paints nothing, so only its edge counts.
  if (/mask/.test(prop)) { if (/(linear|radial|conic)-gradient\(/i.test(v) && !hard(v)) note(`a fading mask (${prop})`, path); return; }
  if (/^(\s*var\(--tw-[-\w]+,?\)\s*,?)+$/.test(v)) return;
  for (const m of v.matchAll(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi)) {
    let hex = m[1].toLowerCase();
    if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("");
    colour(hex.slice(0, 6), hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1, path);
  }
  for (const m of v.matchAll(/rgba?\(([^)]*)\)/gi)) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    const hex = p.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, "0")).join("");
    const a = p[3] === undefined ? 1 : p[3].endsWith("%") ? parseFloat(p[3]) / 100 : Number(p[3]);
    if (/var\(/.test(m[1])) note(`a colour built from variables, ${m[0]}`, path);
    else colour(hex, a, path);
  }
  if (/hsla?\(/i.test(v)) note("an hsl() colour", path);
  if (/color-mix\(/i.test(v)) note("a color-mix() blend", path);
  if (/(linear|radial|conic)-gradient\(/i.test(v)) note(`a gradient (${prop})`, path);
  if (/(^|-)(box-shadow|text-shadow)$|^--sh|shadow/.test(prop) && !/^(none|initial|unset)$/i.test(v.trim())) shadow(prop, v, path);
  if (/(^|-)filter$/.test(prop) && !/^none$/i.test(v.trim())) note(`a ${prop} (${v.trim().slice(0, 40)})`, path);
  if (/blend-mode$/.test(prop) && !/^normal$/i.test(v.trim())) note(`a ${prop}`, path);
  if (!/^(--|font|src)/.test(prop)) for (const m of v.matchAll(NAMED)) note(`the colour name "${m[1]}" (${prop})`, path);
}

// A mask that only cuts (every change of colour at one position: "#000 40%, transparent 40%") hides part of an
// element with a clean edge and blends nothing, so it is allowed; a mask that fades is not.
function hard(v) {
  for (const g of v.matchAll(/(?:linear|radial|conic)-gradient\(((?:[^()]|\([^()]*(?:\([^()]*\))*[^()]*\))*)\)/gi)) {
    const stops = g[1].split(/,(?![^(]*\))/).map((x) => x.trim()).filter((x) => !/^(to |from |at |\d+deg|circle|ellipse|closest|farthest)/.test(x));
    for (let i = 1; i < stops.length; i++) {
      const [c0, ...p0] = stops[i - 1].split(/\s+(?![^(]*\))/), [c1, ...p1] = stops[i].split(/\s+(?![^(]*\))/);
      if (c0 !== c1 && p0[p0.length - 1] !== p1[0]) return false;
    }
  }
  return true;
}

// A hard-edged ring (no blur) in a book colour draws a line, which is allowed. Anything soft blends.
function shadow(prop, v, path) {
  if (prop === "text-shadow") return note("a text shadow", path);
  for (const layer of v.split(/,(?![^(]*\))/)) {
    const lengths = layer.replace(/(rgba?|var|calc)\([^)]*\)|#[0-9a-f]+|inset/gi, " ").trim().split(/\s+/).filter(Boolean);
    if (lengths.length >= 3 && parseFloat(lengths[2]) !== 0) return note(`a soft shadow (${prop})`, path);
  }
}

function opacity(prop, v, path) {
  v = v.trim();
  if (/^(0|1|0?\.0+|1\.0+|0%|100%|inherit|initial|unset)$/.test(v)) return;
  if (/^var\(/.test(v) && !/,\s*0?\.\d/.test(v)) return;
  note(`a part-faded ${prop} (${v.slice(0, 40)})`, path);
}

function colour(hex, a, path) {
  if (a === 0) return;
  if (!BOOK[hex] && !ALLOW.has(hex)) note(`#${hex} is not a brand book colour`, path);
  else if (a < 1) note(`#${hex} at ${Math.round(a * 100)}% (a see-through tint)`, path);
}

walk(root);
if (problems.size) {
  for (const [msg, where] of problems) console.error(`${msg}: ${[...where].slice(0, 3).join(", ")}`);
  console.error(`\nbrand: ${problems.size} kinds of colour outside the brand book`);
  process.exit(1);
}
console.log("brand: every colour is a solid brand book hex");
