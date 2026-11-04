/**
 * The content behind the interactive parts of the design (November 1, 2026), word for word: the ten reasons
 * (/story), the Academy's collections (/academy, now the Academy's own thirteen and their logos), and the INQ
 * journey (/inq).
 */
export interface Reason { title: string; sub: string; body: string; practice: string; changes: string; line: string }
export interface Collection {
  name: string;
  /** "now": open in the app; "soon": coming soon. */
  status: "now" | "soon";
  desc: string;
  /** The courses the app has in it, in its order; none for a collection still to come. */
  courses: string[];
  /** A line in place of the list, where a collection is one course. */
  note?: string;
  /** Where its button goes, and what the button says, when not the app. */
  href?: string;
  cta?: string;
  slug: string;
  image: string;
  dark: string;
}
export interface Module { n: string; name: string; lessons: number }

export const REASONS: Reason[] = [
  {
    "title": "Because you don’t get these years back.",
    "sub": "The cost of waiting is a life that keeps moving.",
    "body": "Your children are growing up. Your parents are getting older. There is no pause button. This isn’t about urgency through fear. It’s about appreciating what is here and becoming more intentional about where your attention goes.",
    "practice": "Presence, priorities, appreciation, courageous conversations, intentional choices.",
    "changes": "Less time waiting for the right circumstances. More time in the life happening now.",
    "line": "These are the years you’ll someday wish you could get back. Practice being here for them."
  },
  {
    "title": "Because the people you love deserve more than your leftovers.",
    "sub": "The quality of your relationships follows the quality of your responses.",
    "body": "You can be gracious with strangers and surprisingly reactive with the people who matter most. Not because you love them less. Love and the skills to express it well are not always the same thing. Listening, patience, and apologizing take practice.",
    "practice": "Listening, empathy, patience, boundaries, communication, repair.",
    "changes": "Relationships you choose, instead of reactions you regret.",
    "line": "The people you love most deserve the version of you that’s willing to practice."
  },
  {
    "title": "Because regret often begins with an unpracticed response.",
    "sub": "Reps over regret.",
    "body": "A hard conversation. An argument with your teenager. Words that can’t be unsaid. You can’t remove mistakes, but you can practice pausing, noticing when you get defensive, and separating what happened from the story you tell about it.",
    "practice": "Emotional awareness, pausing, perspective, conflict, repair.",
    "changes": "Fewer automatic reactions, more intentional responses, and faster recovery when you get it wrong.",
    "line": "Practice the response now, so you’re less likely to regret the reaction later."
  },
  {
    "title": "Because confidence is built through evidence.",
    "sub": "Be your own proof.",
    "body": "Broken promises to yourself wear down self trust. The opposite is true too. Each time you follow through on something that matters, you give yourself evidence that you can act. Confidence isn’t a feeling to wait for. It grows through action.",
    "practice": "Making decisions, keeping commitments, manageable risks, recovering from setbacks.",
    "changes": "Less waiting to feel ready. More trust in your ability to respond.",
    "line": "You don’t need more proof that you’re worthy. Start building proof of what you’re capable of."
  },
  {
    "title": "Because your thoughts shape how you experience your life.",
    "sub": "The conversation in your head matters.",
    "body": "Someone says something in ten seconds and you replay it for three weeks. Most thoughts aren’t facts. You can learn to examine your interpretations, separate what happened from what you’re making it mean, and direct your attention on purpose.",
    "practice": "Awareness, perspective, attention, questioning assumptions.",
    "changes": "Less consumed by mental stories. More available for the life in front of you.",
    "line": "It took them ten seconds to say it. How much of your life are you willing to spend thinking about it?"
  },
  {
    "title": "Because feelings don’t have to make every decision.",
    "sub": "You can feel something without being ruled by it.",
    "body": "Fear doesn’t always mean stop. Frustration doesn’t always mean confront. Feelings are information, not instructions. Practicing emotional skills makes room for feelings without handing them control.",
    "practice": "Naming emotions, self regulation, tolerating discomfort, acting on your values.",
    "changes": "More able to do meaningful things even when they are uncomfortable.",
    "line": "You don’t have to feel ready to begin. You can practice beginning."
  },
  {
    "title": "Because the life you want is created through what you do repeatedly.",
    "sub": "Your habits are shaping your future.",
    "body": "You want stronger relationships without practicing communication, and more confidence without taking action. Results rarely come from intention alone. They come from what you repeat.",
    "practice": "Follow through, habits, discipline, consistency, adjusting what isn’t working.",
    "changes": "Less dependence on bursts of motivation. More progress through repeatable action.",
    "line": "The life you’re building is shaped by the reps you’re putting in."
  },
  {
    "title": "Because you can’t control everything, but you can learn to lead yourself.",
    "sub": "Stop spending your life negotiating with what isn’t yours.",
    "body": "Other people’s opinions. The past. Unexpected setbacks. Your energy is usually better spent on what you can influence: your attention, choices, boundaries, effort, and next action. Self leadership means getting better at telling the difference.",
    "practice": "Responsibility, boundaries, decision making, adaptability, effective action.",
    "changes": "Less energy fighting what you can’t control. More energy where you have influence.",
    "line": "The world will give you plenty to react to. The Practice helps you return to what you can do."
  },
  {
    "title": "Because how you lead yourself affects everyone around you.",
    "sub": "Personal growth has a ripple effect.",
    "body": "A parent who learns to pause makes room for a child to speak honestly. A leader who takes responsibility helps build a more accountable team. Leadership isn’t reserved for people with titles.",
    "practice": "Personal leadership, relational leadership, accountability, contribution.",
    "changes": "Your growth improves the relationships and places you help shape.",
    "line": "The work you do on yourself doesn’t end with you."
  },
  {
    "title": "Because you are worth the effort.",
    "sub": "Your life is not something to get through.",
    "body": "You can become very good at taking care of almost everything except yourself. You tell yourself you’ll get back to your own life when things settle down. What if the reason to practice isn’t that something is wrong with you, but that your life matters?",
    "practice": "Self respect, self trust, self awareness, intentional living.",
    "changes": "You start treating your life as something to take part in, not just survive.",
    "line": "You are not another item on your list. You are the person living this life."
  }
];

