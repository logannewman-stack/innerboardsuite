/**
 * The site's one script: one scroll loop, one set of observers, no
 * dependencies. Every mechanic of BUILD_SPEC 1.7 lives here, numbered as
 * there: the loop and smoothing (1.7.1), reveals (1.7.2), line rise (1.7.3),
 * lit statements (1.7.4), page tone (1.7.5), the header (1.7.6), the scene
 * engine (1.7.7), the loop phone (1.7.8), the day stage (1.7.9), rails
 * (1.7.10), the scroll screen (1.7.11), parallax (1.7.12), previews (1.7.13),
 * drawn lines (1.7.14), run gates (1.7.15), image warming (1.7.16), tilt
 * (1.7.17) and the lifecycle (1.7.18). Kept from the first build: track(),
 * passthrough(), the header menu and flips().
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
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const DARK = new Set(["navy", "forest", "charcoal", "ink", "teal"]);

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
function progress(el: HTMLElement, h: number) { const r = el.getBoundingClientRect(); return clamp01(-r.top / (r.height - h)); }
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
function measure() {
  vh = window.innerHeight;
  const docW = html.clientWidth;
  html.style.setProperty("--vh", vh + "px");
  const gutter = Math.min(120, Math.max(20, docW * 0.042));
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
    if (t && t.tagName === "IMG" && t.closest("[data-frames], [data-rail], [data-story], .floor, .tile")) kick();
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
  revealIO = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      arrive(entry.target);
      revealIO?.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  items.forEach((el) => revealIO!.observe(el));
  observe(revealIO);
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
let litN = 0;
function lit() {
  qsa("[data-lit], [data-scrollwords]").forEach((el) => {
    if (el.dataset.litDone) return;
    el.dataset.litDone = "1";
    const key = "lit:" + litN++;
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
const themeHooks: Array<() => void> = [];
function tone() {
  const sections = qsa("[data-tone]");
  if (!sections.length) return;
  register({ frame() {
    let t = sections[0].dataset.tone || html.dataset.theme || "cream";
    for (const s of sections) {
      if (s.getBoundingClientRect().top > vh * 0.5) break;
      t = s.dataset.tone || t;
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
  /* A surface (plate, panel, paper, mat, tile, a device's screen or bezel)
   * paints its own colour and decides for itself: `data-surface` when it says
   * so, else by class. A bleed section paints nothing, so its tone is the
   * page's current theme, which is what the body is actually showing under
   * the bar (the day stage's sky follows its section, so it is not listed). */
  const SURFACE = "[data-tone], [data-surface], .paper, .paper-teal, .mat, .mat-blush, .tile, .phone-screen, .win-screen, .phone, .win";
  const LIGHT = ".paper, .paper-teal, .mat, .mat-blush, .tile, .phone-screen, .win-screen";
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
    for (let i = 0; i < 21; i++) {
      const stack = document.elementsFromPoint(w * (0.1 + 0.04 * i), y);
      for (const node of stack) {
        if (el.contains(node) || (panel && panel.contains(node))) continue;
        const src = node.closest(SURFACE);
        if (src && isDark(src)) dark++;
        break;
      }
    }
    const want = dark >= 11;
    clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      if (el.classList.contains("is-dark") !== want) {
        el.classList.toggle("is-dark", want);
        try { sessionStorage.setItem("ib.nav", want ? "dark" : "light"); } catch { /* no storage */ }
      }
    }, 110);
  };
  themeHooks.push(() => after(110, sample));

  /* Hide on scroll. */
  let acc = 0, lastY = window.scrollY, sampledY = -1e9, hidden = false;
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
    if (Math.abs(y - sampledY) > 2) { sampledY = y; sample(); }
    const locked = now - loadAt < 1200 || now - resizeAt < 500 || menuOpen() || el.contains(document.activeElement);
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
  const mq = window.matchMedia("(min-width: 1069px)");
  const onChange = (e: MediaQueryListEvent) => e.matches && set(false);
  mq.addEventListener("change", onChange);
  cleanups.push(() => { mq.removeEventListener("change", onChange); html.classList.remove("menu-open"); });
}

