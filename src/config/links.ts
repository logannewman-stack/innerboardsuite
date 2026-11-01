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
  /** Start Practicing, where it means open the app itself (the app page's membership). */
  start: into("/", "suite"),
  /** Enroll now (INQ): the INQ Certification inside the app. */
  inqEnroll: into("/certifications/inq", "inq"),
  /** Start a conversation (INQ). Pending: the INQ booking URL. */
  inqTalk: "mailto:info@innerboardsuite.com?subject=INQ%20Certification%3A%20start%20a%20conversation",
  /** Where the Company OS Score request goes until the site has a form backend. */
  osEmail: "info@innerboardsuite.com",
  contactEmail: "info@innerboardsuite.com"
} as const;

export const SITE = {
  name: "The Practice",
  url: "https://innerboardsuite.com"
} as const;
