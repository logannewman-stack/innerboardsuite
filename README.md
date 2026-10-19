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
npm run sweep      # after a build: fails on any em/en dash or "iOS" in the output
```

## Where things are

| Path | What |
| --- | --- |
| `src/config/links.ts` | Every destination on the site. `into(path, from)` builds a link into Practice that carries where it was handed out (`?from=suite`, `?from=academy`, `?from=inq`, `?from=innerlab`). |
| `src/pages/*.astro` | One file per page, copy included. |
| `src/components/FlipCards.astro` | The four recognition cards: click, tap, Enter and Space; never on their own; reduced motion honoured. |
| `src/components/AppPhone.astro`, `AppDesktop.astro` | Real captures of the Practice app (`public/app/*.webp`), in a phone bezel and a browser frame. Taken from a local build of the app, unchanged, on October 19. Recapture when the app's screens change. |
| `src/components/QuizPhone.astro` | The quiz phone with six auto renew toggles. Image only. |
| `src/components/Accordion.astro` | The FAQ, on `details` and `summary`, so it works with a keyboard, a screen reader and no script. |
| `src/styles/global.css` | Tokens: the Suite palette (cream, charcoal, antique gold, forest green, navy) and the Academy/INQ teal set. Section rhythm (`sec-s`, `sec-m`, `sec-l`), flat buttons, line cards. |
| `src/styles/motion.css` | Word reveals, the scroll-driven product story, the scroll-lit paragraph, the horizontal rail. Reduced motion and high contrast honoured. |
| `scripts/sweep.mjs` | The copy check run by `npm run sweep`. |
| `brief/` | The source documents: Suite handoff and build brief, Academy directions, INQ mock-up, Practice documents. |
| `src/scripts/site.ts` | Entrances, the header, the mobile menu, flip cards, analytics events, UTM passthrough. |

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
- **The Practice page is a demonstration, not a brochure.** It walks a day through the real app: Today, the Thought Record, a Dare, the Journal, the six STEAR steps as a rail, the quiz, the desktop view. Every screen is a capture of the app itself, so the page shows exactly what someone gets.
- **The source briefs** live in `brief/`: the Suite handoff and build brief, the Academy directions, the INQ mock-up, and the Practice documents.
- **No prices for Practice.** The sales page says plans and prices are inside the app under Membership. INQ shows $6,997 with payment options, per the mock-up, pending confirmation.
- **No testimonials** anywhere except the three the Academy doc approves, signed "Academy student".
- **The three navy books** image is held, per the tracker; the Academy section uses a card instead.
- **Design restraint.** No glows, blobs, textures or watermarks. Two dark fills per page at most (charcoal, forest or navy), the rest cream. Gold is for one button and the eyebrow rules. Flat 8px buttons, hairline cards, editorial lists in place of card grids. The footer is cream.
- **Old URLs redirect** (`vercel.json`): the live site's `/human-foundations`, `/wisdom-collection`, `/certified-mind-method` go to the Academy inside Practice; `/innerlab-5011` and `/innerlab-lp` to the Lab; `/quiz-page` to the quiz; `/certification` to `/inq-certification`.
- **The INQ accreditation FAQ** is in the page source as a comment until the accrediting body and credential name are supplied, so no placeholder ships.

## Open questions carried from the tracker

- Academy: twelve collections vs thirteen shown; Relationships & Connection "Coming soon"; teen age range; "48 books" and "7 research-grounded frameworks"; testimonial names.
- INQ: accreditation placeholders `[ACCREDITING BODY]` and `[CREDENTIAL NAME]` in the FAQ must be filled before launch; headline wording (the INQ page says "transformation", the Suite teaser says "change", as the tracker records each); price.

## Copy rules enforced

No em or en dashes anywhere in the output (`npm run sweep`). "InnerBoard IOS"
with a capital I and OS. No "Not this. That." lines, no stacked buzzwords, no
section numbers in the Academy, no emoji, one quote style.