/* ── 1.7.7 Scene engine ─────────────────────────────────────────────────── */
type Step = (string | number)[];
const scenes = new Map<Element, Scene>();
class Scene {
  el: HTMLElement; screen: HTMLElement | null; cam: HTMLElement | null; cur: HTMLElement | null; tap: HTMLElement | null;
  frames: HTMLImageElement[]; steps: Step[] | null = null; loopMs = 0; rest = 0; auto = false; visible = false;
  run = 0; timers: number[] = []; io: IntersectionObserver | null = null; pending = 0; wasT = 0;
  /* data-flow-delay: the first play waits this many ms after the page bound (a hero scene that should
   * start 1.6 s after load); later entries wait the usual 300 ms. */
  delay = 0; born = performance.now();
  constructor(el: HTMLElement) {
    this.el = el;
    this.screen = el.querySelector(".phone-screen, .win-screen");
    this.cam = el.querySelector(".cam");
    this.cur = el.querySelector(".cur");
    this.tap = el.querySelector(".tap");
    this.frames = qsa<HTMLImageElement>("img.ds", el);
    this.rest = Number(el.dataset.rest || 0);
    this.loopMs = Number(el.dataset.flowLoop || 0);
    this.delay = Number(el.dataset.flowDelay || 0);
    this.auto = !!el.dataset.flow && !el.closest("[data-rail], [data-story], [data-loop]");
    if (this.auto) { try { this.steps = JSON.parse(el.dataset.flow || "null"); } catch { this.steps = null; } }
    const first = this.frames[0];
    if (first && this.screen) {
      const done = () => this.screen?.classList.add("has-frame");
      if (first.complete && first.naturalWidth) done(); else first.addEventListener("load", done, { once: true });
    }
    if (reduced()) { this.show(this.rest, true); return; }
    if ("IntersectionObserver" in window) {
      this.io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          const v = e.isIntersecting && e.intersectionRatio >= 0.25;
          if (v === this.visible) continue;
          this.visible = v;
          if (v) this.onEnter(); else this.stop();
        }
      }, { threshold: [0, 0.25, 0.5] });
      this.io.observe(el);
    } else this.visible = true;
  }
  onEnter() {
    if (!this.steps || document.hidden) return;
    cancel(this.pending);
    const wait = Math.max(300, this.delay - (performance.now() - this.born));
    this.delay = 0;
    this.pending = after(wait, () => this.play());
  }
  set(steps: Step[] | null, loopMs = 0) { this.steps = steps; this.loopMs = loopMs; }
  play() {
    if (!this.steps || !this.visible || document.hidden || reduced()) return;
    this.halt();
    const id = ++this.run;
    this.el.classList.add("playing");
    this.step(0, id);
  }
  halt() { this.run++; this.timers.forEach((t) => cancel(t)); this.timers = []; cancel(this.pending); this.el.classList.remove("playing"); }
  stop(resetFrames = this.auto) {
    this.halt();
    this.cur?.classList.remove("on", "press");
    this.resetCam();
    if (resetFrames) this.show(this.rest, true);
  }
  destroy() { this.halt(); this.io?.disconnect(); }
  /* Only the camera is reset here, and only when it has moved, so a frame
   * crossfade started in the same tick (a step change, a preview) still
   * animates over its 320 ms instead of being cut by the reset class. */
  resetCam() {
    if (!this.cam || !this.cam.style.transform) return;
    const cam = this.cam;
    cam.classList.add("cam-reset");
    cam.style.setProperty("--cd", "0ms");
    cam.style.transform = "";
    requestAnimationFrame(() => cam.classList.remove("cam-reset"));
  }
  later(ms: number, fn: () => void, id: number) { const t = after(ms, () => { if (id === this.run) fn(); }); this.timers.push(t); }
  step(i: number, id: number) {
    if (id !== this.run) return;
    const s = this.steps?.[i];
    if (!s) return this.end(id);
    const next = (ms: number) => this.later(ms, () => this.step(i + 1, id), id);
    const n = (k: number) => Number(s[k]) || 0;
    switch (s[0]) {
      case "start": this.place(n(1), n(2), 0); next(0); break;
      case "hold": next(n(1)); break;
      case "cam": this.camTo(Math.min(1.3, n(1)), n(2), n(3), n(4)); next(n(4)); break;
      case "move": this.cur?.classList.add("on"); this.place(n(1), n(2), n(3)); next(n(3)); break;
      case "click": this.cur?.classList.add("press"); this.later(150, () => this.cur?.classList.remove("press"), id); next(150); break;
      case "tap": this.tapAt(n(1), n(2)); next(420); break;
      case "state": this.show(n(1)); next(n(2)); break;
      case "end": this.end(id); break;
      default: next(0);
    }
  }
  end(id: number) {
    if (id !== this.run) return;
    this.el.classList.remove("playing");
    if (this.loopMs > 0) this.later(this.loopMs, () => this.play(), id);
  }
  place(x: number, y: number, ms: number) {
    for (const t of [this.cur, this.tap]) {
      if (!t) continue;
      t.style.setProperty("--cd", ms + "ms");
      t.style.setProperty("--tx", x + "cqw");
      t.style.setProperty("--ty", y + "cqh");
    }
  }
  camTo(s: number, ox: number, oy: number, ms: number) {
    if (!this.cam) return;
    this.cam.style.setProperty("--cd", ms + "ms");
    this.cam.style.transform = `translate(${(ox * (1 - s)).toFixed(3)}%, ${(oy * (1 - s)).toFixed(3)}%) scale(${s})`;
  }
  tapAt(x: number, y: number) {
    if (!this.tap) return;
    this.tap.style.setProperty("--tx", x + "cqw");
    this.tap.style.setProperty("--ty", y + "cqh");
    this.tap.classList.remove("go");
    void this.tap.offsetWidth;
    this.tap.classList.add("go");
  }
  show(i: number, instant = false) {
    const target = this.frames[i];
    if (!target) return;
    const on = this.frames.find((f) => f.classList.contains("on"));
    if (on === target) return;
    if (instant) this.el.classList.add("reset");
    cancel(this.wasT);
    this.frames.forEach((f) => f.classList.remove("was"));
    if (on) { on.classList.remove("on"); if (!instant) on.classList.add("was"); }
    target.classList.add("on");
    if (instant) requestAnimationFrame(() => this.el.classList.remove("reset"));
    else this.wasT = after(400, () => on?.classList.remove("was"));
    this.syncCaps(i);
  }
  /* The caption and the pager beside a window follow the frame it shows. */
  syncCaps(i: number) {
    const host = this.el.parentElement;
    if (!host) return;
    qsa(".win-cap[data-cap]", host).forEach((c) => c.classList.toggle("on", Number(c.dataset.cap) === i));
    qsa<HTMLButtonElement>(".win-pager [data-go]", host).forEach((b) => { const on = Number(b.dataset.go) === i; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
  }
}
/* The registries are exposed for QA scripts (read only). */
(window as any).__ib = { scenes, S };
function sceneFor(el: HTMLElement) {
  let s = scenes.get(el);
  if (!s) { s = new Scene(el); scenes.set(el, s); }
  return s;
}
function scenesBind() {
  qsa("[data-frames]").forEach((el) => sceneFor(el));
  listen(document, "visibilitychange", () => {
    scenes.forEach((s) => { if (document.hidden) s.stop(); else if (s.visible) s.onEnter(); });
  });
}
function scenesTeardown() { scenes.forEach((s) => s.destroy()); scenes.clear(); }

/* ── 1.7.8 Loop phone ───────────────────────────────────────────────────── */
function loops() {
  qsa("[data-loop]").forEach((panel) => {
    const phone = panel.querySelector<HTMLElement>("[data-frames]");
    const rows = qsa("[data-loop-step]", panel);
    if (!phone || !rows.length) return;
    const scene = sceneFor(phone);
    const light = (k: number) => rows.forEach((r, j) => r.classList.toggle("is-on", j === k));
    if (reduced()) { light(0); scene.show(0, true); return; }
    let i = 0, active = false, inView = false, pinned: number | null = null, timer = 0, resume = 0;
    let stepTimers: number[] = [];
    const clear = () => { cancel(timer); stepTimers.forEach(cancel); stepTimers = []; };
    const stepTo = (k: number) => {
      i = k;
      light(k);
      const row = rows[k];
      const f = row.dataset.loopFrame;
      if (f !== undefined && f !== "none") scene.show(Number(f));
      const tap = row.dataset.loopTap;
      if (tap) {
        const [x, y, delay, frame] = tap.split(",").map(Number);
        stepTimers.push(after(delay, () => { scene.tapAt(x, y); stepTimers.push(after(220, () => scene.show(frame))); }));
      }
    };
    const schedule = () => {
      cancel(timer);
      if (!active || pinned !== null) return;
      timer = after(Number(rows[i].dataset.loopMs || 2400), () => { clear(); stepTo((i + 1) % rows.length); schedule(); });
    };
    /* Runs while the panel is 35% visible and the tab is visible; stops on
     * either and resumes where it stopped when both hold again. */
    const sync = () => {
      const v = inView && !document.hidden;
      if (v === active) return;
      active = v;
      if (active) { stepTo(i); schedule(); } else clear();
    };
    const io = new IntersectionObserver((entries) => {
      const e = entries[entries.length - 1];
      inView = e.isIntersecting && e.intersectionRatio >= 0.35;
      sync();
    }, { threshold: [0, 0.35, 0.7] });
    io.observe(panel);
    observe(io);
    listen(document, "visibilitychange", sync);
    rows.forEach((row, j) => {
      const pin = () => { pinned = j; cancel(resume); clear(); stepTo(j); };
      const unpin = () => { pinned = null; cancel(resume); resume = after(1500, () => { if (active && pinned === null) schedule(); }); };
      listen(row, "pointerenter", pin);
      listen(row, "focusin", pin);
      listen(row, "pointerleave", unpin);
      listen(row, "focusout", unpin);
    });
  });
}

/* ── 1.7.9 Day stage ────────────────────────────────────────────────────── */
let storyN = 0;
function stories() {
  qsa("[data-story]").forEach((story) => {
    const steps = qsa("[data-step]", story);
    const stage = story.querySelector<HTMLElement>(".day-stage");
    const phone = stage?.querySelector<HTMLElement>("[data-frames]");
    if (!steps.length || !stage || !phone) { story.classList.add("static"); return; }
    if (reduced()) { story.classList.add("static"); return; }
    const key = "day:" + storyN++;
    const section = story.closest<HTMLElement>("[data-tone]");
    const baseTone = section?.dataset.tone || "cream";
    const scene = sceneFor(phone);
    const skies = { morning: stage.querySelector<HTMLElement>('[data-sky="morning"]'), midday: stage.querySelector<HTMLElement>('[data-sky="midday"]'), afternoon: stage.querySelector<HTMLElement>('[data-sky="afternoon"]'), evening: stage.querySelector<HTMLElement>('[data-sky="evening"]') };
    const caps = qsa(".day-cap", stage);
    const tabs = qsa<HTMLButtonElement>("[data-go]", stage);
    const stepsCol = story.querySelector<HTMLElement>(".day-steps");
    const stageCol = story.querySelector<HTMLElement>(".day-stagecol");
    const lastIdx = steps.length - 1;
    let idx = -1, lastMy = -1, phoneLayout = false;
    const setIdx = (k: number) => {
      idx = k;
      steps.forEach((s, j) => { s.classList.toggle("is-current", j === k); s.classList.toggle("is-dim", j !== k); });
      const entry = Number(steps[k].dataset.flowEntry ?? steps[k].dataset.stepScreen ?? 0);
      scene.stop(false);
      scene.show(entry);
      caps.forEach((c) => c.classList.toggle("on", Number(c.dataset.cap) === k));
      tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(j === k)); t.tabIndex = j === k ? 0 : -1; });
      const flow = steps[k].dataset.flow;
      if (flow) { try { scene.set(JSON.parse(flow), 0); scene.play(); } catch { scene.set(null); } } else scene.set(null);
      if (section) section.dataset.tone = k === lastIdx ? "navy" : baseTone;
      stage.classList.toggle("is-night", k === lastIdx);
      /* The tone pass ran earlier in this frame and the sky smoothing may have snapped (a jump of two or
       * more steps), so ask for one more frame: the page tone then re-reads this section's data-tone. */
      need = true;
    };
    const goTo = (k: number) => {
      const r = steps[k].getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + r.top - (vh - r.height) / 2, behavior: "smooth" });
    };
    tabs.forEach((t, j) => {
      listen(t, "click", () => goTo(j));
      listen(t, "keydown", (e: KeyboardEvent) => {
        const n = e.key === "ArrowRight" || e.key === "ArrowDown" ? j + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? j - 1 : -1;
        if (n < 0 || n >= tabs.length) return;
        e.preventDefault(); tabs[n].focus(); goTo(n);
      });
    });
    register({ measure() { phoneLayout = !!stageCol && getComputedStyle(stageCol).position === "sticky"; if (!phoneLayout) { stepsCol?.style.removeProperty("--my"); lastMy = -1; } }, frame() {
      const c = vh / 2;
      let best = 0, bd = Infinity;
      steps.forEach((s, j) => { const r = s.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - c); if (d < bd - 0.5) { bd = d; best = j; } });
      if (best !== idx) setIdx(best);
      if (phoneLayout && stepsCol) {
        const my = Math.max(0, stage.getBoundingClientRect().bottom - stepsCol.getBoundingClientRect().top);
        if (Math.abs(my - lastMy) > 0.5) { lastMy = my; stepsCol.style.setProperty("--my", my.toFixed(1) + "px"); }
      }
      const s = smooth(key, idx / Math.max(1, lastIdx), 0.1);
      let wM = 1 - clamp01((s - 0.25) / 0.25), wD = 1 - clamp01(Math.abs(s - 0.5) / 0.25), wA = 1 - clamp01(Math.abs(s - 0.75) / 0.25), wE = clamp01((s - 0.75) / 0.25);
      const sum = wM + wD + wA + wE || 1;
      wM /= sum; wD /= sum; wA /= sum; wE /= sum;
      if (skies.morning) skies.morning.style.opacity = wM.toFixed(3);
      if (skies.midday) skies.midday.style.opacity = wD.toFixed(3);
      if (skies.afternoon) skies.afternoon.style.opacity = wA.toFixed(3);
      if (skies.evening) skies.evening.style.opacity = wE.toFixed(3);
      const sx = -26 * wM + 26 * wA;
      phone.style.setProperty("--sx", sx.toFixed(1) + "px");
      phone.style.setProperty("--floor-a", (0.3 + 0.25 * wE).toFixed(3));
      stage.style.setProperty("--day-cap", `color-mix(in srgb, #5c574f, #cdc6b8 ${(wE * 100).toFixed(1)}%)`);
    } });
  });
}

