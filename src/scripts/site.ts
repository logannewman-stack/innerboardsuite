/**
 * The site's one script. Entrances, headline word reveals, the header and
 * its progress bar, the mobile menu, section highlighting in the nav, number
 * count-ups, the cursor glow on dark sections, tilt on the hero visual, the
 * scroll-driven product story, flip cards, analytics events, and campaign
 * parameters passed through to the app.
 *
 * Everything here is progressive: without it the page is complete, readable
 * and every link works. With reduced motion on, nothing moves.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (name: string, options?: { props?: Record<string, string> }) => void;
  }
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
function listen<K extends keyof WindowEventMap>(target: Window, type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions): void;
function listen<K extends keyof HTMLElementEventMap>(target: HTMLElement | Document, type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions): void;
function listen(target: any, type: string, fn: any, opts?: AddEventListenerOptions) {
  target.addEventListener(type, fn, opts);
  cleanups.push(() => target.removeEventListener(type, fn, opts));
}
function observe(io: IntersectionObserver) {
  cleanups.push(() => io.disconnect());
}

/** Split a headline into words, keeping its <em> and the spaces between words. */
function splitWords(el: HTMLElement) {
  if (el.dataset.split === "done") return;
  let i = 0;
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text.trim()) return;
      const frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const w = document.createElement("span");
          w.className = "w";
          w.style.setProperty("--i", String(i++));
          w.textContent = part;
          frag.appendChild(w);
        }
      });
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk);
    }
  };
  Array.from(el.childNodes).forEach(walk);
  el.dataset.split = "done";
  el.classList.add("words-ready");
}

function entrances() {
  if (!reduced()) document.querySelectorAll<HTMLElement>("[data-words]").forEach(splitWords);
  const items = document.querySelectorAll<HTMLElement>(".reveal, .draw, [data-words], [data-chat], [data-count]");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        if ((entry.target as HTMLElement).dataset.count !== undefined) countUp(entry.target as HTMLElement);
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
  observe(io);
}

/** A number that counts from zero to itself once seen. */
function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  if (reduced()) { el.textContent = String(target); return; }
  const duration = Number(el.dataset.countDuration || 1400);
  const decimals = (el.dataset.count || "").split(".")[1]?.length || 0;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function header() {
  const el = document.querySelector<HTMLElement>("[data-header]");
  if (!el) return;
  const bar = el.querySelector<HTMLElement>("[data-progress]");
  const onScroll = () => {
    el.classList.toggle("is-scrolled", window.scrollY > 24);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    }
  };
  onScroll();
  listen(window, "scroll", onScroll, { passive: true });

  const button = el.querySelector<HTMLButtonElement>("[data-menu-button]");
  const panel = el.querySelector<HTMLElement>("[data-menu-panel]");
  if (!button || !panel) return;
  const set = (open: boolean) => {
    panel.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("menu-open", open);
  };
  listen(button, "click", () => set(!panel.classList.contains("is-open")));
  panel.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => listen(a, "click", () => set(false)));
  listen(document, "keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) {
      set(false);
      button.focus();
    }
  });
  const mq = window.matchMedia("(min-width: 1024px)");
  const onChange = (e: MediaQueryListEvent) => e.matches && set(false);
  mq.addEventListener("change", onChange);
  cleanups.push(() => mq.removeEventListener("change", onChange));
}

/** The nav link for the section on screen is marked, so the header reads as a map. */
function scrollspy() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-header] nav a[href*='#']"));
  if (!links.length) return;
  const pairs = links
    .map((a) => {
      const id = a.getAttribute("href")?.split("#")[1];
      const section = id ? document.getElementById(id) : null;
      return section ? { a, section } : null;
    })
    .filter(Boolean) as { a: HTMLAnchorElement; section: HTMLElement }[];
  if (!pairs.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const pair = pairs.find((p) => p.section === entry.target);
        if (!pair) continue;
        if (entry.isIntersecting) {
          pairs.forEach((p) => { p.a.classList.remove("is-active"); p.a.removeAttribute("aria-current"); });
          pair.a.classList.add("is-active");
          pair.a.setAttribute("aria-current", "location");
        }
      }
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
  );
  pairs.forEach((p) => io.observe(p.section));
  observe(io);
}

/** A soft light that follows the pointer across dark sections. Desktop only. */
function glow() {
  if (!finePointer() || reduced()) return;
  document.querySelectorAll<HTMLElement>("[data-glow]").forEach((section) => {
    let raf = 0;
    listen(section, "pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = section.getBoundingClientRect();
        section.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        section.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
        section.classList.add("is-lit");
      });
    });
    listen(section, "pointerleave", () => section.classList.remove("is-lit"));
  });
}

