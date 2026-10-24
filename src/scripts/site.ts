/// <reference types="astro/client" />
/**
 * The site's one script: one scroll loop, one set of observers, no
 * dependencies. Every mechanic of BUILD_SPEC 1.7 lives here, numbered as
 * there: the loop and smoothing (1.7.1), reveals (1.7.2), line rise (1.7.3),
 * lit statements (1.7.4), page tone (1.7.5), the header (1.7.6), the passive
 * scene (1.7.7), parallax (1.7.12), drawn lines (1.7.14), the scroll driven
 * floor (1.7.15, SCROLL_SPEC S11), image warming (1.7.16), tilt (1.7.17), the
 * lifecycle (1.7.18) and scroll stories (1.7.19, SCROLL_SPEC section 1).
 * Kept from the first build: track(), passthrough(), the header menu, flips().
 *
 * Nothing in a device moves on a timer: every app demonstration is a scroll
 * story, and the scene only shows what the story's scroll position says. The
 * loop phone (1.7.8), the old day stage (1.7.9), the rails (1.7.10), the
 * scroll screen (1.7.11), the previews (1.7.13), scene autoplay and run gates
 * are gone: every page runs on stories.
 *
 * Everything is progressive: without it the page is complete, readable and
 * every link works. With reduced motion on, nothing moves and nothing hides.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (name: string, options?: { props?: Record<string, string> }) => void;
  }
}

const html = document.documentElement;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const sine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(t));
const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const DARK = new Set(["navy", "practice", "charcoal", "ink", "teal", "slate"]);

/** One event, sent to whichever analytics the page carries. Harmless with none. */
export function track(name: string, props: Record<string, string> = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...props });
    if (typeof window.gtag === "function") window.gtag("event", name, props);
    if (typeof window.plausible === "function") window.plausible(name, { props });
  } catch {
    /* analytics must never break a click */
  }
}

/* ── Per-page bindings, torn down and rebuilt on every navigation ───────── */
let cleanups: Array<() => void> = [];
let generation = 0;
function listen(target: any, type: string, fn: any, opts?: AddEventListenerOptions | boolean) {
  target.addEventListener(type, fn, opts);
  cleanups.push(() => target.removeEventListener(type, fn, opts));
}
function observe(io: IntersectionObserver | ResizeObserver | MutationObserver) {
  cleanups.push(() => io.disconnect());
}
const timers = new Set<number>();
function after(ms: number, fn: () => void) {
  const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
  timers.add(id);
  return id;
}
function cancel(id: number) { window.clearTimeout(id); timers.delete(id); }

/* ── 1.7.1 The loop, smoothing, progress, measure ───────────────────────── */
const S: Record<string, number> = {};
let last = performance.now(), dt = 0.016, need = false, queued = false, raf = 0;
let vh = window.innerHeight;
type Mod = { measure?: () => void; frame: (now: number) => void };
let mods: Mod[] = [];
function register(m: Mod) { mods.push(m); }
function smooth(k: string, v: number, tau = 0.1) {
  const o = S[k];
  if (o == null || Math.abs(v - o) > 0.34 || reduced()) return (S[k] = v);
  const n = o + (v - o) * (1 - Math.exp(-dt / tau));
  S[k] = Math.abs(v - n) < 4e-4 ? v : n;
  if (S[k] !== v) need = true;
  return S[k];
}
function kick() {
  need = true;
  if (!queued) { queued = true; raf = requestAnimationFrame(frame); }
}
function frame(now: number) {
  queued = false;
  dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  last = now;
  need = false;
  vh = window.innerHeight;
  for (const m of mods) m.frame(now);
  if (need) { queued = true; raf = requestAnimationFrame(frame); }
}
/* One hidden fixed probe, read on measure only: its height is 100svh (the story engine's viewport, which does
 * not change when a phone's address bar collapses) and its width is the CSS gutter, safe area included. */
let probe: HTMLElement | null = null;
function sysProbe() {
  if (!probe || !probe.isConnected) {
    probe = document.createElement("div");
    probe.className = "sys-probe";
    probe.setAttribute("aria-hidden", "true");
    document.body.appendChild(probe);
  }
  return probe;
}
function measure() {
  vh = window.innerHeight;
  const docW = html.clientWidth;
  html.style.setProperty("--vh", vh + "px");
  const gutter = sysProbe().offsetWidth || Math.min(120, Math.max(20, docW * 0.042));
  /* --max is calc(1200px * var(--zoom)), which computed style returns unresolved (NaN when parsed),
   * so read --zoom (1, 1.12 from 1800 px, 1.25 from 2200 px) and compute the column from it. */
  const zoom = parseFloat(getComputedStyle(html).getPropertyValue("--zoom")) || 1;
  const max = 1200 * zoom;
  const gap = Math.min(32, Math.max(16, docW * 0.016));
  const wrapW = Math.min(docW - 2 * gutter, max);
  html.style.setProperty("--edge", Math.max(gutter, (docW - max) / 2) + "px");
  html.style.setProperty("--colw", (wrapW - 11 * gap) / 12 + "px");
  qsa<HTMLElement>(".win").forEach((w) => {
    const cap = parseFloat(w.dataset.ww || "") || parseFloat(w.style.getPropertyValue("--ww")) || 1200;
    if (!w.dataset.ww) w.dataset.ww = String(cap);
    const rendered = Math.min(cap, w.parentElement ? w.parentElement.clientWidth : cap);
    w.style.setProperty("--ww", rendered + "px");
  });
  for (const m of mods) m.measure?.();
  kick();
}
function loopSetup() {
  let resizeT = 0;
  listen(window, "scroll", kick, { passive: true });
  listen(window, "resize", () => { kick(); clearTimeout(resizeT); resizeT = window.setTimeout(measure, 120); }, { passive: true });
  const main = document.querySelector("main");
  if (main && "ResizeObserver" in window) { const ro = new ResizeObserver(() => kick()); ro.observe(main); observe(ro); }
  document.fonts?.ready.then(() => measure());
  listen(document, "load", (e: Event) => {
    const t = e.target as HTMLElement;
    if (t && t.tagName === "IMG" && t.closest("[data-frames], [data-story], .floor, .tile")) kick();
  }, true);
  listen(window, "load", measure);
}

/* ── 1.7.2 Reveals ──────────────────────────────────────────────────────── */
const REVEAL = ".wipe, .rise, .reveal, .rise-obj, .seq, .draw, [data-draw='enter'], [data-geo], .rule-draw, .rule-draw-v, .tcard-in, .floor-on";
let revealIO: IntersectionObserver | null = null;
function arrive(el: Element) {
  el.classList.add("in");
  if (el.classList.contains("reveal")) el.classList.add("is-in");
  if (el.matches(".draw, [data-draw='enter'], [data-geo]")) drawIn(el);
}
/* A reveal gate: data-reveal-at="0.6" (alias data-draw-at) on any element arrives it, and every reveal
 * hook inside it, when the centre of its section (or of the element named by data-reveal-host) passes
 * that fraction of the viewport height, as one sequence timed by their own --d values, instead of each
 * at the observer's 12% visibility. The INQ loop glyph and its pull line use it. */
const GATE = "[data-reveal-at], [data-draw-at]";
function gates() {
  qsa<HTMLElement>(GATE).forEach((el) => {
    const fire = () => { arrive(el); qsa(REVEAL, el).forEach(arrive); };
    if (el.classList.contains("in")) return;
    if (reduced() || !("IntersectionObserver" in window)) { fire(); return; }
    const at = Math.min(1, Math.max(0, parseFloat(el.dataset.revealAt || el.dataset.drawAt || "") || 0.6));
    const sel = el.dataset.revealHost || el.dataset.drawHost;
    const host = (sel && document.querySelector<HTMLElement>(sel)) || el.closest<HTMLElement>("section") || el.parentElement || el;
    let fired = false;
    register({ frame() {
      if (fired) return;
      const r = host.getBoundingClientRect();
      if ((r.top + r.bottom) / 2 <= vh * at) { fired = true; fire(); }
    } });
  });
}
function reveals() {
  /* Anything under a gate fires from the loop, not from this observer. */
  const items = qsa(REVEAL).filter((el) => !el.closest(GATE));
  gates();
  qsa(".seq").forEach((seq) => Array.from(seq.children).forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(i))));
  if (!("IntersectionObserver" in window)) { items.forEach(arrive); revealIO = null; return; }
  /* Whatever already starts above the viewport's bottom arrives at once (a tall object that only peeks into
   * the first screen of a short laptop must not wait for 12% of itself to be in view); the rest arrive as soon
   * as any of them crosses into the band above the bottom 8% of the viewport (audit 2, finding 1). */
  const h = window.innerHeight;
  const later = items.filter((el) => { if (el.getBoundingClientRect().top < h) { arrive(el); return false; } return true; });
  revealIO = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      arrive(entry.target);
      revealIO?.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
  later.forEach((el) => revealIO!.observe(el));
  observe(revealIO);
  /* Keyboard focus that lands inside content that has not been revealed yet reveals it at once. */
  listen(document, "focusin", (e: FocusEvent) => {
    const t = e.target as Element | null;
    for (let el = t && t.closest ? t.closest(REVEAL) : null; el; el = el.parentElement ? el.parentElement.closest(REVEAL) : null) {
      if (!el.classList.contains("in")) { arrive(el); revealIO?.unobserve(el); }
    }
  });
}

/* ── Word splitting shared by line rise (1.7.3) and lit (1.7.4) ─────────── */
const BLOCK = /^(P|DIV|LI|UL|OL|H[1-6]|BLOCKQUOTE|FIGCAPTION)$/;
/** Replace the text of `root` with one element per word. Inline wrappers are
 * dissolved into the words: an <em> becomes em.w per word (so the italic is
 * kept), a <b class="lb"> or <span class="amp"> passes its classes down. Block
 * children (paragraphs, list items) are kept and split inside. */
