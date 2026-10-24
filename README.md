# InnerBoard (innerboardsuite.com)

The InnerBoard website: the Suite homepage, the Practice page, the Academy page and the INQ Certification
page, plus contact, privacy, terms and a 404 page. Astro 5 (static output), Tailwind 4 through
`@tailwindcss/vite`, one vanilla TypeScript file for every motion, no framework runtime. Deployed by Vercel.

```bash
npm install
npm run dev        # localhost:4321
npm run build      # dist/
npm run sweep      # after a build: fails on any em or en dash, or the lowercase i spelling of IOS, in dist/
```

Preview: https://innerboardsuite.vercel.app/ (the branch deploy). Production: https://innerboardsuite.com.

## The pages

| Page | What it is | Built to |
| --- | --- | --- |
| `/` | The Suite homepage: the front door to Practice, the Academy, INQ Certification and InnerBoard IOS. Eight sections in the client's order of October 20: the hero (the headline and the phone on the Coach home), the Practice panel (a scroll story, one feature per step), the subscription quiz (a scroll story on the blush mat, "Take the Quiz" pinned under the copy), the four recognition cards (they flip on click, tap, Enter and Space, never on their own), the Academy (typographic, the books image is held), the INQ teaser (navy), the mission, and the InnerBoard IOS panel. | InnerBoard Suite Logan Handoff FINAL and the INNERBOARD SUITE build brief (`brief/suite/`). Copy locked word for word. |
| `/practice` | The Practice page: the app shown by the app itself. The hero (a desk window and a phone, a story), the loop, a day in Practice (a story on a sky mat that turns to evening), STEAR question by question (a story), the quiz (a story with "Take the quiz" pinned), "Yours", everything inside (a desk window on laptops, a phone on tablets and phones, a story), the three levels and the questions, and the closing floor of eighteen screens that drifts with the scroll. Every screen is a capture of the app. | The app's own copy and build maps; the only sentences we added are short captions naming a screen. |
| `/academy` | The Academy: the curriculum, the three levels, the library of collections, the testimonials signed "Academy student", the two doors (InnerLab, INQ) and the filter. Ivory and Academy teal. | Academy Page Rebuild: Copy and Build Directions (`brief/academy/`). Links point where the live Academy page pointed. |
| `/inq-certification` | INQ Certification: the mock-up's thirteen sections, the modules, the investment card ($6,997, the only price on the site), the FAQ. Ivory, INQ gold and slate. | INQ Certification Page Mock-up (`brief/inq/`). |
| `/contact`, `/privacy`, `/terms` | Plain-language pages written by us; counsel review before launch. | |
| `/404` | Served for any address that is not on the site: the header and footer, the brand mark, "This page isn't here." and two buttons (Start in Practice, the homepage). Not indexed, not in the sitemap. | |

Every page has its own title (under 60 characters) and meta description (120 to 160 characters), each built from
that page's own copy; a canonical URL; Open Graph and Twitter card tags with `public/og-image.png` (1200 x 630:
the client's InnerBoard logo on the ivory; its URL is built from the deploy's own host, so a texted preview link
shows it); PNG favicons and the home screen icon from the same logo (`public/brand/`), and a theme-color in the page's first tone (`#f2ece0` on the Suite pages and on the
Academy and INQ). `robots.txt` allows everything and names the sitemap; the sitemap lists the seven real pages.

## Where things are