/** The hero visual leans a few degrees toward the pointer. Desktop only. */
function tilt() {
  if (!finePointer() || reduced()) return;
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    const max = Number(el.dataset.tilt || 6);
    let raf = 0;
    listen(el, "pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1200px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
      });
    });
    listen(el, "pointerleave", () => { el.style.transform = ""; });
  });
}

/**
 * The product story: a phone that stays put while the steps scroll past it,
 * showing the screen each step is about.
 */
function stories() {
  document.querySelectorAll<HTMLElement>("[data-story]").forEach((story) => {
    const steps = Array.from(story.querySelectorAll<HTMLElement>("[data-step]"));
    const screens = Array.from(story.querySelectorAll<HTMLElement>("[data-screen]"));
    if (!steps.length || !screens.length) return;
    const show = (name: string) => {
      screens.forEach((s) => s.classList.toggle("is-active", s.dataset.screen === name));
      steps.forEach((s) => s.classList.toggle("is-current", s.dataset.step === name));
    };
    show(steps[0].dataset.step || "");
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) show((hit.target as HTMLElement).dataset.step || "");
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    steps.forEach((s) => io.observe(s));
    observe(io);
  });
}

/**
 * A paragraph that lights up a word at a time as it crosses the middle of
 * the screen. The words are split once; scrolling sets how many are lit.
 */
function scrollwords() {
  const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-scrollwords]"));
  if (!blocks.length) return;
  blocks.forEach((el) => {
    if (reduced()) { el.classList.add("sw-done"); return; }
    splitWords(el);
    el.classList.add("sw");
  });
  if (reduced()) return;
  const words = new Map(blocks.map((el) => [el, Array.from(el.querySelectorAll<HTMLElement>(".w"))]));
  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    for (const el of blocks) {
      const r = el.getBoundingClientRect();
      // 0 when the block's top reaches 80% down the screen, 1 when its bottom passes 35%.
      const start = vh * 0.8, end = vh * 0.35;
      const p = Math.min(1, Math.max(0, (start - r.top) / (r.height + (start - end))));
      const list = words.get(el) || [];
      const n = Math.round(p * list.length);
      list.forEach((w, i) => w.classList.toggle("lit", i < n));
    }
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  update();
  listen(window, "scroll", onScroll, { passive: true });
  listen(window, "resize", onScroll, { passive: true });
}

/** Flip cards: click, tap, Enter and Space. Never on their own. */
function flips() {
  document.querySelectorAll<HTMLButtonElement>(".flip").forEach((card) => {
    listen(card, "click", () => {
      const open = card.getAttribute("aria-pressed") === "true";
      card.setAttribute("aria-pressed", String(!open));
    });
  });
}

/**
 * Campaign parameters ride through to the app. A link that carries
 * data-passthrough gets the page's utm_* and from parameters appended, so the
 * campaign that brought somebody here is the one their start is counted under.
 */
function passthrough() {
  const params = new URLSearchParams(window.location.search);
  const carried = new URLSearchParams();
  for (const [key, value] of params) {
    if (/^utm_/i.test(key) || key === "from" || key === "ref") carried.set(key, value);
  }
  if ([...carried.keys()].length === 0) return;
  document.querySelectorAll<HTMLAnchorElement>("a[data-passthrough]").forEach((a) => {
    try {
      const url = new URL(a.href);
      for (const [key, value] of carried) url.searchParams.set(key, value);
      a.href = url.toString();
    } catch {
      /* a mailto or a hash: leave it */
    }
  });
}

/* ── Bound once for the life of the document ────────────────────────────── */
let booted = false;
function bootOnce() {
  if (booted) return;
  booted = true;
  // Clicks on anything carrying data-event send that event.
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-event]");
    if (!target) return;
    const name = target.dataset.event;
    if (!name) return;
    track(name, { location: target.dataset.eventLocation || "", href: (target as HTMLAnchorElement).href || "" });
  });
}

function page() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.remove("menu-open");
  bootOnce();
  entrances();
  header();
  scrollspy();
  glow();
  tilt();
  stories();
  scrollwords();
  flips();
  passthrough();
}

// With Astro's ClientRouter, astro:page-load fires on the first load and after
// every navigation. Without it, this runs once, now.
if (document.querySelector('meta[name="astro-view-transitions-enabled"]')) {
  document.addEventListener("astro:page-load", page);
} else {
  page();
}