/* ── 1.7.10 Rail engine ─────────────────────────────────────────────────── */
function rails() {
  qsa("[data-rail]").forEach((rail) => {
    const track = rail.querySelector<HTMLElement>(".rail-track");
    const slides = track ? qsa(".rail-slide", track) : [];
    if (!track || !slides.length) return;
    const tabs = qsa<HTMLButtonElement>(".rail-tab", rail);
    const prev = rail.querySelector<HTMLButtonElement>(".rail-prev");
    const next = rail.querySelector<HTMLButtonElement>(".rail-next");
    const byPage = rail.dataset.by === "page";
    if (!track.hasAttribute("tabindex")) track.tabIndex = 0;
    if (!track.getAttribute("role")) track.setAttribute("role", "region");
    if (!track.getAttribute("aria-roledescription")) track.setAttribute("aria-roledescription", "carousel");
    let cur = -1, settleT = 0, settling = false, dragging = false, dragged = false, animRaf = 0;
    const edge = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const starts = () => slides.map((s) => s.offsetLeft - edge());
    const maxLeft = () => track.scrollWidth - track.clientWidth;
    const indexAt = (x: number) => { const st = starts(); let b = 0, bd = Infinity; st.forEach((s, i) => { const d = Math.abs(s - x); if (d < bd) { bd = d; b = i; } }); return b; };
    const perPage = () => Math.max(1, Math.floor((track.clientWidth - edge()) / (slides[0].offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0))));
    const set = (i: number, go: boolean) => {
      i = Math.max(0, Math.min(slides.length - 1, i));
      const changed = i !== cur;
      cur = i;
      slides.forEach((s, j) => { s.classList.toggle("on", j === i); s.classList.toggle("off", j !== i); });
      tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
      if (changed) slides.forEach((s, j) => {
        const f = s.querySelector<HTMLElement>("[data-frames][data-flow]");
        if (!f) return;
        const sc = sceneFor(f);
        if (j === i) { try { sc.set(JSON.parse(f.dataset.flow || "null"), Number(f.dataset.flowLoop || 0)); sc.play(); } catch { /* bad flow */ } }
        else sc.stop(false);
      });
      if (go) {
        settling = true; clearTimeout(settleT);
        settleT = window.setTimeout(() => { settling = false; }, 900);
        track.scrollTo({ left: Math.min(maxLeft(), starts()[i]), behavior: reduced() ? "auto" : "smooth" });
      }
    };
    let scrollRaf = 0;
    listen(track, "scroll", () => { if (settling || dragging || animRaf) return; if (!scrollRaf) scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; const i = indexAt(track.scrollLeft); if (i !== cur) set(i, false); }); }, { passive: true });
    if (prev) listen(prev, "click", () => set(cur - (byPage ? perPage() : 1), true));
    if (next) listen(next, "click", () => set(cur + (byPage ? perPage() : 1), true));
    tabs.forEach((t, j) => {
      listen(t, "click", () => set(j, true));
      listen(t, "keydown", (e: KeyboardEvent) => {
        const n = e.key === "ArrowRight" ? j + 1 : e.key === "ArrowLeft" ? j - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
        if (n < 0 || n >= tabs.length) return;
        e.preventDefault(); tabs[n].focus(); set(n, true);
      });
    });
    listen(track, "keydown", (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); set(cur + 1, true); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); set(cur - 1, true); }
    });
    slides.forEach((s, j) => listen(s, "click", (e: MouseEvent) => { if (dragged) { e.preventDefault(); return; } if (j !== cur) { e.preventDefault(); set(j, true); } }));
    listen(track, "dragstart", (e: Event) => e.preventDefault());
    /* Drag with momentum (fine pointers only). */
    if (finePointer() && !reduced()) {
      let startX = 0, startLeft = 0, samples: { t: number; x: number }[] = [], pid = -1;
      const animateTo = (target: number, v: number) => {
        const start = track.scrollLeft, delta = target - start;
        const dur = Math.min(600, Math.max(320, 300 + 0.2 * Math.abs(delta)));
        const dir = v !== 0 ? -Math.sign(v) : Math.sign(delta);
        const overshoot = Math.min(Math.abs(v) * dur, 3 * Math.abs(delta)) * dir;
        const t0 = performance.now();
        const tick = (now: number) => {
          const s = Math.min(1, (now - t0) / dur);
          track.scrollLeft = start + overshoot * (s * s * s - 2 * s * s + s) + delta * (3 * s * s - 2 * s * s * s);
          if (s < 1) animRaf = requestAnimationFrame(tick);
          else { animRaf = 0; track.scrollLeft = target; track.classList.remove("drag"); set(indexAt(target), false); }
        };
        if (animRaf) cancelAnimationFrame(animRaf);
        animRaf = requestAnimationFrame(tick);
      };
      listen(track, "pointerdown", (e: PointerEvent) => {
        if (e.button !== 0 || e.pointerType === "touch") return;
        if (animRaf) { cancelAnimationFrame(animRaf); animRaf = 0; track.classList.remove("drag"); }
        pid = e.pointerId; startX = e.clientX; startLeft = track.scrollLeft; samples = [{ t: performance.now(), x: e.clientX }]; dragging = false; dragged = false;
      });
      listen(track, "pointermove", (e: PointerEvent) => {
        if (e.pointerId !== pid) return;
        const dx = e.clientX - startX;
        if (!dragging) { if (Math.abs(dx) < 5) return; dragging = true; dragged = true; track.classList.add("drag"); track.setPointerCapture(pid); }
        track.scrollLeft = startLeft - dx;
        samples.push({ t: performance.now(), x: e.clientX }); if (samples.length > 12) samples.shift();
      });
      const release = (e: PointerEvent) => {
        if (e.pointerId !== pid) return;
        pid = -1;
        if (!dragging) return;
        dragging = false;
        const now = performance.now();
        const recent = samples.filter((s) => now - s.t <= 100);
        const a = recent[0], b = samples[samples.length - 1];
        const v = a && b && b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0; /* px per ms, pointer direction */
        const projected = track.scrollLeft - 180 * v;
        const st = starts();
        let i = indexAt(projected);
        if (!byPage) {
          const dragDx = e.clientX - startX;
          i = Math.max(cur - 1, Math.min(cur + 1, i));
          if (i === cur && Math.abs(v) < 0.05 && Math.abs(dragDx) >= 60) i = cur - Math.sign(dragDx);
          i = Math.max(0, Math.min(slides.length - 1, i));
        }
        animateTo(Math.min(maxLeft(), st[i]), v);
        after(50, () => { dragged = false; });
      };
      listen(track, "pointerup", release);
      listen(track, "pointercancel", release);
    }
    set(indexAt(track.scrollLeft), false);
    register({ measure() { if (cur >= 0 && !dragging && !animRaf) track.scrollLeft = Math.min(maxLeft(), starts()[cur]); }, frame() { /* nothing per frame */ } });
  });
}

