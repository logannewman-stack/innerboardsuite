# InnerBoard (innerboardsuite.com)

The InnerBoard website: the Suite homepage, the Practice sales page, the
Academy page and the INQ Certification page, plus contact, privacy and terms.

| Page | Built to |
| --- | --- |
| `/` | InnerBoard Suite Logan Handoff FINAL and the INNERBOARD SUITE build brief (D5 in the build tracker): the locked nav, the eight sections with their locked copy, the footer. |
| `/practice` | The Practice sales page: the app, section by section, in the style of a product-led software site. Every claim on it comes from the app's own copy and build maps. |
| `/academy` | Academy Page Rebuild: Copy and Build Directions (D1). Copy as written, cream and teal. |
| `/inq-certification` | The INQ Certification Page Mock-up (D9), copy as written, section by section. |
| `/contact`, `/privacy`, `/terms` | Plain-language pages; counsel review before launch. |

**Stack:** Astro 5 (static output), Tailwind 4, no framework runtime. Deploys on
Vercel as a static site; `vercel.json` carries the cache and security headers.

```bash
npm install
npm run dev        # localhost:4321
npm run build      # dist/
npm run sweep      # after a build: fails on any em/en dash or the lowercase i spelling of IOS in the output
```

## Where things are

| Path | What |
| --- | --- |
| `src/config/links.ts` | Every destination on the site. `into(path, from)` builds a link into Practice that carries where it was handed out (`?from=suite`, `?from=academy`, `?from=inq`, `?from=innerlab`). |
| `src/pages/*.astro` | One file per page, copy included. |
| `src/layouts/Base.astro` | The page shell: `theme` (`cream` for the Suite pages, `ac-cream` for Academy and INQ) written on `<html data-theme>`, the `nav-start` seed, fonts, meta, `ClientRouter`, the one script. |
| `src/components/Header.astro`, `Footer.astro` | The locked nav (Academy, INQ Certification, InnerBoard IOS, Start in Practice) with the mobile sheet, and the linen colophon with the founder line. Shared by every page. |
| `src/components/FlipCards.astro` | The four recognition cards: click, tap, Enter and Space; never on their own; reduced motion honoured. |
| `src/components/PhoneFrame.astro`, `WindowFrame.astro` | Real captures of the Practice app (`public/app/*.webp`) in a drawn phone and a drawn browser window, with stacked frames the scene engine plays. Taken from a local build of the app, unchanged, on October 19. Recapture when the app's screens change. |
| `src/components/Rail.astro`, `DayStage.astro`, `Geo.astro`, `ToggleCard.astro`, `Accordion.astro` | The shared primitives: the snap rail with arrows, tabs, keyboard and drag; the sticky day stage (five phones under reduced motion); the mark geometry that draws itself; the toggle card (image only); the FAQ accordion (a button per question, every answer open without the script). |
| `src/components/Home*.astro` | The homepage's own pieces: `HomeHeroPlate` (the navy plate, the hanging phone and its tap scene), `HomeQuizStill` (the blush mat, the scrolling result, the toggle card). |
| `src/components/Practice*.astro` | The Practice page's own pieces: `PracticeLoopLine` (the drawn loop that returns to Thought), `PracticeFloor` (the eighteen tiles), `PracticeInside` (the desk window, its captions and pager, the ladder). |
| `src/components/Academy*.astro`, `Inq*.astro` | `AcademyStair` (the stepped line beside the three levels), `AcademyLabCard` (the paper door with the masked Inner Lab screen), `InqLoopGlyph` (the unlabelled loop on teal), `InqStepsLine` (three dots on one line). |
| `public/app/` | The captures: 24 original phone screens (600 x 1298, `.webp` with `.jpg` fallbacks), 67 newer phone screens (780 x 1688) and their desktop pairs (1600 x 1000), the two 2880 px hero windows (`desk-coach-draft-2x`, `desk-tools-home-2x`) and `tiles/` (the eighteen 390 x 844 floor tiles). Nothing else is imagery; `public/images/` stays empty. |
| `src/styles/global.css` | The system: tokens, the seven themes, the type roles, pills, paper, mats, the plate, lamps and grain, and every component's structure. See The system below. |
| `src/styles/motion.css` | The CSS half of every mechanic: reveals, line rise, lit statements, page tone, scenes, rails, the day stage, drawn lines, the floor. Reduced motion, no JS and high contrast honoured. |
| `scripts/sweep.mjs` | The copy check run by `npm run sweep`. |
| `src/config/links.ts` and `vercel.json` | Destinations, and the redirects from the old site's URLs. Untouched by the rebuild. |
| `brief/` | The source documents: Suite handoff and build brief, Academy directions, INQ mock-up, Practice documents. |
| `src/scripts/site.ts` | The motion library: one scroll loop, reveals, line rise, lit statements, page tone, the header, the scene engine, the loop phone, the day stage, rails, previews, drawn lines, flips, the accordion, analytics events, UTM passthrough. |
| `scripts/tiles.mjs`, `scripts/desk2x.mjs` | Build time image scripts (`npm run tiles`, `npm run desk2x`): the floor tiles and the two 2x hero windows. |