/**
 * The Academy's collections, as the Academy names them, each with its logo from the client's Drive ("Academy
 * Logos / USE THESE LOGOS", November 3; Leah, November 4: "Can you swap these out with academy logos"). Each
 * line is the approved Academy copy's ("Academy Page Rebuild: Copy and Build Directions"), except Health &
 * Energy's, which that copy does not have yet. The three collections live in the app list their courses as the app
 * has them; the rest are coming soon. `dark` is the logo on the dark-mode card.
 */
const ACADEMY: Omit<Collection, "image" | "dark">[] = [
  {
    name: "Human Foundations",
    status: "now",
    desc: "Thought, emotion, identity, belief, and the daily practice of self-leadership.",
    courses: [
      "InnerBoard 101",
      "Thought Awareness 101",
      "Emotional Mastery 101",
      "Personal Ownership 101",
      "Personal Power",
      "Self-Leadership Basics",
      "Understanding Your Patterns",
      "Rewiring Thought Loops",
      "From Reaction to Response",
      "Regulating Yourself Under Pressure",
      "Identity Reconstruction",
      "Emotional Alchemy",
      "Advanced Self-Leadership",
      "Embodied Self-Mastery"
    ],
    slug: "human-foundations"
  },
  {
    name: "The Wisdom Collective",
    status: "now",
    desc: "48 books. 7 research-grounded frameworks. The science underneath why this work works.",
    courses: [],
    note: "One course, in seven parts.",
    slug: "the-wisdom-collective"
  },
  {
    name: "Relationships & Connection",
    status: "now",
    desc: "How you communicate, what you keep repeating, where your boundaries are, and building real connection.",
    courses: [
      "Relationships 101",
      "Communication 101",
      "Boundaries 101",
      "What You Believe Is True",
      "Leading Yourself Through Conflict",
      "The Practice of Honest Communication",
      "When a Boundary Is Tested",
      "The People-Pleasing Pattern",
      "Relational Freedom",
      "The Relational Mirror",
      "Relational Leadership"
    ],
    slug: "relationships-and-connection"
  },
  {
    name: "The Certified Mind Method",
    status: "now",
    desc: "The complete method behind INQ Certification: five tools that create real follow-through in your own life and with anyone you lead. One course, purchased as one.",
    courses: [],
    note: "Part of INQ Certification.",
    href: "/inq",
    cta: "See INQ Certification",
    slug: "certified-mind-method"
  },
  {
    name: "Teens",
    status: "soon",
    desc: "Identity, big emotions, confidence, and the early practice of self-leadership. Built for ages 14 to 18.",
    courses: [],
    slug: "teens"
  },
  {
    name: "Young Adult Life",
    status: "soon",
    desc: "Self-trust, direction, and building stability while building a life. For ages 18 to 25.",
    courses: [],
    slug: "young-adult-life"
  },
  {
    name: "Life Transitions & Midlife",
    status: "soon",
    desc: "For the season when everything is shifting and you\u2019re finding your footing.",
    courses: [],
    slug: "life-transitions-and-midlife"
  },
  {
    name: "Work, Career & Professional Life",
    status: "soon",
    desc: "Who you are at work, how you hold steady under pressure, and owning your part.",
    courses: [],
    slug: "work-career-and-professional-life"
  },
  {
    name: "Purpose & Life Design",
    status: "soon",
    desc: "From drifting to directing. Built on design, not motivation.",
    courses: [],
    slug: "purpose-and-life-design"
  },
  {
    name: "Health & Energy",
    status: "soon",
    desc: "How sleep, movement, food and stress shape the way you think, feel and lead.",
    courses: [],
    slug: "health-and-energy"
  },
  {
    name: "Spiritual Growth & Inner Expansion",
    status: "soon",
    desc: "Presence, stillness, trust, and the parts of life you feel more than you can explain.",
    courses: [],
    slug: "spiritual-growth-and-inner-expansion"
  },
  {
    name: "Money & Financial Life",
    status: "soon",
    desc: "The beliefs driving what you do with money. The part underneath every budget and strategy.",
    courses: [],
    slug: "money-and-financial-life"
  },
  {
    name: "Grief & Loss",
    status: "soon",
    desc: "Death, divorce, the loss of who you were. How to meet an ending, and what becomes possible after it.",
    courses: [],
    slug: "grief-and-loss"
  }
];