/* ── 1.7.11 Scroll screen ───────────────────────────────────────────────── */
let qsN = 0;
function scrollScreens() {
  qsa("[data-scrollscreen]").forEach((screen) => {
    const sec = screen.closest<HTMLElement>("section") || screen.parentElement!;
    if (reduced()) { screen.style.setProperty("--p", "0"); return; }
    const key = "qs:" + qsN++;
    register({ frame() {
      const r = sec.getBoundingClientRect();
      const p = smooth(key, clamp01((vh * 0.85 - r.top) / (r.height + vh * 0.35)), 0.12);
      screen.style.setProperty("--p", p.toFixed(4));
    } });
  });
}

/* ── 1.7.12 Parallax ────────────────────────────────────────────────────── */
function parallax() {
  const els = qsa("[data-parallax]");
  els.forEach((el) => el.style.setProperty("--py", el.dataset.parallax || "0"));
  if (!els.length || reduced()) { html.style.setProperty("--hy", "0"); return; }
  register({ frame() { html.style.setProperty("--hy", smooth("hy", clamp01(window.scrollY / vh), 0.1).toFixed(4)); } });
}

/* ── 1.7.13 Previews ────────────────────────────────────────────────────── */
function previews() {
  const rows = qsa("[data-preview]");
  const pagers = qsa(".win-pager[data-preview-target]");
  const hosts = new Map<HTMLElement, { scene: Scene; resume: number }>();
  const hostFor = (sel: string | undefined) => {
    const win = sel ? document.querySelector<HTMLElement>(sel) : null;
    if (!win) return null;
    let h = hosts.get(win);
    if (!h) {
      h = { scene: sceneFor(win), resume: 0 };
      hosts.set(win, h);
    }
    return h;
  };
  const showFrame = (h: NonNullable<ReturnType<typeof hostFor>>, k: number, resumeMs: number) => {
    cancel(h.resume);
    h.scene.stop(false);
    h.scene.show(k);
    h.resume = after(resumeMs, () => { if (h.scene.steps) h.scene.play(); });
  };
  rows.forEach((row) => {
    const h = hostFor(row.dataset.previewTarget);
    if (!h) return;
    const k = Number(row.dataset.preview);
    const enter = () => { cancel(h.resume); h.scene.stop(false); h.scene.show(k); };
    const leave = () => { cancel(h.resume); h.resume = after(1500, () => { if (h.scene.steps) h.scene.play(); }); };
    listen(row, "pointerenter", (e: PointerEvent) => { if (e.pointerType !== "touch") enter(); });
    listen(row, "focusin", enter);
    listen(row, "pointerleave", leave);
    listen(row, "focusout", leave);
  });
  pagers.forEach((pager) => {
    const h = hostFor(pager.dataset.previewTarget);
    if (!h) return;
    const buttons = qsa<HTMLButtonElement>("[data-go]", pager);
    buttons.forEach((b, j) => {
      listen(b, "click", () => showFrame(h, Number(b.dataset.go), 6000));
      listen(b, "keydown", (e: KeyboardEvent) => {
        const n = e.key === "ArrowRight" ? j + 1 : e.key === "ArrowLeft" ? j - 1 : -1;
        if (n < 0 || n >= buttons.length) return;
        e.preventDefault(); buttons[n].focus(); showFrame(h, Number(buttons[n].dataset.go), 6000);
      });
    });
  });
}