## The system

The rebuild's design system (BUILD_SPEC part 1), built by the system engineer before the pages. The full reference with every prop, slot, attribute and fallback is `SYSTEM_API.md` in the spec folder; this is the map.

**Files.** `src/styles/global.css`: the `@theme` palette (unchanged), the role tokens and the seven themes (`cream`, `ac-cream`, `navy`, `forest`, `charcoal`, `ink`, `teal` on `[data-theme]`), the grid (`--gutter --max --max-wide --gap --nav-h --edge --colw`, `.wrap .wrap-wide .grid`), the type scale (`--fs-*` and the roles `.t-xl .t-l .t-m .t-s .t-state .t-title .t-lead .t-body .t-small .t-cap .t-cap-i .t-folio .t-price`), spacing and rhythm (`--sp-*`, `--sec --sec-l --sec-s --head-gap --eyebrow-gap --lead-gap --btn-gap`), radii, shadows and easings (`--r --r-lg --sh-paper --sh-object --sh-object-dark --sh-toast --line-gold --ease --slow --sheet --scene --pop`), and every component's structure: pills (`.btn` with `.btn-gold .btn-line .btn-cream .btn-teal .btn-line-teal .btn-lg .btn-sm`), `.link`, `.eyebrow`, `.paper`, `.paper-teal`, `.mat`, `.mat-blush`, `.plate`, `.panel-forest`, `.panel-navy`, `.lamp`, `.grain`, `.ladder`, `.tile`, `.phone`, `.win`, the rail, the day stage, the accordion, the flip cards, the toggle card, the geometry, the floor, the header and the footer. `src/styles/motion.css`: the CSS half of every mechanic, the reduced motion block (nothing moves, nothing hides, stages unpin), the no JS block and the high contrast block. `src/scripts/site.ts`: one scroll loop with exponential smoothing, reveals, line rise, lit statements, page tone, the header, the scene engine, the loop phone, the day stage, rails, the scroll screen, parallax, previews, drawn lines, run gates, image warming, tilt, flips, the accordion, `track()`, `passthrough()` and the `astro:page-load` lifecycle.

**Components** (`src/components/`): `PhoneFrame` (a drawn phone in em of its screen width, frames stacked for the scene engine, no island), `WindowFrame` (a browser window in em of its width, the two 2x captures through `x2`), `Rail` (native snap plus arrows, tabs, keyboard and drag momentum), `DayStage` (the sticky sky mat with one phone and five steps; static with five phones under reduced motion), `ToggleCard` (image only), `Geo` (the mark geometry that draws itself), `FlipCards` (paper fronts, forest backs, both faces in one grid cell), `Accordion` (a button with `aria-expanded`, the answer a `0fr` to `1fr` row), `Header`, `Footer`, `FeatureIcon` (1.25 px stroke), `Arrow`, `Mark`, `Wordmark`. Page components are prefixed with their page (`Home*`, `Practice*`, `Academy*`, `Inq*`). The first build's `AppPhone`, `AppDesktop` and `QuizPhone` are gone.

