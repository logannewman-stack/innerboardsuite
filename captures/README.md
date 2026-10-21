# Captures not on a page

Real screens of the Practice app (local build, October 19, 2026) that no page uses today. They live here so they are kept in the repo but not deployed. Move a file back to `public/app/` when a page needs it. `scripts/tiles.mjs` reads from either folder.

Some of these show notes the site must not show at a readable size ("Not open in the app yet", "Membership opens soon", sample scores). Check before using one.

Moved to `public/app/` for the scroll stories (SCROLL_SPEC 1.12, October 20, 2026): `close-day-2.webp` (the second half of the Close the day strip on the Practice hero) and `track-home.webp` (the Track on a phone, Everything inside). Both checked: no "not available", "aren't posted" or "opens soon" note, no person.

Added to `public/app/` for the step stories (October 21, 2026), captured read only from the live app (practiceinnerboard.com, light theme, 390 x 844 and 1440 x 900 at 2x): `academy-courses` and `desk-academy-courses` (the Academy with the Human Foundations courses), `lab-masterclass` and `desk-lab-masterclass` (Inner Lab), `book-scores` (The Book scrolled to the seven scores; nothing unavailable in view). The two Inner Lab captures carry the calendar note ("October's dates aren't posted yet") and the month's "Coming soon" rows: show them only with their `fade` mask (PhoneFrame and WindowFrame), which ends the screen under The Masterclass card. `quiz-cost` and `quiz-first-step` are the quiz result scrolled, joined from `quiz-results` and `quiz-results2` exactly as the strip draws them (64 em and 143.67 em).

Moved here on October 21, 2026: `quiz-results2.webp` (the lower half of the quiz result). No page shows it on its own; `scripts/scrolled.mjs` reads it to make `public/app/quiz-cost.webp` and `quiz-first-step.webp` (`npm run scrolled`). `quiz-first-step` is now the result scrolled 146.67 em, so the whole first step box sits under the header and the page's last line ("Once I know how it turns out, I'll go.") ends above the bottom edge instead of being cut through.

To recapture any screen, see the README (Captures): `node scripts/capture.mjs` warns about any "not available yet", "aren't posted yet", "coming soon" or "opens soon" in view.
