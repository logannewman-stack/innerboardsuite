// The two 2x desktop captures for the Practice hero (BUILD_SPEC 1.10): the raw
// 2880 x 1800 PNGs from the capture pass are written as
// public/app/desk-coach-draft-2x.webp and public/app/desk-tools-home-2x.webp at
// quality 80, each at most 180 KB (quality 74 if over). Run once by hand:
//   node scripts/desk2x.mjs [sourceDir]
// The source directory defaults to the capture scratchpad; it is only read.
import sharp from "sharp";
import { statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = process.argv[2] || "/tmp/claude-0/-home-user/a157628b-2577-5461-b68b-7ff8d5b4dbd2/scratchpad/appdemo2";
const pairs = [["desktop-coach-draft.png", "desk-coach-draft-2x.webp"], ["desktop-tools-home.png", "desk-tools-home-2x.webp"]];
const limit = 180 * 1024;

for (const [from, to] of pairs) {
  const input = join(srcDir, from);
  if (!existsSync(input)) { console.error(`missing ${input}`); process.exit(1); }
  const output = join(root, "public", "app", to);
  const meta = await sharp(input).metadata();
  if (meta.width !== 2880 || meta.height !== 1800) { console.error(`${from} is ${meta.width} x ${meta.height}, expected 2880 x 1800`); process.exit(1); }
  let quality = 80;
  await sharp(input).webp({ quality }).toFile(output);
  if (statSync(output).size > limit) { quality = 74; await sharp(input).webp({ quality }).toFile(output); }
  console.log(`${to} ${(statSync(output).size / 1024).toFixed(1)} KB at quality ${quality}`);
}
