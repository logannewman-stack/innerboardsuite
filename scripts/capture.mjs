// Recapture screens of the Practice app (read only: it opens pages, scrolls and screenshots, nothing else).
//
//   node scripts/capture.mjs <outDir> <route[@scrollY]>,... [baseUrl]
//   e.g. node scripts/capture.mjs /tmp/caps /lab,/book@1200,/academy https://practiceinnerboard.com
//
// Each route is captured twice, in the app's light theme, as a visitor with no account: a phone (390 x 844 at
// 2x, written as {tag}.webp at 780 x 1688) and a desk (1440 x 900 at 2x, written as desk-{tag}.webp at
// 1600 x 1000, plus the 2880 x 1800 PNG for a hero window that needs `-2x`). `@scrollY` scrolls the page that far
// first (CSS px). The app's one-time notice ("I understand") is accepted. Every capture is checked for text the
// site must not show at a readable size ("not available yet", "aren't posted yet", "coming soon", "opens soon",
// "being written"): the script prints a warning beside that file; such a screen needs a different scroll
// position, or a `fade` on its frame (PhoneFrame, WindowFrame) that ends the screen above the note. The base URL defaults to the live app; a local build of
// /home/user/practice-by-innerboard served with `npm run preview` (http://localhost:4173) works the same way.
//
// Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium, or set CHROME to a
// Chromium binary). Review every file by eye, copy the ones a page uses into public/app/ (the rest into
// captures/), then run `npm run small` for the 390 px variants.
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [out, routesArg, base = "https://practiceinnerboard.com"] = process.argv.slice(2);
if (!out || !routesArg) { console.error("usage: node scripts/capture.mjs <outDir> <route[@scrollY]>,... [baseUrl]"); process.exit(1); }
mkdirSync(out, { recursive: true });
const BAD = /not available yet|aren.t posted yet|coming soon|opens soon|being written/i;
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
for (const [kind, w, h, mobile] of [["phone", 390, 844, true], ["desk", 1440, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile, colorScheme: "light" });
  await ctx.addInitScript(() => { try { localStorage.setItem("innerboard.theme", "light"); } catch { /* private mode */ } });
  const page = await ctx.newPage();
  for (const item of routesArg.split(",")) {
    const [route, y = "0"] = item.split("@");
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1200);
    const ok = page.locator("button").filter({ hasText: /^i understand$/i }).first();
    if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await page.waitForTimeout(500); }
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), Number(y));
    await page.waitForTimeout(1500);
    const bad = await page.evaluate((src) => {
      const re = new RegExp(src, "i"), found = [];
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (!re.test(n.textContent || "")) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        if ([...rg.getClientRects()].some((r) => r.width > 0 && r.bottom > 0 && r.top < innerHeight)) found.push((n.textContent || "").trim().slice(0, 50));
      }
      return found;
    }, BAD.source);
    const tag = (route.replace(/^\//, "").replace(/\//g, "-") || "home") + (y !== "0" ? `-${y}` : "");
    const png = await page.screenshot();
    if (kind === "phone") await sharp(png).webp({ quality: 82 }).toFile(join(out, `${tag}.webp`));
    else {
      await sharp(png).toFile(join(out, `desk-${tag}-2880.png`));
      await sharp(png).resize(1600, 1000).webp({ quality: 82 }).toFile(join(out, `desk-${tag}.webp`));
    }
    console.log(`${kind} ${route}${y !== "0" ? " @" + y : ""} -> ${kind === "desk" ? "desk-" : ""}${tag}.webp${bad.length ? `   WARNING, in view: ${bad.join(" | ")}` : ""}`);
  }
  await ctx.close();
}
await browser.close();