| Path | What |
| --- | --- |
| `src/pages/*.astro` | One file per page, copy included, with its own layout CSS in a `<style>` block (prefixed `hm-`, `pr-`, `ac-`, `inq-`). |
| `src/layouts/Base.astro` | The page shell: the head (title, description, canonical, Open Graph, Twitter, icons, theme-color, font and hero image preloads), `<html data-theme>`, the `no-js` to `js` switch, the header, `main`, the footer and the one script. |
| `src/config/links.ts` | Every destination on the site, and only here. `into(path, from)` builds a link into Practice that says where it was handed out (`?from=suite`, `academy`, `inq`, `innerlab`). |
| `src/styles/global.css` | The system: tokens, themes, type, surfaces, every component's structure, the static layout of the stories. |
| `src/styles/motion.css` | The CSS half of every mechanic, the pinned story layout, reduced motion, no JS, high contrast. |
| `src/scripts/site.ts` | The motion library (below). |
| `src/components/` | Shared: `Header`, `Footer`, `PhoneFrame`, `WindowFrame`, `StoryMarks` (the rail), `DayStage`, `FlipCards`, `Accordion`, `Geo`, `ToggleCard`, `FeatureIcon`, `Mark`, `Wordmark`, `Arrow`. Page pieces are prefixed with their page: `Home*`, `Practice*`, `Academy*`, `Inq*`. |
| `public/app/` | The captures a page shows (`.webp`, with `.jpg` fallbacks for the first 24), their 390 px variants (`-390.webp`), the two 2880 px desk heroes (`-2x.webp`) and `tiles/` (the floor). Nothing else on the site is imagery; `public/images/` stays empty. |
| `captures/` | Real captures no page uses today, kept in the repo and not deployed (see `captures/README.md`). |
| `scripts/` | `sweep.mjs` (the copy check), `capture.mjs` (recapture the app), `small.mjs`, `tiles.mjs`, `desk2x.mjs`, `scrolled.mjs` (see Captures). |
| `brief/` | The client's source documents. |
| `vercel.json` | Redirects from the old site's URLs, cache and security headers. |

## The system and the story engine, in brief

**Tokens and themes.** `global.css` holds the palette (`@theme`), role tokens (`--bg --fg --fg-2 --fg-3 --line
--accent --focus`) and the themes on `<html data-theme>`: `cream`, `ac-cream` (Academy and INQ, with
`.theme-teal`, and `.theme-inq` on INQ), `navy`, `practice`, `charcoal`, `ink`, `teal`, `slate`. The product pages'
accent comes from the `--pa*` variables on `<html>`. Text always uses the role tokens, so a section that
changes the page's tone carries its text with it. Type roles `.t-xl .t-l .t-m .t-s .t-state .t-title .t-lead
.t-body .t-cap .t-folio .t-price`; Fraunces for display, Instrument Sans for the rest, both self-hosted in
`public/fonts/` and preloaded. Pills (`.btn-gold`, `.btn-line`, `.btn-cream`, `.btn-teal`), paper cards, mats,
panels, one lamp and a grain per dark surface.

**Motion** (`site.ts`, one scroll loop, every mechanic with a reduced motion and a no JS fallback): reveals
(`.rise`, `.rise-obj`, `.wipe`), the headline line rise (`data-lines`), lit statements (`data-lit`), the page tone
(`data-tone` on every full bleed section: the page cross fades as a section passes the middle of the screen),
the header (tone, hide on scroll down, the menu sheet with focus trap and Escape), drawn lines, the floor, flips,
the accordion, analytics events and the UTM passthrough.

**Scroll stories.** Every app demonstration is a story: a tall track whose stage sticks under the header while
the reader scrolls (native `position: sticky`, no scroll hijacking). The scroll position alone decides the step,
the frame each device shows (a 380 ms wipe from the tap that caused it), where the ring presses, how far a draft
has typed, where the desk cursor moves and clicks, and how far a long result scrolls inside a phone; scrolling
back plays it backwards; nothing moves on a timer. Markup: `div.story[data-story][data-story-ui="steps"]` with
`.story-track > .story-stage` (the device column with the rail, and the copy column with one `.story-step` per
step, each with a `data-act` in JSON) and `.story-run`. Every story is on the step layout: the device pinned on
one side with the segmented rail and its "01 / 05" counter, one step's eyebrow, headline and body at a time on the
other. Without the pin (no script, reduced motion, a landscape phone, a short laptop window, or a screen where the
fit guard says no) every step is on the page in order with its own still screen. The engine is exposed for QA as
`window.__ib.stories[id]`. No device leans in (the camera is supported, but on these captures the app's header
and bottom bar sit at the edges and in the phone's rounded corners, so any lean cuts them).

## Brand decisions

- **The InnerBoard brand book, exactly** (v1.0, `brief/brand/InnerBoard_Brand_Book_v1.0.html`; the client, October
  24: "comply to the company color guidelines and hex codes"). Every colour on the site is one of the book's hex
  codes, or white or black for shadows and highlights, at full strength or as a transparent tint. The one exception
  is `#f9f6ee`, the patch the typing animation paints inside the app's own screenshots to match their input fields. `npm run brand`
  reads the build and fails on any other colour.
  The umbrella pages (home, Practice, contact, legal, 404) take Leah Roling's palette (book 01): the ivory `#f2ece0`
  and ink `#1b1916`; amber `#d09342` for italics, filled buttons (ink label), rules, toggles and icons; peach
  `#e4ae9b` for the atmosphere, the selection and hovers; blush `#fbeee6` for paper, cards, mats and the footer, and
  for italics in the dark rooms (the ink with a honey glow, amber eyebrows); muted text in the book's graphite
  `#3a3631` and slate `#6e6660` / `#b8b2a8`. The book's amber is 2.25 on the ivory, so small type (eyebrows, folios,
  links) runs in the ink; display italics take the amber exactly (the client's call, October 24).
- **Academy** (book 03): teal `#1a5d63` (buttons, eyebrows, italics, rules), a teal section with white type, the
  close in the deep teal `#0d3438` with soft teal `#5ba0a7` italics, wheat cream `#ebe0c9` for the footer and a
  bronze `#a26b3d` wash on alternate sections.
- **INQ** (book 06): gold on slate. Slate `#2d2a26` sections (the homepage teaser, Why INQ works, the close) with
  champagne `#e8cf7a` italics and gold `#d4af37` eyebrows and buttons (slate label). On the ivory its italics are the
  book's gold exactly (1.8, the client's call), its small type (links, labels) the slate `#2d2a26`, its eyebrows slate
  mid `#6e6660`; fills, rules, dots and drawn lines in the gold; white cards.