/* ── 1.7.14 Drawn lines ─────────────────────────────────────────────────── */
function drawIn(el: Element) {
  qsa<SVGPathElement>(".draw-line", el).forEach((p) => { p.style.strokeDashoffset = "0"; });
}
function prepLine(p: SVGGeometryElement) {
  let L = 0;
  try { L = p.getTotalLength(); } catch { L = 0; }
  if (!L) return 0;
  p.style.strokeDasharray = String(L);
  p.style.strokeDashoffset = reduced() ? "0" : String(L);
  return L;
}
let drawN = 0;
function draws() {
  qsa("[data-draw='enter'], .draw").forEach((svg) => {
    qsa<SVGGeometryElement>(".draw-line", svg).forEach(prepLine);
    if (svg.classList.contains("in")) drawIn(svg);
  });
  qsa("[data-draw='scroll']").forEach((svg) => {
    const lines = qsa<SVGGeometryElement>(".draw-line", svg).map((p) => ({ p, L: prepLine(p) }));
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

/* ── 1.7.15 Run gates ───────────────────────────────────────────────────── */
function runGates() {
  const els = qsa("[data-run]");
  if (!els.length || reduced()) return;
  const seen = new Map<Element, boolean>();
  const apply = () => els.forEach((el) => el.classList.toggle("run", !!seen.get(el) && !document.hidden));
  const io = new IntersectionObserver((entries) => { entries.forEach((e) => seen.set(e.target, e.isIntersecting && e.intersectionRatio >= 0.35)); apply(); }, { threshold: [0, 0.35, 0.7] });
  els.forEach((el) => io.observe(el));
  observe(io);
  listen(document, "visibilitychange", apply);
}

/* ── 1.7.16 Image warming ───────────────────────────────────────────────── */
function warming() {
  const els = qsa("[data-warm]");
  if (!els.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      qsa<HTMLImageElement>("img[loading='lazy']", e.target).forEach((img) => (img.loading = "eager"));
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
  loops();
  stories();
  rails();
  scrollScreens();
  parallax();
  previews();
  draws();
  runGates();
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
  scenes.forEach((s) => s.halt());
  if (queued) { cancelAnimationFrame(raf); queued = false; }
});
// Before a swapped page paints, mark it so nothing flashes visible then hides.
document.addEventListener("astro:after-swap", () => { html.classList.remove("no-js"); html.classList.add("js"); });
