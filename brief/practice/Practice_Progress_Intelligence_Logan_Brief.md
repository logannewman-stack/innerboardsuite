# Practice by InnerBoard: Progress Intelligence
## Feasibility and Implementation Brief for Logan

**Status:** Exploration only. Please assess feasibility against the existing Practice architecture before committing to build.

### The vision
As members use the Daily Practice Coach, Daily Dares, tools, courses, and other app experiences, Practice should help them notice what they have done, what they say is changing, which themes recur, and what they might practice next. Inspired by Oura's periodic recaps, but without presenting unvalidated emotional or psychological scores.

### Member experience
- **Monthly: Your Month in Practice.** Days practiced, coaching sessions, dares completed, courses/tools used, recurring themes, user-reported wins, possible growth opportunities, and one suggested focus for next month.
- **Quarterly: Your Quarter in Practice.** Three-month trends, repeat themes, progress toward user-selected goals, notable milestones, and a recommended focus.
- **Annual: Your Year in Practice.** Unique days practiced, dares completed, coaching sessions, courses and tools used, self-reported milestones, patterns across the year, and an optional shareable recap that excludes private coaching content by default.

### Data events to confirm are available
`coach_session_completed`, `dare_completed`, `practice_completed`, `tool_used`, `course_completed`, and optionally `goal_set`, `goal_checkin`, `reflection_submitted`. Store user ID, unique event ID, timestamp, and minimal metadata. Distinguish viewing a dare from actually completing it. Count unique practice days in the user's selected timezone. Avoid counting multiple chat messages as separate sessions unless product policy explicitly chooses that definition.

### Insight engine
1. Compute factual metrics deterministically from event records.
2. For opted-in users only, process minimized coaching/reflection content into recurring theme labels and user-stated wins. Where possible, label themes when a session is saved instead of reprocessing entire conversations.
3. Generate a short narrative from those verified metrics and approved reflection excerpts.
4. Show uncertainty and allow member to edit, hide, or delete generated insights.
5. Recommend a relevant practice using existing tagged content; don't invent nonexistent exercises.

### Suggested taxonomy
Self-trust; communication; relationships; emotional awareness; follow-through; boundaries; other. Treat categories as editable, not diagnoses.

### Access and permissions
Please confirm with product owner whether reports are included in free access or require paid membership. Current known free items: first five coach interactions (unit needs clarification), master class, and existing book resources/tools. Everything else currently requires a paid subscription. **Do not silently paywall the free items.**

### Privacy and trust
- Explicit opt-in before AI reviews private coaching/reflection content for reports.
- Activity-only reports should be possible without private text analysis.
- Separate personal member data from organization/IOS data; do not expose individual coaching content to employers or administrators.
- Define retention, export, and deletion behavior; secure data in transit and at rest.
- Never label the report a clinical or psychological assessment or imply objective improvement from usage alone.
- Avoid scores that punish breaks or reward compulsive app use. If a consistency score is added, disclose its formula and allow the user to set the goal.

### Technical review questions for Logan
1. Which app events and timestamps already exist, and where are they stored?
2. How is a coaching *session* currently defined? Is five free coach uses five messages or five sessions?
3. Does the app store dare completions and tool usage, or only views?
4. Can we tag content and coaching sessions by theme using the current model stack?
5. What are the expected model, storage, and scheduled-job costs per active user?
6. Can we run monthly/quarterly/yearly report jobs or generate on demand?
7. How will timezones, incomplete history, missing events, and user deletions work?
8. Can reports link directly to recommended existing practices?
9. How would this appear in the member home screen and notification settings?
10. What is realistic for phase one, and what would need phase two or three?

### Proposed phased release
- **Phase 1:** Event logging, factual monthly report, annual totals, simple dashboard.
- **Phase 2:** Opt-in AI themes, user-stated wins, practice recommendations, quarterly report.
- **Phase 3:** Personal goal trends, refined yearly recap, optional transparent consistency score, shareable private-safe highlights.

### Definition of success
A member can accurately see what they did, recognize their own reported progress, understand a suggested next step, and trust that the app did not invent a win or disclose their private coaching conversations.

### Prototype
See accompanying `practice_progress_prototype.ts` for a framework-agnostic reporting scaffold and proposed narrative-generation guardrails. It is not production-ready code.