- **InnerBoard IOS panel** wears the book's InnerBoard OS colours (navy `#0d3054`, soft steel `#8aa3bf`, pale
  `#e6e7ea`), as the site it opens does. The logo is the client's, as supplied.
- **One nav on every page**, exactly as the handoff locks it: Academy (into the Academy in Practice), INQ Certification, InnerBoard IOS and the
  amber Start in Practice. "InnerBoard IOS" everywhere (capital I, O and S).
- **Nothing of Leah.** No photographs, portraits or likeness anywhere; "Founded by Leah Roling." appears once, in
  the footer. The homepage hero carries the real Practice home screen in place of the handoff's photograph.
- **Copy is the client's, word for word.** We removed only our own first-build labels (section numerals, the
  drawn quiz phone's captions, the three Academy summary items). No dashes anywhere (`npm run sweep`).
- **No sample score is a step's focus**, and no capture shows "not available yet", "aren't posted yet", "coming
  soon" or "opens soon" at a readable size (Inner Lab is shown with a `fade` that ends the screen under The
  Masterclass).

## Captures: how they were made, and how to recapture

The app is never drawn. Every screen is a screenshot of Practice, in its light theme, as a visitor with no account:

- **October 19 and 20, 2026: the local app.** A build of `/home/user/practice-by-innerboard` (read only, never
  modified) served with its own `npm run preview` on `localhost:4173`, driven by Playwright: the first 24 phone
  screens at 600 x 1298 (`.webp` with `.jpg` fallbacks), the newer phone screens at 780 x 1688 (390 x 844 at 2x),
  the desk screens at 1600 x 1000, and the two hero windows at 2880 x 1800.
- **October 21, 2026: the live app** at https://practiceinnerboard.com (read only: navigate, scroll, screenshot),
  for the screens that need the real catalogue: `academy-courses`, `lab-masterclass`, `book-scores` and their
  desk pairs.

Scripts (each run by hand; the outputs are committed; `astro build` never runs them):

