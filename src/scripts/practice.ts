/**
 * The site's one script (the design's own, page by page): the menu and the InnerBoard submenu, the app preview on
 * the home page (the rep of the day and the streak, remembered in this browser; the one thing you bring), the
 * Academy's collections and levels, and the Company OS Score form. Everything it touches is in the page already, so
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

/* Home: the app preview. */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private window: the preview just forgets */ } }
};
const row = $("streakRow"), dareBtn = $("dareBtn"), streakLabel = $("streakLabel");
if (row && dareBtn && streakLabel) {
  const draw = () => {
    const did = store.get("tp-dare") === "1";
    [...row.children].forEach((d, i) => d.classList.toggle("done", (i >= 1 && i <= 3) || (did && i === 4)));
    streakLabel.innerHTML = `<strong>${did ? 4 : 3} days</strong> in a row`;
    dareBtn.setAttribute("aria-pressed", String(did));
    dareBtn.textContent = did ? "Rep logged ✓" : "I did it";
  };
  dareBtn.addEventListener("click", () => { store.set("tp-dare", store.get("tp-dare") === "1" ? "0" : "1"); draw(); });
  draw();
}
const oneThing = $<HTMLFormElement>("oneThing"), oneInput = $<HTMLInputElement>("oneInput"), oneNote = $("oneNote");
if (oneThing && oneInput && oneNote) {
  oneThing.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = oneInput.value.trim();
    oneNote.textContent = v ? `Got it. “${v}” is today’s one thing. Let’s start there.` : "Bring one thing. Even a small one counts.";
  });
}

/* Academy: pick a collection, then a level, to see its lessons. */
const data = $("collData"), grid = $("collGrid");
if (data && grid) {
  const { c: C, notes } = JSON.parse(data.textContent || "{}") as { c: { name: string; title: string; desc: string; levels: string[][]; image: string }[]; notes: string[] };
  const tabs = [...document.querySelectorAll<HTMLButtonElement>(".tabs button")];
  const img = $<HTMLImageElement>("collImg")!, eyebrow = $("collEyebrow")!, title = $("collTitle")!, desc = $("collDesc")!, note = $("levelNote")!, lessons = $("lessons")!;
  let cur = 0, lvl = 0;
  const draw = () => {
    const c = C[cur];
    [...grid.children].forEach((b, i) => b.setAttribute("aria-pressed", String(i === cur)));
    tabs.forEach((t, i) => t.setAttribute("aria-selected", String(i === lvl)));
    eyebrow.textContent = c.name; img.src = c.image; img.alt = c.name;
    title.textContent = c.title; desc.textContent = c.desc; note.textContent = notes[lvl];
    lessons.replaceChildren(...c.levels[lvl].map((t, i) => {
      const li = document.createElement("li");
      const n = document.createElement("b"); n.textContent = String(i + 1).padStart(2, "0");
      const s = document.createElement("span"); s.textContent = t;
      const k = document.createElement("small"); k.textContent = "Lesson + rep";
      li.append(n, s, k);
      return li;
    }));
  };
  [...grid.children].forEach((b, i) => b.addEventListener("click", () => {
    cur = i; lvl = 0; draw();
    document.querySelector(".detail")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }));
  tabs.forEach((t) => t.addEventListener("click", () => { lvl = Number(t.dataset.level); draw(); }));
}

/* IOS: the Company OS Score form opens an email to the team with what was entered (the site has no form backend). */
const iosForm = $<HTMLFormElement>("iosForm"), iosMsg = $("iosMsg");
if (iosForm && iosMsg) {
  iosForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (id: string) => ($<HTMLInputElement>(id)?.value || "").trim();
    const name = val("f-name"), org = val("f-org");
    const body = [`Name: ${name}`, `Organization: ${org}`, `Work email: ${val("f-email")}`, `Team size: ${val("f-size")}`, "", "What we would like to improve:", val("f-goal")].join("\n");
    const to = iosForm.dataset.to || "info@innerboardsuite.com";
    location.href = `mailto:${to}?subject=${encodeURIComponent(`Company OS Score: ${org}`)}&body=${encodeURIComponent(body)}`;
    iosMsg.textContent = `Thanks, ${name.split(" ")[0]}. Your email is ready to send to ${to}. If it didn’t open, write to that address and we’ll start with your baseline.`;
  });
}