function wordify(root: HTMLElement, cls: string): HTMLElement[] {
  const out: HTMLElement[] = [];
  const build = (node: Node, ctx: { tag: string; classes: string[] }): Node[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      return text.split(/(\s+)/).filter(Boolean).map((part) => {
        if (/^\s+$/.test(part)) return document.createTextNode(" ");
        const el = document.createElement(ctx.tag);
        el.className = [cls, ...ctx.classes].join(" ");
        el.textContent = part;
        out.push(el);
        return el;
      });
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === "BR") return [el];
      if (BLOCK.test(el.tagName)) {
        const kids = Array.from(el.childNodes).flatMap((c) => build(c, ctx));
        el.replaceChildren(...kids);
        return [el];
      }
      const tag = el.tagName === "EM" ? "em" : ctx.tag;
      const classes = [...ctx.classes, ...Array.from(el.classList).filter((c) => c !== "hl")];
      return Array.from(el.childNodes).flatMap((c) => build(c, { tag, classes }));
    }
    return [];
  };
  const nodes = Array.from(root.childNodes).flatMap((c) => build(c, { tag: "span", classes: [] }));
  root.replaceChildren(...nodes);
  return out;
}

/* ── 1.7.3 Line rise (data-lines, alias data-words) ─────────────────────── */
type Lined = { h: HTMLElement; blocks: { el: HTMLElement; words: HTMLElement[] }[] };
const lined: Lined[] = [];
function groupLines(entry: Lined) {
  let line = 0;
  for (const b of entry.blocks) {
    b.el.querySelectorAll(":scope > .l").forEach((l) => l.replaceWith(...Array.from(l.childNodes)));
    const lh = parseFloat(getComputedStyle(b.el).fontSize) * 0.5;
    const groups: HTMLElement[][] = [];
    let curTop: number | null = null, cur: HTMLElement[] = [];
    for (const w of b.words) {
      const t = w.getBoundingClientRect().top;
      if (curTop === null || Math.abs(t - curTop) > lh) { cur = []; groups.push(cur); curTop = t; }
      cur.push(w);
    }
    for (const g of groups) {
      const l = document.createElement("span");
      l.className = "l";
      const first = g[0], lastW = g[g.length - 1];
      first.parentNode?.insertBefore(l, first);
      let n: Node | null = first;
      while (n) { const next: Node | null = n.nextSibling; l.appendChild(n); if (n === lastW) break; n = next; }
      g.forEach((w) => w.style.setProperty("--l", String(line)));
      line++;
    }
  }
  entry.h.dataset.lineCount = String(line);
}
function lineRise(gen: number) {
  const heads = qsa("[data-lines], [data-words]").filter((h) => h.dataset.lines !== "done" && h.dataset.words !== "done");
  if (!heads.length || reduced()) return;
  const split = () => {
    if (gen !== generation) return;
    const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      for (const e of entries) { if (e.isIntersecting) { e.target.classList.add("in"); io?.unobserve(e.target); } }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;
    if (io) observe(io);
    for (const h of heads) {
      const blocks = (qsa(".hl", h).length ? qsa(".hl", h) : [h]).map((el) => ({ el, words: wordify(el, "w") }));
      const entry = { h, blocks };
      groupLines(entry);
      lined.push(entry);
      h.dataset.lines = "done";
      if (h.hasAttribute("data-words")) h.dataset.words = "done";
      h.classList.add("lines-ready");
      if (io) io.observe(h); else h.classList.add("in");
    }
  };
  if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(split); else split();
  let t = 0;
  listen(window, "resize", () => { clearTimeout(t); t = window.setTimeout(() => { for (const e of lined) { const was = e.h.dataset.lineCount; groupLines(e); if (e.h.dataset.lineCount !== was && !e.h.classList.contains("in")) { /* regrouped; entrance still pending */ } } }, 200); }, { passive: true });
}

/* ── 1.7.4 Lit statement (data-lit, alias data-scrollwords) ─────────────── */
function lit() {
  qsa("[data-lit], [data-scrollwords]").forEach((el) => {
    if (el.dataset.litDone) return;
    el.dataset.litDone = "1";
    if (el.dataset.lit === "lines") {
      const units = qsa(":scope > li, :scope > .lw", el);
      if (!units.length) return;
      units.forEach((u) => u.classList.add("lw"));
      const step = Number(el.dataset.litStep || 260);
      if (reduced()) { units.forEach((u) => u.classList.add("on")); return; }
      let fired = false;
      register({ frame() {
        if (fired) return;
        const r = el.getBoundingClientRect();
        if (r.top <= vh * 0.6) { fired = true; units.forEach((u, i) => after(i * step, () => u.classList.add("on"))); }
      } });
      return;
    }
    if (reduced()) return;
    const tag = el.tagName === "P" ? "span" : "div";
    const sr = document.createElement(tag);
    sr.className = "sr-only";
    const vis = document.createElement(tag);
    vis.setAttribute("aria-hidden", "true");
    Array.from(el.childNodes).forEach((n) => vis.appendChild(n));
    sr.append(...Array.from(vis.childNodes).map((n) => n.cloneNode(true)));
    const words = wordify(vis, "lw");
    el.append(sr, vis);
    let lastN = -1;
    register({ frame() {
      const r = el.getBoundingClientRect();
      const p = clamp01((0.8 * vh - r.top) / (r.height + 0.2 * vh));
      const n = Math.min(words.length, Math.floor(p * words.length * 1.08));
      if (n === lastN) return;
      const [a, b] = n > lastN ? [Math.max(0, lastN), n] : [n, lastN];
      for (let i = a; i < b; i++) words[i]?.classList.toggle("on", i < n);
      lastN = n;
    } });
  });
}

/* ── 1.7.5 Page tone ────────────────────────────────────────────────────── */
/* The theme is the tone of the last section whose top has passed the middle of the viewport, or the
 * section's own data-tone-at fraction (BRAND_FIX S1: a dark bleed no longer takes over at 75%, which painted
 * the cream section above it dark while it was being read). Text inside a dark bleed follows the theme
 * tokens, so a bleed entering below the middle reads as ink on cream until it takes over: nothing is ever
 * read on the wrong ground. The footer paints its own colour and is skipped, so the last section's tone
 * holds to the end of the page. */
const themeHooks: Array<() => void> = [];
function toneLine(s: HTMLElement) {
  const at = parseFloat(s.dataset.toneAt || "");
  if (at >= 0 && at <= 1) return at;
  return 0.5;
}
function tone() {
  const sections = qsa("[data-tone]").filter((s) => !s.closest("footer, .site-footer"));
  if (!sections.length) return;
  register({ frame() {
    let t = sections[0].dataset.tone || html.dataset.theme || "cream";
    for (const s of sections) {
      const top = s.getBoundingClientRect().top;
      if (top > vh) break;
      if (top <= vh * toneLine(s)) t = s.dataset.tone || t;
    }
    if (html.dataset.theme !== t) { html.dataset.theme = t; themeHooks.forEach((h) => h()); }
  } });
}