| Script | What it does |
| --- | --- |
| `node scripts/capture.mjs <outDir> <route[@scrollY]>,... [baseUrl]` | Recaptures routes of the app (live by default, or a local preview URL): a phone (390 x 844 at 2x, written at 780 x 1688) and a desk (1440 x 900 at 2x, written at 1600 x 1000, plus the 2880 px PNG), light theme, the one-time notice accepted, and a warning for any "not available yet", "aren't posted yet", "coming soon", "opens soon" in view. Needs Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`). |
| `npm run small` | The 390 px variant of every phone capture (`{name}-390.webp`, quality 80), which PhoneFrame adds to the srcset. Run after adding a capture. |
| `npm run tiles` | The eighteen floor tiles (390 x 844) for the Practice page's closing floor. |
| `npm run desk2x [dir]` | The two 2880 px hero windows from their PNGs. |
| `npm run scrolled` | `quiz-cost` and `quiz-first-step`: the quiz result scrolled (its header held, `quiz-results` and `quiz-results2` joined as the app scrolls), at offsets where no line is cut. |

To recapture: run `capture.mjs` for the routes you need, look at every file (no people, nothing unavailable in
view, nothing cut mid line), copy the ones a page uses into `public/app/` under the same names (the rest into
`captures/`), run `npm run small` (and `npm run tiles` if a tile changed), then build and look at the stories that
show them. A frame whose capture shows something the site must not show gets a `fade` on that frame
(PhoneFrame and WindowFrame), never a drawing over it.

## Links still to confirm

All destinations live in `src/config/links.ts`; each pending one carries the best real destination today, so no
button goes nowhere.

| What | Today | Needs |
| --- | --- | --- |
| INQ "Book a conversation" (homepage teaser, INQ page three times, contact) | `mailto:info@innerboardsuite.com` with a subject | The booking URL. |
| INQ "Enroll now" (INQ page three times) | `mailto:info@innerboardsuite.com` with a subject | The enrollment or checkout URL. |
| INQ accreditation | The accreditation FAQ stays in the page source as a comment | The accrediting body and the credential name. |
| The book cover (InnerBoard IOS site) | A placeholder cover with the title and author only | The approved Replaceable cover artwork. |
| The sample score shown on the InnerBoard IOS site | A sample Company OS Score | Confirm it may be shown, or supply the one to show. |
| Start in Practice, the quiz, Log in | `practiceinnerboard.com/?from=suite`, `/quiz?from=suite`, `/login?from=suite` | Confirm the app URLs. |
| The Certified Mind Method, Academy "Open the collection" | The live Academy page's own links (redirected in `vercel.json` to the Academy inside Practice) | The course URLs, if they change. |
| Privacy, Terms, Contact | `/privacy`, `/terms`, `/contact` on this site | Counsel review. |

Other open questions from the briefs: the Academy's twelve vs thirteen collections, "Relationships &
Connection" as coming soon, the teen age range, "48 books" and "7 research-grounded frameworks"; INQ's price
($6,997, from the mock-up); the three navy books image for the homepage Academy section (held until the client
sends the original).

## Analytics

Calls to action carry `data-event` (`practice_click`, `quiz_click`, `academy_click`, `academy_start_click`,
`inq_click`, `inq_book_click`, `inq_enroll_click`, `ios_click`) and `data-event-location`. `track()` pushes them to
`dataLayer`, `gtag` and `plausible` when one is on the page and does nothing otherwise; add the tag to
`Base.astro` when the account exists. Links into Practice carry `data-passthrough`: the page's `utm_*` and
`from` parameters travel with them.

## Deploy

Vercel builds the branch on every push (`framework: astro`, `astro build`, output `dist/`). Before pushing:

```bash
npm run build && npm run sweep
```

`vercel.json` keeps the old site's URLs working (`/human-foundations`, `/wisdom-collection`,
`/certified-mind-method` to the Academy inside Practice; `/innerlab-5011`, `/innerlab-lp` to Inner Lab; `/quiz-page`
to the quiz; `/certification` to `/inq-certification`, permanent), serves clean URLs without a trailing slash, and
sets long cache headers on `/_astro`, `/fonts` and `/app` and the security headers on every page. A missing route
gets `dist/404.html` (Vercel serves a static build's `404.html` for unmatched routes, with a 404 status; no rule
is needed). To launch: point innerboardsuite.com at the Vercel project and promote the deploy.