export const COLLECTIONS: Collection[] = ACADEMY.map((c) => ({
  ...c,
  image: `/images/practice/academy/${c.slug}.webp`,
  dark: `/images/practice/academy/${c.slug}-dark.webp`
}));

/** The INQ modules, in order. */
export const MODULES: Module[] = [
  {
    "n": "0",
    "name": "Accreditation",
    "lessons": 10
  },
  {
    "n": "1",
    "name": "Radical Awareness",
    "lessons": 14
  },
  {
    "n": "2",
    "name": "Mastering Emotions",
    "lessons": 13
  },
  {
    "n": "3",
    "name": "Identity Design & Reinvention",
    "lessons": 10
  },
  {
    "n": "4",
    "name": "Relationships as the Mirror",
    "lessons": 11
  },
  {
    "n": "5",
    "name": "Energy as a Leadership Strategy",
    "lessons": 13
  },
  {
    "n": "6",
    "name": "Alignment in Action",
    "lessons": 9
  },
  {
    "n": "7",
    "name": "Coaching Others: Becoming the Work",
    "lessons": 8
  },
  {
    "n": "8",
    "name": "Integration & Certification: Being the Work",
    "lessons": 6
  },
  {
    "n": "B",
    "name": "Bonus: The Entrepreneurial Path",
    "lessons": 12
  }
];