/* ── 1.7.6 Header: tone, hide on scroll, the menu ───────────────────────── */
function header() {
  const el = document.querySelector<HTMLElement>("[data-header]");
  if (!el) return;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="nav-start"]')?.content;
  let stored: string | null = null;
  try { stored = sessionStorage.getItem("ib.nav"); } catch { /* no storage */ }
  el.classList.toggle("is-dark", (meta || stored) === "dark");
  const button = el.querySelector<HTMLButtonElement>("[data-menu-button]");
  const panel = document.querySelector<HTMLElement>("[data-menu-panel]");
  const menuOpen = () => !!panel && panel.classList.contains("is-open");

  /* Tone: 21 samples along the bottom edge, majority wins, 110 ms debounce. */
  let debounce = 0;
  /* A surface (plate, panel, paper, mat, tile, a device's screen or bezel,
   * the footer) paints its own colour and decides for itself: `data-surface`
   * when it says so, else by class. A bleed section's tone is the page's
   * current theme, which is what the body (and the section's floor) is
   * actually showing under the bar (the day stage's sky follows its section,
   * so it is not listed). */
  const SURFACE = "[data-tone], [data-surface], .paper, .paper-teal, .mat, .mat-blush, .tile, .phone-screen, .win-screen, .phone, .win, .site-footer";
  const LIGHT = ".paper, .paper-teal, .mat, .mat-blush, .tile, .phone-screen, .win-screen, .site-footer";
  /* The colour a dark sample sits on: a bleed is the page's own tone (the bar then uses --bg, which cross
   * fades with the page); a dark surface is its painted background colour, if it has a plain one. */
  const paintOf = (src: Element): string => {
    if (src.matches("[data-tone]") && !src.hasAttribute("data-surface")) return "";
    for (let n: Element | null = src; n && n !== document.body; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const a = /rgba?\(([^)]*)\)/.exec(c || "")?.[1].split(",").map((v) => parseFloat(v));
      if (a && a.length >= 3 && (a.length < 4 || a[3] >= 0.5)) return c;
      if (n.matches("[data-tone]")) break;
    }
    return DARK.has(html.dataset.theme || "") ? "" : "#1b1916";
  };
  const isDark = (src: Element) => {
    const surface = src.getAttribute("data-surface");
    if (surface) return surface === "dark";
    if (src.matches(LIGHT)) return false;
    if (src.matches(".win")) return src.classList.contains("win-dark");
    if (src.matches(".phone")) return true;
    return DARK.has(html.dataset.theme || "");
  };
  const sample = () => {
    if (menuOpen()) return;
    /* Sample where the bar's bottom edge is, or will be once it slides back in: a hidden bar must not
     * reappear with the tone of the strip above it. */
    const y = (hidden ? el.offsetHeight : el.getBoundingClientRect().bottom) + 4;
    const w = html.clientWidth;
    let dark = 0;
    const paints = new Map<string, number>(), memo = new Map<Element, string>();
    for (let i = 0; i < 11; i++) {
      const stack = document.elementsFromPoint(w * (0.1 + 0.08 * i), y);
      for (const node of stack) {
        if (el.contains(node) || (panel && panel.contains(node))) continue;
        const src = node.closest(SURFACE);
        if (src && isDark(src)) {
          dark++;
          let p = memo.get(src);
          if (p === undefined) { p = paintOf(src); memo.set(src, p); }
          paints.set(p, (paints.get(p) || 0) + 1);
        }
        break;
      }
    }
    const want = dark >= 6;
    let paint = "", most = 0;
    paints.forEach((n, p) => { if (n > most) { most = n; paint = p; } });
    clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      if (want) { if (paint) el.style.setProperty("--hdr-bg", paint); else el.style.removeProperty("--hdr-bg"); }
      if (el.classList.contains("is-dark") !== want) {
        el.classList.toggle("is-dark", want);
        try { sessionStorage.setItem("ib.nav", want ? "dark" : "light"); } catch { /* no storage */ }
      }
    }, 110);
  };
  themeHooks.push(() => after(110, sample));

  /* Hide on scroll. */
  let acc = 0, lastY = window.scrollY, sampledY = -1e9, sampledAt = -1e9, hidden = false;
  const loadAt = performance.now();
  let resizeAt = -1e9;
  listen(window, "resize", () => { resizeAt = performance.now(); }, { passive: true });
  const show = () => { hidden = false; el.classList.remove("nav-hidden"); };
  const hide = () => { hidden = true; el.classList.add("nav-hidden"); };
  register({ frame(now) {
    const y = window.scrollY;
    const d = y - lastY;
    lastY = y;
    el.classList.toggle("is-scrolled", y > 24);
    /* Sample at most every 120 ms while scrolling, and once more when the scroll settles. */
    if (Math.abs(y - sampledY) > 2 && (now - sampledAt > 120 || d === 0)) { sampledY = y; sampledAt = now; sample(); }
    /* While a story is pinned the bar stays shown: the stage sticks under it, so a hidden bar would leave a
     * dead band of page above the stage (audit 2, finding 4). Read now, not from the story pass of the last
     * frame, so a scroll that jumps into a pin never hides the bar for a frame. */
    const locked = now - loadAt < 1200 || now - resizeAt < 500 || menuOpen() || el.contains(document.activeElement) || storyPinnedNow();
    if (y < 120 || locked) { acc = 0; if (hidden && (y < 120 || locked)) show(); return; }
    if ((d > 0) !== (acc > 0)) acc = 0;
    acc += d;
    if (acc > 24 && !hidden) hide();
    else if (acc < -24 && hidden) show();
  } });
  sample();

  /* The menu. */
  if (!button || !panel) return;
  panel.setAttribute("inert", "");
  const focusables = () => qsa<HTMLElement>("a[href], button:not([disabled])", panel);
  const set = (open: boolean) => {
    panel.classList.toggle("is-open", open);
    if (open) panel.removeAttribute("inert"); else panel.setAttribute("inert", "");
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    html.classList.toggle("menu-open", open);
    if (open) { show(); after(60, () => focusables()[0]?.focus()); }
  };
  listen(button, "click", () => set(!menuOpen()));
  qsa("a", panel).forEach((a) => listen(a, "click", () => set(false)));
  listen(document, "keydown", (e: KeyboardEvent) => {
    if (!menuOpen()) return;
    if (e.key === "Escape") { set(false); button.focus(); return; }
    if (e.key === "Tab") {
      const f = [button, ...focusables()];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  const mq = window.matchMedia("(min-width: 960px)");
  const onChange = (e: MediaQueryListEvent) => e.matches && set(false);
  mq.addEventListener("change", onChange);
  cleanups.push(() => { mq.removeEventListener("change", onChange); html.classList.remove("menu-open"); });
}

/* ── 1.7.7 Scene (passive) ──────────────────────────────────────────────── */
/* A Scene is one device, a PhoneFrame or a WindowFrame: its frames (every `.ds` directly in its `.cam`: a
 * plain capture `img.ds`, a capture with type lines `div.ds.ds-group`, a scroll strip `div.ds.ds-strip`), its
 * camera, its cursor and its ring. It never moves on its own: the scroll story engine (1.7.19) tells it which
 * frame to show and where the camera, the cursor and the ring are. A device outside any story shows its
 * data-rest frame. The 380 ms wipe is the only clock in a device, and the scroll starts it. */
const scenes = new Map<Element, Scene>();
/* The camera never crops a capture deeper than its side padding: the visible part always holds x 8% to 92%
 * of the capture, which caps the scale at 1 / .84 (1.19) and clamps the origin; under 260 px of screen width
 * the scale is capped at 1.08. */
const CAM_MAX = 1.19, CAM_SMALL = 1.08, CAM_SMALL_W = 260, CAM_PAD = 8;
const SCENE_EASE = "cubic-bezier(.45, 0, .2, 1)";
class Scene {
  el: HTMLElement; screen: HTMLElement | null; cam: HTMLElement | null; cur: HTMLElement | null; curSvg: SVGElement | null; tap: HTMLElement | null;
  frames: HTMLElement[]; rest: number; anims: Animation[] = []; wasT = 0;
  /* The camera as last written (scale, origin), its transform string, the edge mask state, the screen width. */
  camS = 1; camOx = 50; camOy = 50; camKey = ""; camOn = false; sw = 0;
  constructor(el: HTMLElement) {
    this.el = el;
    this.screen = el.querySelector<HTMLElement>(".phone-screen, .win-screen");
    this.cam = this.screen ? this.screen.querySelector<HTMLElement>(":scope > .cam") : null;
    this.cur = this.screen ? this.screen.querySelector<HTMLElement>(":scope > .cur") : null;
    this.curSvg = this.cur ? this.cur.querySelector("svg") : null;
    this.tap = this.screen ? this.screen.querySelector<HTMLElement>(":scope > .tap") : null;
    this.frames = this.cam ? qsa(":scope > .ds, :scope > picture > .ds", this.cam) : [];
    this.rest = Math.min(Math.max(0, Number(el.dataset.rest || 0) || 0), Math.max(0, this.frames.length - 1));
    if (!this.frames.some((f) => f.classList.contains("on"))) this.show(this.rest, true);
    /* The dashed slot under the screen goes once the frame on screen has loaded. */
    const on = this.frames[this.index()];
    const img = on ? (on.tagName === "IMG" ? (on as HTMLImageElement) : on.querySelector<HTMLImageElement>("img")) : null;
    if (img && this.screen) {
      const done = () => this.screen?.classList.add("has-frame");
      if (img.complete && img.naturalWidth) done(); else img.addEventListener("load", done, { once: true });
    }
    this.measure();
  }
  measure() { this.sw = this.screen ? this.screen.clientWidth : 0; }
  /* The index of the frame on screen. */
  index() { const i = this.frames.findIndex((f) => f.classList.contains("on")); return i < 0 ? this.rest : i; }
  /* Show frame i. Two captures are never both visible through each other:
   * - a wipe (default): the new frame is revealed by clip-path from a zero height band at `from` (a y in % of
   *   the capture, 0 is the top) to the full frame over 380 ms (--scene), over the old frame, which stays opaque
   *   underneath until it is covered and is dropped the moment it is. Type lines and strips live inside their
   *   frame, so the clip takes them with it.
   * - instant: a cut (rest frames, a fling across several changes, a story that was off screen). */
  show(i: number, instant = false, from = 0) {
    const target = this.frames[i];
    if (!target) return;
    const on = this.frames.find((f) => f.classList.contains("on"));
    if (on === target) { if (instant) this.settle(); return; }
    this.settle();
    if (on) on.classList.remove("on");
    target.classList.add("on");
    this.syncCaps(i);
    if (instant || !on || reduced() || typeof target.animate !== "function") return;
    on.classList.add("was");
    const y = Math.min(100, Math.max(0, from));
    const wipe = target.animate([{ clipPath: `inset(${y.toFixed(2)}% 0% ${(100 - y).toFixed(2)}% 0%)` }, { clipPath: "inset(0% 0% 0% 0%)" }], { duration: 380, easing: SCENE_EASE });
    /* The old frame goes the moment the new one covers it, not a timer tick later. */
    wipe.onfinish = () => { if (this.anims.includes(wipe)) this.settle(); };
    this.anims.push(wipe);
    this.wasT = after(420, () => this.settle());
  }
  /* End any running change at once: the shown frame whole, the old one hidden. */
  settle() {
    cancel(this.wasT);
    if (this.anims.length) { this.anims.forEach((a) => a.cancel()); this.anims = []; }
    this.frames.forEach((f) => f.classList.remove("was"));
  }
  /* The camera: scale s about the point (ox, oy) in % of the capture, written at once (the story engine eases
   * it with the scroll). Clamped so a crop only ever falls in the capture's side padding; while it is in, the
   * screen's 14 px edge mask is on (.cam-on). */
  camTo(s: number, ox: number, oy: number) {
    if (!this.cam) return;
    s = Math.max(1, Math.min(CAM_MAX, s));
    if (this.sw > 0 && this.sw < CAM_SMALL_W) s = Math.min(s, CAM_SMALL);
    if (s > 1) {
      const k = 1 - 1 / s, lo = (100 - CAM_PAD - 100 / s) / k, hi = CAM_PAD / k;
      ox = lo <= hi ? Math.min(hi, Math.max(lo, ox)) : 50;
    }
    this.camS = s; this.camOx = ox; this.camOy = oy;
    const t = s > 1.0004 ? `translate(${(ox * (1 - s)).toFixed(3)}%, ${(oy * (1 - s)).toFixed(3)}%) scale(${s.toFixed(4)})` : "";
    if (t !== this.camKey) { this.camKey = t; this.cam.style.transform = t; }
    const camOn = s > 1.001;
    if (camOn !== this.camOn) { this.camOn = camOn; this.screen?.classList.toggle("cam-on", camOn); }
  }
  /* A point of the capture (% of its width and height) on the screen under the current camera. */
  toScreen(x: number, y: number): [number, number] { const s = this.camS; return [this.camOx * (1 - s) + s * x, this.camOy * (1 - s) + s * y]; }
  /* The device back on its rest frame with nothing written: the static layout. */
  reset() {
    this.settle();
    this.show(this.rest, true);
    this.camTo(1, 50, 50);
    for (const t of [this.cur, this.tap]) if (t) { t.style.removeProperty("transform"); t.style.removeProperty("opacity"); t.style.removeProperty("--fill"); }
    this.curSvg?.style.removeProperty("transform");
  }
  /* The caption beside a window follows the frame it shows. */
  syncCaps(i: number) {
    const host = this.el.parentElement;
    if (!host) return;
    qsa(".win-cap[data-cap]", host).forEach((c) => c.classList.toggle("on", Number(c.dataset.cap) === i));
  }
}
/* The registries are exposed for QA scripts (read only): window.__ib.stories[id] is SCROLL_SPEC 1.6 item 8. */
(window as any).__ib = { scenes, S, get stories() { return storyApi; } };
function sceneFor(el: HTMLElement) {
  let s = scenes.get(el);
  if (!s) { s = new Scene(el); scenes.set(el, s); }
  return s;
}
function scenesBind() { qsa("[data-frames]").forEach((el) => sceneFor(el)); }
function scenesTeardown() { scenes.forEach((s) => s.settle()); scenes.clear(); }

/* ── 1.7.12 Parallax ────────────────────────────────────────────────────── */
function parallax() {
  const els = qsa("[data-parallax]");
  els.forEach((el) => el.style.setProperty("--py", el.dataset.parallax || "0"));
  if (!els.length || reduced()) { els.forEach((el) => el.style.setProperty("--hy", "0")); return; }
  /* Written on the moving elements only (not on html, which restyles the whole page), and only when it changes. */
  let last = "";
  register({ frame() {
    const v = smooth("hy", clamp01(window.scrollY / vh), 0.1).toFixed(3);
    if (v === last) return;
    last = v;
    els.forEach((el) => el.style.setProperty("--hy", v));
  } });
}

/* ── 1.7.14 Drawn lines ─────────────────────────────────────────────────── */
/* Draw on the next frame, so the undrawn state committed by prepLines() is what the stroke transitions
 * from, also for a line that is already on screen when the page loads. */
function drawIn(el: Element) {
  const paths = qsa<SVGPathElement>(".draw-line", el);
  if (!paths.length) return;
  paths.forEach((p) => { if (!p.classList.contains("dl-ready")) prepLines([p]); });
  requestAnimationFrame(() => paths.forEach((p) => { p.style.strokeDashoffset = "0"; }));
}
/* Undraw lines without a transition: set the dash with `transition: none`, flush the style, then give the
 * transition back. Without this, a line painted before the script ran (drawn, no dash) would animate its
 * own undrawing and the arrival would reverse it at once, so the stroke just appeared. .dl-ready lifts
 * the guard in motion.css that keeps an enter line hidden until it is prepared. */
function prepLines(paths: SVGGeometryElement[]) {
  const lens = paths.map((p) => { try { return p.getTotalLength(); } catch { return 0; } });
  paths.forEach((p, i) => {
    if (!lens[i]) return;
    p.style.transition = "none";
    p.style.strokeDasharray = String(lens[i]);
    p.style.strokeDashoffset = reduced() ? "0" : String(lens[i]);
  });
  paths.forEach((p) => { void getComputedStyle(p).strokeDashoffset; });
  paths.forEach((p) => { p.style.transition = ""; p.classList.add("dl-ready"); });
  return lens;
}
let drawN = 0;
function draws() {
  qsa("[data-draw='enter'], .draw").forEach((svg) => {
    prepLines(qsa<SVGGeometryElement>(".draw-line", svg));
    if (svg.classList.contains("in")) drawIn(svg);
  });
  qsa("[data-draw='scroll']").forEach((svg) => {
    const paths = qsa<SVGGeometryElement>(".draw-line", svg);
    const lens = prepLines(paths);
    const lines = paths.map((p, i) => ({ p, L: lens[i] }));
    const rowsN = Number(svg.dataset.drawRows || 0);
    const host = svg.dataset.drawFor ? document.querySelector(svg.dataset.drawFor) : svg.parentElement;
    const rows = host ? qsa(":scope li", host).slice(0, rowsN || undefined) : [];
    if (reduced()) { lines.forEach(({ p }) => (p.style.strokeDashoffset = "0")); rows.forEach((r) => r.classList.add("on")); svg.classList.add("done"); return; }
    const key = "draw:" + drawN++;
    let done = false;
    register({ frame() {
      const r = svg.getBoundingClientRect();
      const p = smooth(key, clamp01((0.75 * vh - r.top) / Math.max(1, r.height)), 0.1);
      lines.forEach(({ p: path, L }) => { path.style.strokeDashoffset = (L * (1 - p)).toFixed(2); });
      if (rowsN) rows.forEach((row, i) => row.classList.toggle("on", p >= (i + 0.5) / rowsN));
      /* .done follows the line: it is set when the stroke completes and removed when the reader scrolls
       * back and the line undraws, so an arrowhead shown by .done never floats over an unfinished stroke. */
      const complete = p >= 0.999;
      if (complete !== done) { done = complete; svg.classList.toggle("done", complete); }
    } });
  });
}

/* ── 1.7.15 The floor drifts with the scroll (SCROLL_SPEC S11) ───────────── */
/* The Practice final's tile plane no longer loops on a timer: --fp on each .floor-strip goes from 0 when the
 * floor's section top reaches the viewport's bottom to 1 at the end of the page, and the CSS moves the strip
 * by --fp times its shift. With the scroll still, the floor is still. Reduced motion: --fp stays 0. */
let floorN = 0;
function floors() {
  const els = qsa(".floor");
  if (!els.length || reduced()) return;
  els.forEach((floor) => {
    const host = floor.closest<HTMLElement>("section") || floor.parentElement || floor;
    const strips = qsa(".floor-strip", floor);
    const key = "floor:" + floorN++;
    let last = "";
    register({ frame() {
      const r = host.getBoundingClientRect();
      const y = window.scrollY, y0 = r.top + y - vh, y1 = Math.max(y0 + 1, html.scrollHeight - vh);
      if (r.top > vh * 1.5 && last === "0.0000") return;
      const v = smooth(key, clamp01((y - y0) / (y1 - y0)), 0.1).toFixed(4);
      if (v === last) return;
      last = v;
      strips.forEach((s) => s.style.setProperty("--fp", v));
    } });
  });
}

/* ── 1.7.16 Image warming ───────────────────────────────────────────────── */
function warming() {
  const els = qsa("[data-warm]");
  if (!els.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      /* Rendered images only: a story's static figures (display: none while pinned) and a device variant for the
       * other layout are never fetched by warming. */
      qsa<HTMLImageElement>("img[loading='lazy']", e.target).forEach((img) => { if (img.getClientRects().length) img.loading = "eager"; });
      io.unobserve(e.target);
    }
  }, { rootMargin: "200% 0px 200% 0px" });
  els.forEach((el) => io.observe(el));
  observe(io);
}

