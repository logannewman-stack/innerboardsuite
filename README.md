# The Practice by InnerBoard (innerboardsuite.com)

The website for The Practice by InnerBoard: one hub with four pathways (Academy, the Lab, INQ, IOS) and The Practice
Club. It is the client's design of November 1, 2026 (a single page with eight views), built as eight real pages
with its copy, layout, photos and palette as written. Astro 5 (static output), one stylesheet, one small TypeScript
file, no framework runtime. Deployed by Vercel.

```bash
npm install
npm run dev        # localhost:4321
npm run build      # dist/
npm run brand      # after a build: fails on any colour that is not in the design's palette
npm run sweep      # after a build: fails on any em or en dash, or the lowercase i spelling of IOS
```

Preview: https://innerboardsuite.vercel.app/ (the branch deploy). Production: https://innerboardsuite.com.

## The pages

| Page | The design's view | What is on it |
| --- | --- | --- |
| `/` | The Practice | The hero with the app (Today), why practice, the rep circle, the four pathways, the membership, the Club |
| `/story` | Why practice | The brand belief, the ten reasons (open and close without the script), the manifesto |
| `/academy` | Academy | The curriculum, why these skills matter, the twelve collections and their lessons by level, every lesson ends with a rep |
| `/lab` | The Lab | Where practice meets real life, Academy or the Lab, what is included, how it works |
| `/inq` | INQ Certification | Who it is for, the INQ journey (drawn on the server), the credential, two steps to start |
| `/ios` | InnerBoard OS | The challenge, the cost, the IOS model, the workflow and the Company OS Score, the outcome, the Company OS Score form, the book |
| `/app` | The app | The Practice app, the membership, how it connects |
| `/club` | The Practice Club | The movement, founding members, the club out in the world, challenges, the founding collection |
| `/privacy`, `/terms`, `/404` | (added) | The legal pages and the not found page, in the design's type |

Every page has its own title and description, a canonical URL, Open Graph and Twitter card tags with
`public/og-image.png` (1200 x 630, the wordmark and the hero line on the navy; its URL is built from the deploy's own
host, so a texted link shows it), and the P mark as favicon and home screen icon (`public/brand/`).

## Where things are

- `src/layouts/Practice.astro`: the head, the header, the page, the footer, the script.
- `src/components/Header.astro`, `Footer.astro`: the design's header (with the InnerBoard submenu) and footer.
- `src/components/AppPhone.astro`: a real screen of the app in a phone (the client, November 1: real screenshots,
  in a phone's shape, in place of the design's drawn app previews). Three screens, captured from the live app as a
  visitor on a phone (390 x 844 at 2x, light theme, a weekday morning): Today on the home page, Set Up Your Day on
  `/app`, and a scored Company OS Score on `/ios`. They live in `public/images/practice/app/` (780 x 1688, plus a
  390 px variant); `scripts/capture.mjs` recaptures any route.
- `src/pages/*.astro`: one page per view, the design's markup with real routes for its hash links.
- `src/data/practice.ts`: the content the design drew from its script, word for word: the ten reasons, the twelve
  collections and their lessons, the INQ modules.
- `src/styles/practice.css`: the design's stylesheet as written (fonts self-hosted, the hash routing removed), with
  the few additions the site needs at the end.
- `src/scripts/practice.ts`: the menu and submenu, the Academy collections and levels, the Company OS Score form.
- `src/config/links.ts`: every route and every outside destination.
- `public/images/practice/`: the design's photos as WebP, the P mark, the INQ mark, the TPC monograms, the book
  cover. `public/fonts/`: Fraunces (with its optical size axis, which the design's display type uses) and
  Instrument Sans, self-hosted.

## Decisions

- **The design as written.** Copy, layout, photos and palette are the design's. Its hash views became pages, so
  every view has its own address, title and preview. Its three drawn app previews (the home hero, the app page's
  phone, the sample score card) are real screens of the app in a phone, at the client's request.
- **Colours.** Every colour is one of the design's hex codes (the client: "only use the hex codes in the file"):
  navy `#1B2332`, paper `#F3EDE5`, bone `#E7DCCF`, white `#FBF8F3`, gold `#B08D57`, gold soft `#CBB089`, line
  `#D8CCBC`, muted `#5D6270`, OS blue `#213B60`, OS ink `#2C4E7E`, its dark mode and the shades of its drawn
  details. `npm run brand` holds the build to that list.
- **Leah Roling's book** stays on `/ios`, as designed (the client, November 1), with the real cover.
- **Where the design pointed at itself**, the site points at the real place: Start Practicing on the app page opens
  the app; Enroll now opens INQ Certification in the app; the second Start a conversation on `/inq` writes to the
  team. The Company OS Score form opens an email to the team with what was entered, because the site has no form
  backend yet. The App Store and Google Play buttons and Shop opens soon stay as the design has them (coming soon).
- **Added** only what a live site needs: the privacy and terms links in the footer's fine print, the legal pages,
  the 404 page, and styles for the menu without the script.

## Links still to confirm

In `src/config/links.ts`: the INQ conversation (an email for now), and where the Company OS Score form should send
(an email for now). App Store, Google Play and the shop are marked coming soon in the design.

## Deploy

Vercel builds the branch on every push (`framework: astro`, `astro build`, output `dist/`). Before pushing:

```bash
npm run build && npm run brand && npm run sweep
```

`vercel.json` keeps the old site's URLs working: `/practice` to `/app`, `/inq-certification` and `/certification` to
`/inq`, `/innerlab` to `/lab` (permanent), `/contact` to the home page, and the old Academy and Inner Lab addresses
to the app. It serves clean URLs without a trailing slash, sets long cache headers on `/_astro`, `/fonts` and
`/images`, and the security headers on every page. A missing route gets `dist/404.html`. To launch: point
innerboardsuite.com at the Vercel project and promote the deploy.