**Hooks** (data attributes, each with a reduced motion and a no JS fallback): `.wipe .rise .rise-obj .seq .slide-l .slide-r .rule-draw .tcard-in`, `data-lines` (alias `data-words`), `data-lit` (alias `data-scrollwords`, `data-lit="lines"`), `data-tone`, `data-surface`, `data-flow` with `data-flow-loop` and `data-rest`, `data-loop` with `data-loop-step data-loop-frame data-loop-ms data-loop-tap`, `data-story`, `data-rail`, `data-scrollscreen`, `data-parallax`, `data-preview` with `data-preview-target`, `data-draw="enter|scroll"` with `.draw-line`, `data-reveal-at` (a gate that fires a group of reveals when its section's centre passes a fraction of the viewport), `data-flow-delay` (a first play that waits for the page), `data-run`, `data-warm`, `data-tilt`; kept from the first build: `data-passthrough data-event data-event-location data-header data-menu-button data-menu-panel data-count`.

**Build time images.** `npm run tiles` writes the 18 floor tiles to `public/app/tiles/`; `npm run desk2x` writes the two 2880 px hero windows (`desk-coach-draft-2x.webp`, `desk-tools-home-2x.webp`). Both use `sharp` (a devDependency), run by hand, and their outputs are committed; `astro build` never runs them.

**Integration (stage three).** The scratch page is deleted. The build is checked with `npm run build && npm run sweep`, a copy diff of `dist/` against the locked page text, a per page Playwright pass (overflow at 1440 and 390, console errors, the link and attribute table, reduced motion, no JS, keyboard, view transitions between pages, image weight, the header's tone against the pixels under it) and a read of every section's screenshot. The header reads a surface's own colour (`data-surface`, paper, mats, tiles, screens) and otherwise the page's current theme.

## Analytics events

Calls to action carry a `data-event` (`practice_click`, `quiz_click`,
`academy_click`, `inq_click`, `inq_book_click`, `inq_enroll_click`,
`ios_click`) with a `location`. `track()` pushes them to `dataLayer`, `gtag`
and `plausible` when any of those is on the page, and does nothing otherwise.
Add the analytics tag to `src/layouts/Base.astro` when the account exists.

Links into Practice carry `data-passthrough`: the page's `utm_*` and `from`
parameters are appended, so a campaign's starts are counted under the campaign.

## The quiz flow (tracker SU-07)

Practice already supports it: `/quiz` opens with no sign-in, scores as you
answer, shows results at once, keeps every retake, and "Save my results" is the
moment an account is created, with no card. The site links straight to it with
`?from=suite`. No login wall was added anywhere.

## Links still to confirm (from the tracker)

| Button | Today | Needs |
| --- | --- | --- |
| Start in Practice | `practiceinnerboard.com/?from=suite` | Confirm the app URL. |
| What's Holding You Back? / Take the quiz | `practiceinnerboard.com/quiz?from=suite` | Confirm. |
| Explore Academy | `/academy` on this site; "Open the collection" goes to the Academy inside Practice | The Academy storefront URL, if it is not the app. |
| Book a Conversation (INQ) | `mailto:info@innerboardsuite.com` | The INQ booking URL. |
| Enroll now (INQ) | `mailto:info@innerboardsuite.com` | Checkout or enrollment URL. |
| The Certified Mind Method | The Academy inside Practice | Its course URL. |
| Log in | `practiceinnerboard.com/login` | Confirm. |
| Privacy / Terms / Contact | `/privacy`, `/terms`, `/contact` on this site | Counsel review. |

## Decisions made here, for Leah and Abra to confirm

- **One nav on every page, exactly as the handoff locks it:** Academy, INQ Certification, InnerBoard IOS, and the gold Start in Practice. The Academy doc and INQ mock-up show a different nav (Academy, Certify, InnerLab, InnerBoard OS, Log in); the tracker's open question ALL-03 decides. "Log in" sits in the footer (it goes to skool.com, where the live Academy page sends it). The Practice sales page is reached from the Practice panel's "See everything inside" and the footer.
- **Two palettes.** The homepage and Practice page use the Suite palette; Academy and INQ use the cream and teal system the Academy doc specifies. The header and footer are shared, so the site still reads as one place.
- **Display name.** "InnerBoard IOS" everywhere, as the IOS brief and the Suite handoff spell it.
- **InnerLab links** point into Practice (`/lab`), since InnerLab lives inside the app.
- **Academy links are the live page's own**, read from innerboardsuite.com/academy on October 19: Human Foundations, the Wisdom Collection and the Certified Mind Method pages, InnerLab (`/innerlab-5011`), and Log in (skool.com). Nothing about links changed, as the Academy doc asks.
- **Nothing of Leah on the site.** By her direction, so the company can scale without her in it. No photographs or portraits anywhere; her name appears only where a brief requires it. The homepage hero carries the real Practice home screen in place of the handoff's photograph.
- **The Practice page is a demonstration, not a brochure.** It walks a day through the real app on a sticky stage (the Coach home, Set Up Your Day, STEAR, the Dare, the Journal), the six STEAR steps as a rail with a reading camera, the quiz on linen, the desk with a cursor working the app's own rail, and the eighteen screens as a receding floor. Every screen is a capture of the app itself, so the page shows exactly what someone gets. The only new visible sentences on the site are its fourteen captions, each naming a screen and a step.
- **Every phone and window moves.** The hero phone types a draft, the forest panel's phone follows its feature list, the quiz result scrolls under its own fixed header, the day stage taps Continue and I did it, the desk cursor clicks The Book and InnerBoard OS. Every scene rests under reduced motion and without the script, with nothing hidden.
- **Copy removed, nothing changed.** With the rebuild the first build's own labels went: the "Section one" eyebrows and "01" numerals, the time of day readings, the numerals before Visit, Account and Subscribe and before the INQ modules and steps, the three Academy summary items beside its hero, the drawn quiz phone's own captions ("Your results", "Your top two are up first.", "Retake it anytime; every result is kept.", "Cancel one": the real result capture replaced it), and the periods after the quiz benefit names. "Founded by Leah Roling." lives in the footer only. Every locked sentence from the briefs is still on its page, verbatim.
- **The source briefs** live in `brief/`: the Suite handoff and build brief, the Academy directions, the INQ mock-up, and the Practice documents.
- **No prices for Practice.** The sales page says plans and prices are inside the app under Membership. INQ shows $6,997 with payment options, per the mock-up, pending confirmation.
- **No testimonials** anywhere except the three the Academy doc approves, signed "Academy student".
- **The three navy books** image is held, per the tracker; the homepage Academy section stays typographic (the italic deck between two rules and a paper note) until it arrives.
- **Design restraint.** No glows, blobs or watermarks. Dark moments are full bleed sections the page cross fades into, never two in a row, each lit from one corner with one lamp and a grain; gold is for one filled button per section, the italic clauses and the hairlines on dark. Pill buttons, paper cards with a gradient border instead of a plain line, ruled lists in place of card grids. The footer is linen.
- **Old URLs redirect** (`vercel.json`): the live site's `/human-foundations`, `/wisdom-collection`, `/certified-mind-method` go to the Academy inside Practice; `/innerlab-5011` and `/innerlab-lp` to the Lab; `/quiz-page` to the quiz; `/certification` to `/inq-certification`.
- **The INQ accreditation FAQ** is in the page source as a comment until the accrediting body and credential name are supplied, so no placeholder ships.

## Open questions carried from the tracker

- Academy: twelve collections vs thirteen shown; Relationships & Connection "Coming soon"; teen age range; "48 books" and "7 research-grounded frameworks"; testimonial names.
- INQ: accreditation placeholders `[ACCREDITING BODY]` and `[CREDENTIAL NAME]` in the FAQ must be filled before launch; headline wording (the INQ page says "transformation", the Suite teaser says "change", as the tracker records each); price.

## Copy rules enforced

No em or en dashes anywhere in the output (`npm run sweep`). "InnerBoard IOS"
with a capital I and OS. No "Not this. That." lines, no stacked buzzwords, no
section numbers in the Academy, no emoji, one quote style.