/* ── 1.7.17 Tilt ────────────────────────────────────────────────────────── */
function tilt() {
  if (!finePointer() || reduced()) return;
  qsa("[data-tilt]").forEach((el) => {
    el.classList.add("tilt-on");
    const max = Number(el.dataset.tilt || 3);
    let r = 0;
    listen(el, "pointermove", (e: PointerEvent) => {
      if (r) return;
      r = requestAnimationFrame(() => {
        r = 0;
        const b = el.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width - 0.5;
        const y = (e.clientY - b.top) / b.height - 0.5;
        el.style.setProperty("--rx", (-y * max).toFixed(2) + "deg");
        el.style.setProperty("--ry", (x * max).toFixed(2) + "deg");
      });
    });
    listen(el, "pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });
}

/* ── 1.7.19 Scroll stories ─────────────────────────────────────────────── */
/* A story is a tall track whose stage sticks under the header while the reader scrolls through its run. The
 * scroll position alone decides the current step, the frame each device shows, where the ring presses, how far
 * a draft has typed, where the camera leans, where the cursor is and what it clicks, and how far a long result
 * has scrolled inside a phone. Scrolling back plays it backwards; nothing in a device moves on a timer. The
 * markup contract, the act keys and the maths are SCROLL_SPEC section 1; the API is SYSTEM_API.md, Scroll
 * stories. Static (no pin, every step stacked with its own figure) is the default CSS; the pinned layout is
 * added by motion.css under STORY_MQ, and the engine adds `.static` (reason in data-static-reason: media, fit,
 * floor, act, layout) when a story cannot be pinned on this viewport.
 * Story v2 (STORY_V2 part 1, SYSTEM_API "Story v2"): a root with data-story-ui="steps" is the step layout, the
 * device pinned on one side with the segmented rail and its "01 / 05" counter, one step's copy at a time on the
 * other. The engine's part is the same for both layouts (current step, --f on each mark, the counter); the
 * copy change itself is CSS, keyed on .is-current. */
const STORY_MQ =
  "(prefers-reduced-motion: no-preference) and (min-width: 1069px) and (min-height: 600px), " +
  "(prefers-reduced-motion: no-preference) and (max-width: 1068px) and (min-height: 560px)";
const WIDE_MQ = "(min-width: 1069px)";
type K3 = [number, number, number];
type K4 = [number, number, number, number];
type Act = {
  f?: number; in?: [number, number]; tap?: K3; next?: [number, number]; cur?: K3[]; click?: number; cam?: K4[];
  type?: [number, number]; scroll?: K4; halo?: number; haloEnd?: number; lift?: [number, number]; sub?: [number, number][];
  static?: number | [number, number] | null;
};
type Change = { g: number; from: number; to: number; y: number };
type Cache = Map<Element, Record<string, string>>;
type Dev = {
  name: string; el: HTMLElement; sc: Scene; win: boolean;
  first: number; changes: Change[]; rings: K3[]; clicks: number[]; cur: K3[]; cams: (K4[] | null)[];
  types: { lines: HTMLElement[]; starts: number[]; lens: number[] }[];
  strips: { body: HTMLElement; ranges: K4[] }[];
  halos: { el: HTMLElement; x: number; y: number; on: { k: number; end: number }[] }[];
  lift: [number, number] | null; warm: Set<number>[];
  shown: number; prevG: number;
};
/* The live stories, for the header: it stays shown while one is pinned, so a pinned stage never has a dead
 * band of page above it (audit 2, finding 4). One rect per live story, read before any write of the frame. */
let storyRuns: (StoryRun | null)[] = [];
function storyPinnedNow() {
  for (const r of storyRuns) {
    if (!r || !r.ok || r.D < 1 || !r.root.classList.contains("is-live")) continue;
    const p = (r.stick - r.track.getBoundingClientRect().top) / r.D;
    if (p > 0 && p < 1) return true;
  }
  return false;
}
const storyApi: Record<string, unknown> = {};
/* An act is JSON, except that numbers may start with a point (.42, -.5), as SCROLL_SPEC writes them. */
const parseAct = (s: string) => JSON.parse(s.replace(/([[,:]\s*-?)\.(\d)/g, "$10.$2"));
const rendered = (el: Element | null | undefined): el is HTMLElement => !!el && el.getClientRects().length > 0;
const num = (v: string | null | undefined, d = 0) => { const n = parseFloat(v || ""); return Number.isFinite(n) ? n : d; };
const pad2 = (n: number) => String(n).padStart(2, "0");
/* Write a style property only when its string changed since the last write. */
function put(c: Cache, el: HTMLElement | SVGElement, prop: string, val: string) {
  let m = c.get(el);
  if (!m) { m = {}; c.set(el, m); }
  if (m[prop] === val) return;
  m[prop] = val;
  if (prop.startsWith("--")) el.style.setProperty(prop, val); else (el.style as any)[prop] = val;
}
/* Piecewise sine between keyframes [g, ...values]; holds the ends. */
function keyed(keys: number[][], g: number): number[] {
  if (g <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    if (g <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i];
      const u = sine((g - a[0]) / Math.max(1e-6, b[0] - a[0]));
      return a.slice(1).map((v, j) => v + (b[j + 1] - v) * u);
    }
  }
  return keys[keys.length - 1].slice(1);
}

class StoryRun {
  root: HTMLElement; id: string; key: string;
  track: HTMLElement; stage: HTMLElement; run: HTMLElement;
  layout: "wide" | "narrow"; steps: HTMLElement[] = []; w: number[] = []; cum: number[] = []; W = 1; n = 0;
  acts: Record<string, Act>[] = []; devs: Dev[] = [];
  marks: { b: HTMLButtonElement; k: number; i: HTMLElement | null }[] = [];
  /* Story v2 (STORY_V2 1.7): the rail's counter, "01" and " / 05", rewritten on bind and at every step change. */
  countK: HTMLElement | null = null; countN: HTMLElement | null = null;
  subs: HTMLElement[][] = []; subIdx: number[] = []; gEls: HTMLElement[] = [];
  stick = 0; D = 0; navH = 72; svh = 0; k = -1; G = 0; p = 0; pinned = false; visible = false; ok = false; lastGs = "";
  off: Array<() => void> = []; c: Cache = new Map();
  day: { skies: (HTMLElement | null)[]; caps: HTMLElement[]; section: HTMLElement | null; base: string; mat: HTMLElement | null; phone: HTMLElement | null } | null = null;
  constructor(root: HTMLElement, idx: number) {
    this.root = root;
    this.id = root.dataset.story || "story-" + idx;
    this.key = "story:" + this.id + ":" + idx;
    this.track = root.querySelector<HTMLElement>(".story-track")!;
    this.stage = root.querySelector<HTMLElement>(".story-stage")!;
    this.run = root.querySelector<HTMLElement>(".story-run")!;
    this.layout = window.matchMedia(WIDE_MQ).matches ? "wide" : "narrow";
    root.classList.remove("static");
    delete root.dataset.staticReason;
    root.dataset.layout = this.layout;
    (storyApi as any)[this.id] = this.api();
    if (!this.track || !this.stage || !this.run) { this.fail("act", "a story needs .story-track, .story-stage and .story-run"); return; }
    /* Steps (text steps and empty beats) for this layout, in document order. */
    this.steps = qsa(".story-step, .story-beat", root).filter((s) => !s.dataset.only || s.dataset.only === this.layout);
    this.n = this.steps.length;
    if (!this.n) { this.fail("act", "a story needs at least one .story-step or .story-beat"); return; }
    try {
      this.acts = this.steps.map((s) => (s.dataset.act ? parseAct(s.dataset.act) : {}) as Record<string, Act>);
    } catch (e) {
      this.fail("act", "a data-act is not valid JSON", e); return;
    }
    this.w = this.steps.map((s) => Math.max(0.05, num(s.dataset.w, 1)));
    let acc = 0;
    this.cum = this.w.map((x) => { const c = acc; acc += x; return c; });
    this.W = acc;
    this.subs = this.steps.map((s) => qsa(".story-sub", s));
    this.subIdx = this.steps.map(() => -1);
    /* E5: a mark goes to the step whose data-step equals its data-go (its index among this layout's steps), so a
     * story whose steps differ by layout (data-only) numbers its marks per layout; a mark whose step is not in
     * this layout is hidden. A step without data-step answers to its index. */
    const keyOf = (s: HTMLElement, j: number) => (s.dataset.step ?? String(j)).trim();
    const stepKeys = this.steps.map(keyOf);
    this.marks = qsa<HTMLButtonElement>(".story-marks [data-go]", root).flatMap((b) => {
      const k = stepKeys.indexOf((b.dataset.go || "").trim());
      b.hidden = k < 0;
      return k < 0 ? [] : [{ b, k, i: b.querySelector<HTMLElement>(":scope > i") }];
    });
    this.countK = root.querySelector<HTMLElement>(".story-count-k");
    this.countN = root.querySelector<HTMLElement>(".story-count-n");
    if (this.countN) this.countN.textContent = " / " + pad2(this.n);
    if (this.countK) this.countK.textContent = pad2(1);
    this.gEls = qsa("[data-story-g]", root);
    this.devs = qsa("[data-device]", this.stage).filter(rendered).map((el) => this.device(el));
    if (this.id === "day") {
      const section = root.closest<HTMLElement>("[data-tone]");
      this.day = {
        skies: ["morning", "midday", "afternoon", "evening"].map((k) => this.stage.querySelector<HTMLElement>(`[data-sky="${k}"]`)),
        caps: qsa(".day-cap", this.stage), section, base: section?.dataset.tone || "cream",
        mat: this.stage.querySelector<HTMLElement>(".day-stage"), phone: this.devs[0]?.el || null
      };
    }
    this.bindKeys();
    this.ok = true;
    this.measure();
  }
  api() {
    const self = this;
    return {
      get G() { return self.G; }, get k() { return self.k; }, get p() { return self.p; }, get pinned() { return self.pinned; },
      get static() { return self.root.classList.contains("static") ? self.root.dataset.staticReason || "media" : ""; },
      get stick() { return self.stick; }, get D() { return self.D; }, get n() { return self.n; },
      get count() { return (self.countK?.textContent || "") + (self.countN?.textContent || ""); },
      layout: this.layout,
      frames: () => Object.fromEntries(this.devs.map((d) => [d.name, d.sc.index()]))
    };
  }
  /* Parse every act for one device into a change list, ring presses, clicks, cursor and camera keys, typing,
   * strip and halo ranges, the lift, and the frames each step needs (for warming). */
  device(el: HTMLElement): Dev {
    const sc = sceneFor(el);
    const name = el.dataset.device || "";
    const win = el.classList.contains("win");
    const d: Dev = { name, el, sc, win, first: sc.rest, changes: [], rings: [], clicks: [], cur: [], cams: [], types: [], strips: [], halos: [], lift: null, warm: [], shown: sc.index(), prevG: NaN };
    const act = (k: number): Act => ({ ...(this.acts[k]["*"] || {}), ...(this.acts[k][name] || {}) });
    /* Pass 1: cursor keys (a click's wipe starts at the cursor's y). */
    for (let k = 0; k < this.n; k++) (act(k).cur || []).forEach(([t, x, y]) => d.cur.push([k + t, x, y]));
    d.cur.sort((a, b) => a[0] - b[0]);
    const curY = (g: number) => (d.cur.length ? keyed(d.cur, g)[1] : 0);
    /* Pass 2: frames and presses. */
    let f = act(0).f ?? sc.rest;
    d.first = f;
    const pending: { k: number; a: Act }[] = [];
    for (let k = 0; k < this.n; k++) {
      const a = act(k);
      const need = new Set<number>([f]);
      if (a.in) { if (win) d.clicks.push(k); else d.rings.push([k, a.in[0], a.in[1]]); }
      if (a.f !== undefined && a.f !== f) { d.changes.push({ g: k, from: f, to: a.f, y: a.in ? a.in[1] : 0 }); f = a.f; }
      need.add(f);
      if (a.tap && !win) d.rings.push([k + a.tap[2], a.tap[0], a.tap[1]]);
      if (a.click !== undefined && win) d.clicks.push(k + a.click);
      if (a.next) {
        const at = a.next[0];
        let y = 0;
        if (a.tap && !win && at - a.tap[2] >= -1e-6 && at - a.tap[2] <= 0.08 + 1e-6) y = a.tap[1];
        else if (a.click !== undefined && win && at - a.click >= -1e-6 && at - a.click <= 0.08 + 1e-6) y = curY(k + a.click);
        d.changes.push({ g: k + at, from: f, to: a.next[1], y });
        f = a.next[1];
        need.add(f);
      }
      d.cams[k] = a.cam && a.cam.length && !a.cur && a.halo === undefined ? [[0, 1, 50, 50], ...a.cam, [1, 1, 50, 50]] : null;
      if (a.halo !== undefined) {
        const h = el.querySelector<HTMLElement>(`.halo[data-halo="${a.halo}"]`);
        if (h) {
          let e = d.halos.find((x) => x.el === h);
          if (!e) { e = { el: h, x: num(h.style.getPropertyValue("--x")), y: num(h.style.getPropertyValue("--y")), on: [] }; d.halos.push(e); }
          e.on.push({ k, end: a.haloEnd ?? 1 });
        }
      }
      if (a.lift && !d.lift) d.lift = [k + a.lift[0], k + a.lift[1]];
      if (a.type || a.scroll) pending.push({ k, a });
      d.warm.push(need);
    }
    /* Typing and strips belong to the frame on screen when they start. */
    for (const { k, a } of pending) {
      if (a.type) {
        const [t0, t1] = a.type;
        const fr = sc.frames[this.frameAt(d, k + t0)];
        const lines = fr ? qsa(".type-line", fr) : [];
        if (lines.length) {
          const ws = lines.map((l) => Math.max(0.1, num(l.style.getPropertyValue("--w"), 1)));
          const tot = ws.reduce((x, y) => x + y, 0), span = t1 - t0;
          let at = k + t0;
          const starts: number[] = [], lens: number[] = [];
          ws.forEach((wv) => { const len = (span * wv) / tot; starts.push(at); lens.push(len); at += len; });
          d.types.push({ lines, starts, lens });
        }
      }
      if (a.scroll) {
        const [t0, t1, from, to] = a.scroll;
        const fr = sc.frames[this.frameAt(d, k + t0)];
        const body = fr?.querySelector<HTMLElement>(".scroll-body");
        if (body) {
          let e = d.strips.find((x) => x.body === body);
          if (!e) { e = { body, ranges: [] }; d.strips.push(e); }
          e.ranges.push([k + t0, k + t1, from, to]);
        }
      }
    }
    d.strips.forEach((s) => s.ranges.sort((a, b) => a[0] - b[0]));
    d.rings.sort((a, b) => a[0] - b[0]);
    return d;
  }
  frameAt(d: Dev, g: number) { let f = d.first; for (const c of d.changes) { if (c.g <= g + 1e-9) f = c.to; else break; } return f; }
  fail(reason: string, why?: string, err?: unknown) {
    this.ok = false;
    const r = this.root;
    r.classList.add("static");
    r.classList.remove("is-live", "is-pinned", "is-anchored");
    r.dataset.staticReason = reason;
    if (why && import.meta.env.DEV) console.warn(`story "${this.id}": ${why}`, err ?? "");
    this.reset();
  }
  /* Everything this engine wrote, taken back: the static layout reads the server markup. */
  reset() {
    this.devs.forEach((d) => {
      d.sc.reset();
      d.types.forEach((t) => t.lines.forEach((l) => l.style.removeProperty("--m")));
      d.strips.forEach((s) => s.body.style.removeProperty("--off"));
      d.halos.forEach((h) => { h.el.style.removeProperty("transform"); h.el.style.removeProperty("opacity"); });
      d.el.style.removeProperty("--lift");
      d.shown = d.sc.index(); d.prevG = NaN;
    });
    this.c.clear();
    this.steps.forEach((s) => s.classList.remove("is-current", "is-dim"));
    this.subs.flat().forEach((s) => s.classList.remove("is-current"));
    this.subIdx = this.steps.map(() => -1);
    this.marks.forEach((m) => { m.b.removeAttribute("aria-current"); m.i?.style.removeProperty("--f"); });
    if (this.countK) this.countK.textContent = pad2(1);
    this.gEls.forEach((e) => e.style.removeProperty("--g"));
    this.root.style.removeProperty("--story-stick");
    this.root.style.removeProperty("--anchor-y");
    delete this.root.dataset.k;
    if (this.day) {
      this.day.skies.forEach((s) => s?.style.removeProperty("opacity"));
      this.day.caps.forEach((c, j) => c.classList.toggle("on", j === 0));
      if (this.day.section) this.day.section.dataset.tone = this.day.base;
      this.day.mat?.classList.remove("is-night");
      this.day.phone?.style.removeProperty("--sx"); this.day.phone?.style.removeProperty("--floor-a");
      this.day.mat?.style.removeProperty("--day-cap");
    }
    this.k = -1; this.lastGs = "";
    if (this.pinned) { this.pinned = false; this.root.classList.remove("is-pinned"); }
  }
  destroy() { this.off.forEach((f) => f()); this.off = []; this.reset(); this.root.classList.remove("is-live", "is-pinned", "is-anchored"); }
  /* 1.4.4: the stick position, the anchor mask, the bottom stick, the fit guard and the readability floors. */
  measure() {
    if (!this.ok && this.root.dataset.staticReason === "act") return;
    const r = this.root;
    const wasStatic = r.classList.contains("static");
    r.classList.remove("static");
    delete r.dataset.staticReason;
    const pr = sysProbe();
    this.svh = pr.offsetHeight;
    const cs = getComputedStyle(r);
    this.navH = num(getComputedStyle(html).getPropertyValue("--nav-h"), 72);
    const top = num(cs.getPropertyValue("--story-top"), this.navH), gap = num(cs.getPropertyValue("--story-gap"), 16);
    this.D = this.run.offsetHeight;
    if (this.D < 1 || this.svh < 1) { this.fail("media"); return; }
    const st = this.stage.getBoundingClientRect();
    const H = this.stage.offsetHeight;
    const svh = this.svh;
    let stick: number | null = null, anchorY: number | null = null;
    if (H <= svh - top - gap + 1) stick = top + gap;
    else {
      const anchor = qsa(`[data-story-anchor="${this.layout}"], [data-story-anchor="both"]`, this.stage).find(rendered);
      if (anchor) {
        const a = anchor.getBoundingClientRect().top - st.top;
        if (H - a <= svh - this.navH - 12 + 1) { stick = this.navH + 12 - a; anchorY = a; }
      }
      if (stick === null) {
        const first = this.firstText();
        const s2 = svh - H;
        if (first !== null && first - st.top + s2 >= this.navH + 8) stick = s2;
      }
    }
    if (stick === null) { this.fail("fit", "the stage does not fit this viewport"); return; }
    /* Nothing the reader needs may be clipped by a stage of fixed height. */
    if (H <= svh + 1) {
      const parts = [this.stage.querySelector(".story-steps"), this.stage.querySelector(".story-marks"), this.stage.querySelector(".story-copy"), this.stage.querySelector(".story-cta"), ...qsa(".story-device-box", this.stage)].filter(rendered);
      const bad = parts.find((el) => { const b = el.getBoundingClientRect(); return b.bottom > st.bottom + 1 || b.top < st.top - 1; });
      if (bad) { this.fail("fit", `.${bad.className.split(" ")[0]} overflows the stage`); return; }
    }
    /* No device may run below the viewport while the stage is stuck (a hero's phone, a hanging phone). */
    const lowDev = this.devs.find((d) => d.el.getBoundingClientRect().bottom - st.top + stick! > svh + 1);
    if (lowDev) { this.fail("fit", `device "${lowDev.name}" runs below the viewport when pinned`); return; }
    for (const d of this.devs) {
      d.sc.measure();
      const wpx = d.win ? d.el.offsetWidth : d.sc.sw;
      if (d.win ? wpx < 680 : wpx < 150) { this.fail("floor", `device "${d.name}" is ${wpx}px wide, under its readability floor`); return; }
    }
    this.ok = true;
    this.stick = stick;
    r.style.setProperty("--story-stick", stick.toFixed(1) + "px");
    if (anchorY !== null) { r.style.setProperty("--anchor-y", anchorY.toFixed(1) + "px"); r.classList.add("is-anchored"); }
    else { r.style.removeProperty("--anchor-y"); r.classList.remove("is-anchored"); }
    r.classList.add("is-live");
    if (wasStatic) { this.c.clear(); this.devs.forEach((d) => { d.prevG = NaN; d.shown = d.sc.index(); }); this.k = -1; }
    this.lastGs = "";
    this.warm(Math.max(0, this.k));
  }
  /* The top of the stage's first line of visible text (for the bottom stick). */
  firstText(): number | null {
    const tw = document.createTreeWalker(this.stage, NodeFilter.SHOW_TEXT, { acceptNode: (n) => ((n.textContent || "").trim() && !n.parentElement?.closest(".sr-only, [aria-hidden='true'], .story-static") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const rs = rg.getClientRects();
      if (rs.length) return rs[0].top;
    }
    return null;
  }
  /* 1.9: marks are buttons; focus that lands inside a step makes that step current. */
  bindKeys() {
    const on = (t: EventTarget, type: string, fn: any) => { t.addEventListener(type, fn); this.off.push(() => t.removeEventListener(type, fn)); };
    this.marks.forEach((m, j) => {
      on(m.b, "click", () => this.go(m.k));
      on(m.b, "keydown", (e: KeyboardEvent) => {
        const nx = e.key === "ArrowRight" || e.key === "ArrowDown" ? j + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? j - 1 : -1;
        if (nx < 0 || nx >= this.marks.length) return;
        e.preventDefault();
        this.marks[nx].b.focus({ preventScroll: true });
        this.go(this.marks[nx].k);
      });
    });
    on(this.root, "focusin", (e: FocusEvent) => {
      const s = (e.target as Element | null)?.closest?.(".story-step");
      if (!s) return;
      const k = this.steps.indexOf(s as HTMLElement);
      if (k >= 0 && k !== this.k) this.go(k);
    });
  }
  /* Scroll so that step k's t = .3 sits at the stick position. */
  go(k: number) {
    if (!this.ok || !this.root.classList.contains("is-live") || k < 0 || k >= this.n) return;
    const r = this.track.getBoundingClientRect();
    const top = window.scrollY + (r.top - this.stick) + (this.D * (this.cum[k] + 0.3 * this.w[k])) / this.W;
    window.scrollTo({ top: Math.round(top), behavior: reduced() ? "auto" : "smooth" });
  }
  /* Warm the frames of steps k to k + 2 for every device: eager, and decoded before they are needed. Only for a
   * story within two screens of the viewport: one further down keeps its lazy images until the data-warm observer
   * (warming(), two screens ahead) or this, as the reader nears it, asks for them, so a page's first load fetches
   * only what is near its first screen. */
  warm(k: number) {
    const r = this.track.getBoundingClientRect(), vh = this.svh || window.innerHeight;
    if (r.top > 2 * vh || r.bottom < -vh) return;
    for (const d of this.devs) {
      for (let j = Math.max(0, k); j <= Math.min(this.n - 1, k + 2); j++) {
        d.warm[j]?.forEach((fi) => {
          const fr = d.sc.frames[fi];
          if (!fr) return;
          const imgs = fr.tagName === "IMG" ? [fr as HTMLImageElement] : qsa<HTMLImageElement>("img", fr);
          imgs.forEach((img) => {
            if (img.loading === "lazy") img.loading = "eager";
            if (typeof img.decode === "function") img.decode().catch(() => { /* not loaded yet; it will */ });
          });
        });
      }
    }
  }
  read() { return this.track.getBoundingClientRect(); }
  /* One pass per animation frame (1.5): the track's rect was read before any story wrote. Returns pinned. */
  write(r: DOMRect): boolean {
    if (!this.ok || !this.root.classList.contains("is-live")) return false;
    const D = this.D, n = this.n;
    const p = D > 0 ? clamp01((this.stick - r.top) / D) : 0;
    this.p = p;
    const target = p * this.W;
    let acc = 0, k = 0;
    while (k < n - 1 && acc + this.w[k] <= target) { acc += this.w[k]; k++; }
    const Graw = k + clamp01((target - acc) / this.w[k]);
    const wasVisible = this.visible;
    this.visible = r.bottom > 0 && r.top < this.svh * 1.2;
    const near = r.bottom > -this.svh && r.top < 2 * this.svh;
    const G = smooth(this.key, Graw, 0.07);
    const Gs = G.toFixed(4);
    const pinned = p > 0 && p < 1;
    if (pinned !== this.pinned) { this.pinned = pinned; this.root.classList.toggle("is-pinned", pinned); }
    if (Gs === this.lastGs && (!near || this.k >= 0)) return pinned;
    this.lastGs = Gs;
    this.G = G;
    const kNow = Math.min(n - 1, Math.floor(G + 1e-9));
    const t = G - kNow;
    if (kNow !== this.k) this.setStep(kNow);
    /* Sub blocks, marks, the progress bar, the words rule, [data-story-g]. */
    const subs = this.subs[kNow];
    if (subs.length) {
      let si = 0;
      for (const [st, i] of this.subKeys(kNow)) if (t >= st - 1e-9) si = i;
      if (si !== this.subIdx[kNow]) { this.subIdx[kNow] = si; subs.forEach((s) => s.classList.toggle("is-current", Number(s.dataset.sub) === si)); }
    }
    /* E1: each mark's fill is --f (0 to 1); the CSS maps it to scaleX (the narrow rail) or scaleY (the wide rail). */
    for (const m of this.marks) if (m.i) put(this.c, m.i, "--f", (m.k < kNow ? 1 : m.k > kNow ? 0 : t).toFixed(4));
    if (this.gEls.length) { const gs = G.toFixed(3); for (const e of this.gEls) put(this.c, e, "--g", gs); }
    for (const d of this.devs) this.drawDevice(d, G, kNow, t, wasVisible);
    if (this.day) this.drawDay(G);
    return pinned;
  }
  subKeys(k: number): [number, number][] {
    const all = this.acts[k]["*"]?.sub;
    if (all) return all;
    for (const d of this.devs) { const a = this.acts[k][d.name]; if (a?.sub) return a.sub; }
    return [];
  }
  setStep(k: number) {
    this.k = k;
    this.root.dataset.k = String(k);
    this.steps.forEach((s, j) => { s.classList.toggle("is-current", j === k); s.classList.toggle("is-dim", j !== k); });
    this.marks.forEach((m) => { if (m.k === k) m.b.setAttribute("aria-current", "step"); else m.b.removeAttribute("aria-current"); });
    if (this.countK) this.countK.textContent = pad2(k + 1);
    if (this.subs[k].length && this.subIdx[k] < 0) { this.subIdx[k] = 0; this.subs[k].forEach((s) => s.classList.toggle("is-current", Number(s.dataset.sub) === 0)); }
    if (this.day) {
      const last = k === this.n - 1;
      this.day.caps.forEach((c) => c.classList.toggle("on", Number(c.dataset.cap) === k));
      if (this.day.section) this.day.section.dataset.tone = last ? "navy" : this.day.base;
      this.day.mat?.classList.toggle("is-night", last);
      /* The tone pass already ran this frame: one more frame, so the page tone re-reads the section. */
      need = true;
    }
    this.warm(k);
  }
  drawDevice(d: Dev, G: number, k: number, t: number, wasVisible: boolean) {
    const sc = d.sc, c = this.c;
    /* Camera first: the ring, the cursor and the halos are mapped through it. */
    const cam = d.cams[k];
    if (cam) { const [s, ox, oy] = keyed(cam, t); sc.camTo(s, ox, oy); } else sc.camTo(1, 50, 50);
    /* The frame for G: a wipe when exactly one change was crossed since the last frame, else a cut. */
    const want = this.frameAt(d, G);
    if (want !== d.shown) {
      const lo = Math.min(d.prevG, G), hi = Math.max(d.prevG, G);
      const crossed = Number.isFinite(d.prevG) ? d.changes.filter((ch) => ch.g > lo + 1e-9 && ch.g <= hi + 1e-9) : [];
      if (wasVisible && crossed.length === 1) sc.show(want, false, crossed[0].y); else sc.show(want, true);
      d.shown = want;
    } else if (sc.index() !== want) sc.show(want, true);
    d.prevG = G;
    /* The ring: arrives over -.10 to -.03, presses -.03 to 0, releases 0 to .08 around each press point. */
    if (sc.tap) {
      let best: K3 | null = null, bu = 1;
      for (const rg of d.rings) { const u = G - rg[0]; if (u >= -0.1 && u <= 0.08 && Math.abs(u) < Math.abs(bu)) { best = rg; bu = u; } }
      if (best) {
        const u = bu;
        let op: number, s: number, fill: number;
        if (u < -0.03) { const q = (u + 0.1) / 0.07; op = 0.9 * q; s = 0.6 + 0.18 * q; fill = 0.5; }
        else if (u < 0) { const q = (u + 0.03) / 0.03; op = 0.9; s = 0.78 - 0.18 * q; fill = 0.5 + 0.4 * q; }
        else { const q = u / 0.08; op = 0.9 * (1 - q); s = 0.6 + 0.6 * q; fill = 0.9; }
        const [x, y] = sc.toScreen(best[1], best[2]);
        put(c, sc.tap, "transform", `translate(${x.toFixed(2)}cqw, ${y.toFixed(2)}cqh) translate(-50%, -50%) scale(${s.toFixed(3)})`);
        put(c, sc.tap, "opacity", op.toFixed(3));
        put(c, sc.tap, "--fill", fill.toFixed(3));
      } else put(c, sc.tap, "opacity", "0");
    }
    /* The cursor (windows): visible while live, pressed within -.012 to +.02 of a click. */
    if (sc.cur && d.win) {
      if (d.cur.length) {
        const [cx, cy] = keyed(d.cur, G);
        const [x, y] = sc.toScreen(cx, cy);
        put(c, sc.cur, "transform", `translate(${x.toFixed(2)}cqw, ${y.toFixed(2)}cqh) translate(-23%, -12%)`);
        put(c, sc.cur, "opacity", "1");
        const pressed = d.clicks.some((ck) => G >= ck - 0.012 && G <= ck + 0.02);
        if (sc.curSvg) put(c, sc.curSvg, "transform", pressed ? "scale(.8)" : "none");
      } else put(c, sc.cur, "opacity", "0");
    }
    /* Type lines: --m 1 hides a line's text, 0 shows it; lines laid end to end over the range by width. */
    for (const ty of d.types) ty.lines.forEach((l, i) => put(c, l, "--m", (1 - clamp01((G - ty.starts[i]) / ty.lens[i])).toFixed(3)));
    /* Strips: the offset in em, sine eased inside each range, holding between them. */
    for (const s of d.strips) {
      let off = s.ranges[0][2];
      for (const [g0, g1, from, to] of s.ranges) { if (G >= g1) off = to; else if (G > g0) { off = from + (to - from) * sine((G - g0) / (g1 - g0)); break; } else break; }
      put(c, s.body, "--off", off.toFixed(3));
    }
    /* Halos: in over t 0 to .1, out over .9 to 1 (or to haloEnd), in capture coordinates through the camera. */
    for (const h of d.halos) {
      let o = 0, hs = 0.86;
      for (const e of h.on) if (e.k === k && t <= e.end) { const a = clamp01(t / 0.1); o = a * (1 - clamp01((t - (e.end - 0.1)) / 0.1)); hs = 0.86 + 0.14 * a; }
      const [x, y] = sc.toScreen(h.x, h.y);
      put(c, h.el, "transform", `translate(${x.toFixed(2)}cqw, ${y.toFixed(2)}cqh) translate(-50%, -50%) scale(${hs.toFixed(3)})`);
      put(c, h.el, "opacity", o.toFixed(3));
    }
    if (d.lift) { const [g0, g1] = d.lift; put(c, d.el, "--lift", (G <= g0 ? 0 : G >= g1 ? 1 : sine((G - g0) / (g1 - g0))).toFixed(3)); }
  }
  /* The day story (S5): four sky layers blend with G, the floor shadow swings, the caption reads the step. */
  drawDay(G: number) {
    const day = this.day!;
    const s = clamp01((G - 0.5) / Math.max(1, this.n - 1));
    let wM = 1 - clamp01((s - 0.25) / 0.25), wD = 1 - clamp01(Math.abs(s - 0.5) / 0.25), wA = 1 - clamp01(Math.abs(s - 0.75) / 0.25), wE = clamp01((s - 0.75) / 0.25);
    const sum = wM + wD + wA + wE || 1;
    wM /= sum; wD /= sum; wA /= sum; wE /= sum;
    [wM, wD, wA, wE].forEach((v, i) => { const sk = day.skies[i]; if (sk) put(this.c, sk, "opacity", v.toFixed(3)); });
    if (day.phone) {
      put(this.c, day.phone, "--sx", (-26 * wM + 26 * wA).toFixed(1) + "px");
      put(this.c, day.phone, "--floor-a", (0.3 + 0.25 * wE).toFixed(3));
    }
    if (day.mat) put(this.c, day.mat, "--day-cap", `color-mix(in srgb, #6e6660, #b8b2a8 ${(wE * 100).toFixed(1)}%)`);
  }
}
/* One controller per story: bound while STORY_MQ matches, rebound when it or the wide line changes. */
function stories() {
  const els = qsa("[data-story]");
  for (const k of Object.keys(storyApi)) delete storyApi[k];
  storyRuns = [];
  if (!els.length) return;
  const mq = window.matchMedia(STORY_MQ), wq = window.matchMedia(WIDE_MQ);
  const runs: (StoryRun | null)[] = els.map(() => null);
  storyRuns = runs;
  const bind = () => {
    runs.forEach((r, i) => {
      r?.destroy();
      const el = els[i];
      /* E3: data-story-layouts="wide" (a list of wide, narrow) keeps a story to those layouts; in any other it is
       * static with the reason "layout" (the IOS hero under 1069 wide). */
      const allowed = (el.dataset.storyLayouts || "").split(/[\s,]+/).filter(Boolean);
      const layoutOk = !allowed.length || allowed.includes(wq.matches ? "wide" : "narrow");
      if (mq.matches && layoutOk) { runs[i] = new StoryRun(el, i); return; }
      runs[i] = null;
      const reason = mq.matches ? "layout" : "media";
      el.classList.add("static");
      el.classList.remove("is-live", "is-pinned", "is-anchored");
      el.dataset.staticReason = reason;
      delete el.dataset.layout;
      (storyApi as any)[el.dataset.story || "story-" + i] = { static: reason, G: 0, k: -1, p: 0, pinned: false, layout: "static", count: "", frames: () => ({}) };
    });
    kick();
  };
  const onChange = () => bind();
  mq.addEventListener("change", onChange);
  wq.addEventListener("change", onChange);
  cleanups.push(() => { mq.removeEventListener("change", onChange); wq.removeEventListener("change", onChange); runs.forEach((r) => r?.destroy()); storyRuns = []; });
  bind();
  /* An image that loads inside a stage may change what fits: measure again, once per burst. */
  let mt = 0;
  listen(document, "load", (e: Event) => {
    const t = e.target as HTMLElement;
    if (t && t.tagName === "IMG" && t.closest(".story-stage")) { clearTimeout(mt); mt = window.setTimeout(() => { runs.forEach((r) => r?.measure()); kick(); }, 120); }
  }, true);
  cleanups.push(() => clearTimeout(mt));
  document.fonts?.ready.then(() => { runs.forEach((r) => r?.measure()); kick(); });
  register({
    measure() { runs.forEach((r) => r?.measure()); },
    frame() {
      /* Every rect first, then every write. */
      const rects = runs.map((r) => (r && r.ok ? r.read() : null));
      runs.forEach((r, i) => { const rc = rects[i]; if (r && rc) r.write(rc); });
    }
  });
}

/* ── Flip cards: click, tap, Enter and Space. Never on their own. ───────── */
function flips() {
  qsa<HTMLButtonElement>(".flip").forEach((card) => {
    const faces = () => {
      const open = card.getAttribute("aria-pressed") === "true";
      card.querySelector(".flip-front")?.setAttribute("aria-hidden", String(open));
      card.querySelector(".flip-back")?.setAttribute("aria-hidden", String(!open));
    };
    faces();
    let t = 0;
    listen(card, "click", () => {
      const open = card.getAttribute("aria-pressed") === "true";
      card.setAttribute("aria-pressed", String(!open));
      faces();
      if (reduced()) return;
      card.classList.add("flipping");
      cancel(t);
      t = after(640, () => card.classList.remove("flipping"));
    });
  });
}

/* ── Accordion: a button with aria-expanded; anchors open their item. ───── */
function accordions() {
  const items = qsa(".q");
  if (!items.length) return;
  const setOpen = (q: HTMLElement, open: boolean) => {
    const b = q.querySelector<HTMLButtonElement>(".q-btn");
    b?.setAttribute("aria-expanded", String(open));
    q.classList.toggle("open", open);
  };
  items.forEach((q) => {
    const b = q.querySelector<HTMLButtonElement>(".q-btn");
    if (!b) return;
    listen(b, "click", () => setOpen(q, b.getAttribute("aria-expanded") !== "true"));
  });
  const openHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    const q = target?.closest<HTMLElement>(".q");
    if (q) setOpen(q, true);
  };
  openHash();
  listen(window, "hashchange", openHash);
}

/**
 * Campaign parameters ride through to the app. A link that carries
 * data-passthrough gets the page's utm_* and from parameters appended, so the
 * campaign that brought somebody here is the one their start is counted under.
 */
const CARRY_KEY = "innerboard.carried";
function passthrough() {
  const params = new URLSearchParams(window.location.search);
  let carried = new URLSearchParams();
  for (const [key, value] of params) {
    if (/^utm_/i.test(key) || /^(from|ref|gclid|fbclid|msclkid)$/.test(key)) carried.set(key, value);
  }
  try {
    if ([...carried.keys()].length) sessionStorage.setItem(CARRY_KEY, carried.toString());
    else carried = new URLSearchParams(sessionStorage.getItem(CARRY_KEY) || "");
  } catch { /* storage may be unavailable */ }
  if ([...carried.keys()].length === 0) return;
  qsa<HTMLAnchorElement>("a[data-passthrough]").forEach((a) => {
    try {
      const url = new URL(a.href);
      for (const [key, value] of carried) url.searchParams.set(key, value);
      a.href = url.toString();
    } catch { /* a mailto or a hash: leave it */ }
  });
}

/* ── Bound once for the life of the document ────────────────────────────── */
let booted = false;
function bootOnce() {
  if (booted) return;
  booted = true;
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-event]");
    if (!target) return;
    const name = target.dataset.event;
    if (!name) return;
    track(name, { location: target.dataset.eventLocation || "", href: (target as HTMLAnchorElement).href || "" });
  });
}

/* ── 1.7.18 Lifecycle ───────────────────────────────────────────────────── */
function teardown() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  timers.forEach((t) => window.clearTimeout(t));
  timers.clear();
  scenesTeardown();
  mods = [];
  themeHooks.length = 0;
  lined.length = 0;
  for (const k of Object.keys(S)) delete S[k];
  if (queued) { cancelAnimationFrame(raf); queued = false; }
}
function page() {
  teardown();
  generation++;
  html.classList.remove("no-js");
  html.classList.add("js");
  html.classList.remove("menu-open");
  bootOnce();
  loopSetup();
  tone();
  header();
  reveals();
  lineRise(generation);
  lit();
  scenesBind();
  draws();
  floors();
  /* Stories after every other reader of layout, so their writes never force a layout inside the frame. */
  stories();
  parallax();
  warming();
  tilt();
  flips();
  accordions();
  passthrough();
  measure();
}

// Module scripts run after the document is parsed, so bind now. With Astro's
// ClientRouter, astro:page-load also fires after every navigation (and once
// on first load, which the guard below skips).
let firstLoadDone = false;
page();
document.addEventListener("astro:page-load", () => {
  if (!firstLoadDone) { firstLoadDone = true; return; }
  page();
});
document.addEventListener("astro:before-swap", () => {
  scenes.forEach((s) => s.settle());
  if (queued) { cancelAnimationFrame(raf); queued = false; }
});
// Before a swapped page paints, mark it so nothing flashes visible then hides.
document.addEventListener("astro:after-swap", () => { html.classList.remove("no-js"); html.classList.add("js"); });
