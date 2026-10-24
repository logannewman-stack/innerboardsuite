// The colour rule from the InnerBoard brand book (v1.0), enforced on the built site: every colour the
// site paints is one of the book's hex codes, or white or black (shadows and highlights), at full
// strength or as a transparent tint. App screenshots and the logo are images and are not read.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const BOOK = {
  // Leah Roling, the InnerBoard umbrella, Academy, Inner Lab, InnerBoard OS, INQ Certification.
  d09342: "Leah amber", e4ae9b: "Leah peach", fbeee6: "Leah blush", f2ece0: "ivory base", "1b1916": "ink",
  "7a3a4a": "InnerBoard rose", "5a2832": "InnerBoard deep", a8757e: "InnerBoard soft", "3a3631": "InnerBoard graphite",
  "1a5d63": "Academy teal", "0d3438": "Academy deep", "5ba0a7": "Academy soft", a26b3d: "Academy bronze", ebe0c9: "Academy cream",
  db61b5: "Inner Lab pink", a8418c: "Inner Lab deep", eda5d2: "Inner Lab soft", fdf1f5: "Inner Lab blush", "4a2e20": "Inner Lab chocolate",
  "4f6d8c": "OS steel", "0d3054": "OS deep navy", "8aa3bf": "OS soft", e6e7ea: "OS pale",
  d4af37: "INQ gold", e8cf7a: "INQ soft gold", "2d2a26": "INQ slate dark", "6e6660": "INQ slate mid", b8b2a8: "INQ slate soft",
  ffffff: "white", "000000": "black"
};
// Painted inside the app's own screenshots to match them (the typing animation's input field).
const ALLOW = new Set(["f9f6ee"]);

const root = new URL("../dist", import.meta.url).pathname;
const found = new Map();
const colour = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { if (name !== "app") walk(path); }
    else if (/\.(css|html|svg)$/.test(path)) check(path);
  }
}

function check(path) {
  for (const m of readFileSync(path, "utf8").matchAll(colour)) {
    let hex;
    if (m[1]) {
      hex = m[1].toLowerCase();
      if (hex.length <= 4) hex = [...hex.slice(0, 3)].map((c) => c + c).join("");
      hex = hex.slice(0, 6);
    } else hex = [m[2], m[3], m[4]].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
    if (BOOK[hex] || ALLOW.has(hex)) continue;
    const where = found.get(hex) || new Set();
    where.add(relative(root, path));
    found.set(hex, where);
  }
}

walk(root);
if (found.size) {
  for (const [hex, where] of found) console.error(`#${hex} is not a brand book colour (${[...where].slice(0, 3).join(", ")})`);
  process.exit(1);
}
console.log("brand: every colour is a brand book hex");
