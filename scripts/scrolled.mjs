// The quiz result, scrolled: the two stills the homepage quiz story shows for "Discover the unseen cost" and
// "One thing to do differently" (public/app/quiz-cost.webp and quiz-first-step.webp). Each is the real result
// screen as the app scrolls it: the header band of quiz-results (its top 6.2%) stays put, and under it the page
// body (quiz-results, with quiz-results2 joined at 179.56 em, the point where the two captures meet) is moved up
// by the offset. Nothing is drawn. The offsets put both edges of the body in the space between two lines, so no
// line of the app is cut at the header or at the bottom: 64 em for the cost, 146.67 em for the first step (the step itself, whole, under the header).
// Run by hand with `npm run scrolled` (then `npm run small` for the 390 variants); the outputs are committed;
// `astro build` never runs it. Reads public/app/quiz-results.webp and quiz-results2 (from captures/).
import sharp from "sharp";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pub = join(root, "public", "app");
const srcOf = (stem) => [join(pub, `${stem}.webp`), join(root, "captures", `${stem}.webp`)].find((f) => existsSync(f));
const W = 600, H = 1298, em = W / 100;
const head = Math.round(H * 0.062);              // the header band, 80 px
const join2 = Math.round(179.56 * em);           // quiz-results2 starts here in the page body, 1077 px

const first = srcOf("quiz-results"), second = srcOf("quiz-results2");
/* The page body, as PhoneFrame's strip draws it: quiz-results, then quiz-results2 from 179.56 em without its own
 * header band (clip-path at 6.2%), fading in over the 2 em under that band (its mask). */
const raw = async (f) => (await sharp(f).removeAlpha().raw().toBuffer());
const a = await raw(first), b = await raw(second);
const bodyH = join2 + H, px = Buffer.alloc(W * bodyH * 3);
a.copy(px, 0, 0, W * H * 3);
const fade = Math.round(2 * em);
for (let y = head; y < H; y++) {
  const t = Math.min(1, (y - head) / fade), row = (join2 + y) * W * 3, src = y * W * 3;
  for (let i = 0; i < W * 3; i++) px[row + i] = Math.round(px[row + i] * (1 - t) + b[src + i] * t);
}
const body = await sharp(px, { raw: { width: W, height: bodyH, channels: 3 } }).png().toBuffer();

for (const [name, offEm] of [["quiz-cost", 64], ["quiz-first-step", 146.67]]) {
  const off = Math.round(offEm * em);
  const slice = await sharp(body).extract({ left: 0, top: off + head, width: W, height: H - head }).png().toBuffer();
  const out = join(pub, `${name}.webp`);
  await sharp(first).composite([{ input: slice, top: head, left: 0 }]).webp({ quality: 82 }).toFile(out);
  console.log(`${name}.webp at ${offEm} em (${off} px): ${(statSync(out).size / 1024).toFixed(1)} KB`);
}
