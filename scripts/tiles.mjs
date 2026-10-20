// The floor tiles (BUILD_SPEC 1.10, 2.2.9): each stem in the list is read from
// public/app/{stem}.webp, resized to 390 x 844 (cover, anchored top) and
// written to public/app/tiles/{stem}.webp at quality 78 (about 12 to 18 KB).
// Run by hand with `npm run tiles`; the outputs are committed; `astro build`
// never runs it. Nothing outside this repo is read or written.
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "public", "app");
const out = join(src, "tiles");
mkdirSync(out, { recursive: true });

/* No tile shows a score: stear2, rap1 and dare hold the places of the spec's
 * score-m1, score-upstream-scored and score-m1-result. */
const stems = [
  "coach-draft", "today", "tools-home", "energy", "sunday-quick-plan", "stear2",
  "close-day", "wins-saved", "rap1", "spark", "hear", "facts-vs-story",
  "quiz-results", "leader-blueprint", "friday-energy", "arriving-word", "discomfort-name", "dare"
];

let total = 0;
for (const stem of stems) {
  const file = join(out, `${stem}.webp`);
  await sharp(join(src, `${stem}.webp`)).resize(390, 844, { fit: "cover", position: "top" }).webp({ quality: 78 }).toFile(file);
  const kb = statSync(file).size / 1024;
  total += kb;
  console.log(`${stem}.webp ${kb.toFixed(1)} KB`);
}
console.log(`${stems.length} tiles, ${total.toFixed(0)} KB`);
