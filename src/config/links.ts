/**
 * Every destination on the site, in one place. The pages of this site are `ROUTES`; everything that leaves the
 * site is `LINKS`.
 */
export const APP = "https://practiceinnerboard.com";

/** A link into the Practice app, carrying where it was handed out (`profiles.came_from`). */
export const into = (path = "/", from = "suite") => `${APP}${path}${path.includes("?") ? "&" : "?"}from=${from}`;

export const ROUTES = {
  home: "/",
  story: "/story",
  academy: "/academy",
  lab: "/lab",
  inq: "/inq",
  ios: "/ios",
  app: "/app",
  club: "/club",
  privacy: "/privacy",
  terms: "/terms"
} as const;

export const LINKS = {
  /** Open the app itself. */
  start: into("/", "suite"),
  /** Start Practicing, every one on the site (the client, November 3): the app opens with its Start Practicing
   * pop-up, a free account or a membership with 7 days free, side by side. */
  startPracticing: into("/start", "suite"),
  /** What are you practicing? (the home page's second button): the app's quiz of that name, which ends on the
   * result and the way in (the client, November 3: "it still says what are you practicing?"). */
  quiz: into("/quiz", "suite"),
  /** Buy: the app's membership page (Join the Practice Club, $29 a month or $249 a year), where an account and
   * checkout begin. Every button on the site that sells the membership goes here. */
  join: into("/membership", "suite"),
  /** Enroll now (INQ): the app's address for this button. It asks for an account if there is none, then opens
   * INQ's checkout by itself. */
  inqEnroll: into("/inq/enroll", "inq"),
  /** Start a conversation (INQ): the app's address for this button. Name and email, no account needed, and the
   * question goes to the INQ team. */
  inqTalk: into("/inq/talk", "inq"),
  /** Get Your Company OS Score: the assessment itself, in the app (the page the book prints, /os/score). */
  osScore: into("/os/score", "os"),
  /** Talk to Our Team (IOS): the InnerBoard OS discovery call on Calendly. */
  osTalk: "https://calendly.com/innerboardos-support/os-discovery-call",
  /** Buy the Book: Replaceable on Amazon (the app's own Buy the Book link resolves here). */
  book: "https://www.amazon.com/dp/0998174475",
  contactEmail: "info@innerboardsuite.com"
} as const;

export const SITE = {
  name: "The Practice",
  url: "https://innerboardsuite.com"
} as const;
