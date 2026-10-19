/**
 * The site's one script: entrances, the header, the mobile menu, analytics
 * events, and campaign parameters passed through to the assessment.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (name: string, options?: { props?: Record<string, string> }) => void;
  }
}

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

function entrances() {
  const items = document.querySelectorAll<HTMLElement>(".reveal, .draw");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
}

function header() {
  const el = document.querySelector<HTMLElement>("[data-header]");
  if (!el) return;
  const onScroll = () => el.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const button = el.querySelector<HTMLButtonElement>("[data-menu-button]");
  const panel = el.querySelector<HTMLElement>("[data-menu-panel]");
  if (!button || !panel) return;
  const set = (open: boolean) => {
    panel.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("menu-open", open);
  };
  button.addEventListener("click", () => set(!panel.classList.contains("is-open")));
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) {
      set(false);
      button.focus();
    }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => e.matches && set(false));
}

/** Clicks on anything carrying data-event send that event. */
function events() {
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-event]");
    if (!target) return;
    const name = target.dataset.event;
    if (!name) return;
    track(name, { location: target.dataset.eventLocation || "", href: (target as HTMLAnchorElement).href || "" });
  });
}

/**
 * Campaign parameters ride through to the assessment and the app. A link that
 * carries data-passthrough gets the page's utm_* and from parameters appended,
 * so the campaign that brought somebody here is the one the score is counted
 * under.
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
      for (const [key, value] of carried) {
        // The link's own `from` names this site; a campaign's `from` wins.
        url.searchParams.set(key, value);
      }
      a.href = url.toString();
    } catch {
      /* a mailto or a hash: leave it */
    }
  });
}

document.documentElement.classList.remove("no-js");
entrances();
header();
events();
passthrough();

/** Flip cards: click, tap, Enter and Space. Never on their own. */
function flips() {
  document.querySelectorAll<HTMLButtonElement>(".flip").forEach((card) => {
    card.addEventListener("click", () => {
      const open = card.getAttribute("aria-pressed") === "true";
      card.setAttribute("aria-pressed", String(!open));
    });
  });
}
flips();
