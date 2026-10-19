/**
 * Every destination on the site, in one place.
 *
 * The build tracker's "Links to Confirm" tab lists the ones still pending.
 * Each pending entry below carries the best real destination available
 * today so no button on the site goes nowhere; swap the value when the final
 * URL is approved. Nothing else on the site hard-codes a destination.
 */
export const APP = "https://practiceinnerboard.com";

/** A link into Practice, carrying where it was handed out (`profiles.came_from`). */
export const into = (path = "/", from = "suite") => `${APP}${path}${path.includes("?") ? "&" : "?"}from=${from}`;

export const LINKS = {
  /** Start in Practice (nav, hero, Practice section). Pending: confirm the app URL. */
  practice: into("/", "suite"),
  login: into("/login", "suite"),
  /** What's Holding You Back? / Take the Quiz: the anonymous quiz inside Practice. */
  quiz: into("/quiz", "suite"),
  /** Explore Academy: the Academy page on this site. The storefront inside Practice is `academyApp`. */
  academy: "/academy",
  academyApp: into("/academy", "academy"),
  /** The Practice sales page on this site. */
  practicePage: "/practice",
  /** The INQ Certification page on this site. */
  inq: "/inq-certification",
  /** Book a Conversation (INQ). Pending: the INQ booking URL. */
  inqBook: "mailto:info@innerboardsuite.com?subject=INQ%20Certification%3A%20book%20a%20conversation",
  /** Enroll now (INQ). Pending: checkout or enrollment URL. Interim: the same conversation. */
  inqEnroll: "mailto:info@innerboardsuite.com?subject=INQ%20Certification%3A%20enroll",
  /** The Certified Mind Method, its Academy course. Pending: the course URL. */
  certifiedMind: into("/academy", "inq"),
  /** InnerLab, inside Practice. */
  innerlab: into("/lab", "innerlab"),
  /** Explore InnerBoard IOS. Known. */
  ios: "https://innerboardos.com",
  /** The book, inside Practice. */
  book: into("/book", "suite"),
  contact: "/contact",
  contactEmail: "info@innerboardsuite.com",
  privacy: "/privacy",
  terms: "/terms"
} as const;

export const SITE = {
  name: "InnerBoard",
  url: "https://innerboardsuite.com",
  description:
    "InnerBoard is self-leadership from the inside out: Practice, the daily app; the Academy, the curriculum school never offered; INQ Certification for coaches; and InnerBoard IOS for organizations.",
  founder: "Leah Roling"
} as const;
