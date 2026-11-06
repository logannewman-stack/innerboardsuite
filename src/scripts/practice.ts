/**
 * The site's one script (the design's own, page by page): the menu and the InnerBoard submenu, and the Company OS
 * Score form (into the assessment in the app). Everything it touches is in the page already, so without it every
 * page still reads in full. (The Academy's collections open by their address, with CSS alone.)
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
