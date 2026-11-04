/**
 * The site's one script (the design's own, page by page): the menu and the InnerBoard submenu, the Academy's
 * collections, and the Company OS Score form (into the assessment in the app). Everything it touches is in the page already, so
 * without it every page still reads in full.
 */
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

/* Header: the menu (small screens) and the InnerBoard submenu. */
const menu = $("navlinks"), menuBtn = $("menuBtn"), learnBtn = $("learnBtn"), learnMenu = $("learnMenu");
if (menu && menuBtn && learnBtn && learnMenu) {
  const setLearn = (open: boolean) => { learnMenu.hidden = !open; learnBtn.setAttribute("aria-expanded", String(open)); };
  learnBtn.addEventListener("click", (e) => { e.stopPropagation(); setLearn(learnMenu.hidden); });
  document.addEventListener("click", (e) => { if (!learnBtn.parentElement!.contains(e.target as Node) && window.innerWidth > 980) setLearn(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setLearn(false); });
  menuBtn.addEventListener("click", () => { const open = menu.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", String(open)); if (open) setLearn(true); });
  /* A link to a place on the same page closes the menu behind it. */
  menu.addEventListener("click", (e) => { if ((e.target as Element).closest("a")) { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); setLearn(false); } });
}

/* Academy: pick a collection to see what is in it (its logo, its line, its courses where the app has them). */
const data = $("collData"), grid = $("collGrid");
if (data && grid) {
  type View = { name: string; desc: string; courses: string[]; image: string; dark: string; eyebrow: string; ctaText: string; ctaHref: string; head: string; noteText: string };
  const { c: C } = JSON.parse(data.textContent || "{}") as { c: View[] };
  const img = $<HTMLImageElement>("collImg")!, dark = $<HTMLSourceElement>("collImgDark")!, eyebrow = $("collEyebrow")!, title = $("collTitle")!, desc = $("collDesc")!;
  const cta = $<HTMLAnchorElement>("collCta")!, ctaText = $("collCtaText")!, head = $("collListHead")!, note = $("collNote")!, lessons = $("lessons")!;
  let cur = 0;
  const draw = () => {
    const c = C[cur];
    [...grid.children].forEach((b, i) => b.setAttribute("aria-pressed", String(i === cur)));
    eyebrow.textContent = c.eyebrow; dark.srcset = c.dark; img.src = c.image; img.alt = c.name;
    title.textContent = c.name; desc.textContent = c.desc;
    cta.href = c.ctaHref; ctaText.textContent = c.ctaText;
    head.textContent = c.head; head.hidden = !c.head;
    note.textContent = c.noteText; note.hidden = !c.noteText;
    lessons.hidden = !c.courses.length;
    lessons.replaceChildren(...c.courses.map((t, i) => {
      const li = document.createElement("li");
      const n = document.createElement("b"); n.textContent = String(i + 1).padStart(2, "0");
      const s = document.createElement("span"); s.textContent = t;
      const k = document.createElement("small"); k.textContent = "Course";
      li.append(n, s, k);
      return li;
    }));
  };
  [...grid.children].forEach((b, i) => b.addEventListener("click", () => {
    cur = i; draw();
    document.querySelector(".detail")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }));
}

/* IOS: the Company OS Score form sends the visitor straight into the assessment in the app, with their name and
 * email for the app to fill in. The organization, team size and goal are the design's fields; the app has no place
 * for them yet, so they stay on the page. */
const iosForm = $<HTMLFormElement>("iosForm");
if (iosForm) {
  iosForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (id: string) => ($<HTMLInputElement>(id)?.value || "").trim();
    // The app reads ?name= and ?email= from a website's link, keeps them on the device, takes them off the address,
    // and fills in the score's form and the account it offers (the client, November 3: "we capture their email and
    // then right when they click submit they go right into the practice app").
    const to = new URL(iosForm.dataset.to || "", location.href);
    to.searchParams.set("name", val("f-name"));
    to.searchParams.set("email", val("f-email"));
    location.href = to.toString();
  });
}
