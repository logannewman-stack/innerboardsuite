/**
 * The content behind the interactive parts of the design (November 1, 2026), word for word: the ten reasons
 * (/story), the Academy's library (/academy, as Leah's Academy page mockup of November 6 has it), and the INQ
 * journey (/inq).
 */
export interface Reason { title: string; sub: string; body: string; practice: string; changes: string; line: string }

/** The three tiers a tiered collection is shelved in. */
export type Tier = "Foundations" | "Practicum" | "Graduate";
/** Something the Academy sells: its checkout id in the app (`/academy/buy/<id>`), its title and its price. */
export interface Buyable { id: string; title: string; price: number }
/** A course in a tiered collection: its title and the line under it. */
export interface Course extends Buyable { line: string }
/** One of the four open collections. A tiered one has `tiers` and `bundle`; a single course has `single`. */
export interface OpenCollection extends Buyable {
  name: string;
  blurb: string;
  image: string;
  dark: string;
  tiers?: { tier: Tier; what: string; courses: Course[] }[];
  /** The whole collection, bought at once. */
  bundle?: { title: string; text: string };
  /** One course bought as one: what it is, the note under it, and its modules (a title, and a line where it has one). */
  single?: { label: string; note: string; modules: { title: string; line: string }[] };
}
/** A collection still to come. `image` is missing where its logo is still being drawn. */
export interface SoonCollection { name: string; blurb: string; image?: string; dark?: string }
export interface Module { n: string; name: string }

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
 * The id a thing the Academy sells goes by, in the app’s checkout (`/academy/buy/<id>`): its title in lower case,
 * "&" as "and", and every run of anything else that is not a letter or a digit as one hyphen.
 */
export const buyId = (title: string) => title.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Prices, in cents: every course in a tiered collection, a whole collection, and a single course. */
export const PRICE = { course: 1900, collection: 9900, single: 9900 } as const;
/** "$19", from 1900. */
export const dollars = (cents: number) => `$${cents % 100 ? (cents / 100).toFixed(2) : cents / 100}`;

/** What each tier is for (Leah’s mockup, `TIERS`). */
export const TIERS: Record<Tier, string> = {
  Foundations: "Where you start seeing what’s driving you. Your thoughts, your reactions, and why you keep doing what you do.",
  Practicum: "You know it. You still do it. This is where that changes.",
  Graduate: "For the moments with the most at stake. The hardest conversations, the oldest habits, and the places you still lose yourself."
};

/** A logo from the Drive’s "Academy Logos / USE THESE LOGOS" (files 14 to 26, the icon with its name under it),
 * on the light card and on the dark-mode card. */
const logo = (slug: string) => ({ image: `/images/practice/academy/${slug}.webp`, dark: `/images/practice/academy/${slug}-dark.webp` });
const courses = (list: [string, string][]): Course[] => list.map(([title, line]) => ({ id: buyId(title), title, line, price: PRICE.course }));
const tiers = (t: Record<Tier, [string, string][]>) => (Object.keys(t) as Tier[]).map((tier) => ({ tier, what: TIERS[tier], courses: courses(t[tier]) }));
const open = (name: string, slug: string, price: number, rest: Omit<OpenCollection, keyof Buyable | "name" | "image" | "dark">): OpenCollection =>
  ({ id: buyId(name), title: name, price, name, ...logo(slug), ...rest });

/**
 * The four open collections, word for word as Leah’s Academy page mockup (November 6) has them (`OPEN`): the
 * two tiered collections, each course $19 and the whole collection $99, and the two single courses, $99 each.
 */
export const OPEN: OpenCollection[] = [
  open("Human Foundations", "human-foundations", PRICE.collection, {
    blurb: "The complete inner world: thought, emotion, identity, belief, and the daily practice of self-leadership.",
    tiers: tiers({
      Foundations: [
        ["InnerBoard 101", "You are what you practice being."],
        ["Thought Awareness 101", "Catch the thought before it becomes you."],
        ["Emotional Mastery 101", "Feel it all the way through."],
        ["Personal Ownership 101", "There’s a version of your life where everything that isn’t working is someone else’s fault."],
        ["Personal Power", "Lead the moment, or it leads you."]
      ],
      Practicum: [
        ["Self-Leadership Basics", "You already know more about yourself than you’re living."],
        ["Understanding Your Patterns", "The same argument in different relationships. The same stall at the same point in a project."],
        ["Rewiring Thought Loops", "There’s a thought you’ve had thousands of times."],
        ["From Reaction to Response", "Someone says the thing that lands wrong, and you’re already reacting."],
        ["Regulating Yourself Under Pressure", "You check who else is going before you say yes."]
      ],
      Graduate: [
        ["Identity Reconstruction", "You built an identity to survive the context you were in. It worked, until it became the ceiling."],
        ["Emotional Alchemy", "The capacity to feel everything, and be stopped by nothing."],
        ["Advanced Self-Leadership", "Living what you know when it costs something."],
        ["Embodied Self-Mastery", "The moment the work stops being something you do and becomes something you are."]
      ]
    }),
    bundle: { title: "The whole collection", text: "All 14 Human Foundations courses, every tier." }
  }),
  open("Relationships & Connection", "relationships-and-connection", PRICE.collection, {
    blurb: "Communication, patterns, boundaries, and the inner work of building real connection.",
    tiers: tiers({
      Foundations: [
        ["Relationships 101", "Every relationship you have is a reflection of the one you have with yourself."],
        ["Communication 101", "The conversation begins inside you."],
        ["Boundaries 101", "A boundary isn’t a rule for someone else. It’s a decision about yourself."],
        ["What You Believe Is True", "You author your experience. A belief makes that harder to see."]
      ],
      Practicum: [
        ["Leading Yourself Through Conflict", "Conflict is an inside job."],
        ["The Practice of Honest Communication", "Say what you mean. Own what you say."],
        ["When a Boundary Is Tested", "The decision was the boundary. This is the follow-through."],
        ["The People-Pleasing Pattern", "The yes was never for them."]
      ],
      Graduate: [
        ["Relational Freedom", "Somewhere in your life is a relationship where the smallest moments hit the hardest."],
        ["The Relational Mirror", "Your biggest reactions rarely match their moments."],
        ["Relational Leadership", "Somewhere in your life is a relationship running below what you know is possible."]
      ]
    }),
    bundle: { title: "The whole collection", text: "All 11 Relationships & Connection courses, every tier." }
  }),
  open("The Wisdom Collective", "the-wisdom-collective", PRICE.single, {
    blurb: "48 books. 7 research-grounded frameworks. The science underneath why this work works.",
    single: {
      label: "One course, seven modules",
      note: "Purchased as one. The modules work as one arc: mind, body, identity, behavior, performance, people, and purpose.",
      modules: [
        { title: "The Mind That Filters Everything", line: "What am I thinking that I think is true?" },
        { title: "Your Body Has a Vote", line: "Is my biology supporting my ambition, or quietly working against it?" },
        { title: "Who Do You Think You Are?", line: "Who am I becoming?" },
        { title: "You Are What You Repeat", line: "How do I change what I do, not just what I intend to do?" },
        { title: "The Architecture of Doing Your Best Work", line: "How do I consistently achieve at the level I know I’m capable of?" },
        { title: "The Science of People Who Lead Well", line: "How do I influence, connect with, and bring out the best in the people around me?" },
        { title: "What Is All of This in Service Of?", line: "The question the whole course builds toward." }
      ]
    }
  }),
  open("The Certified Mind Method", "certified-mind-method", PRICE.single, {
    blurb: "The complete method behind INQ Certification: five tools that create real follow-through in your own life and with anyone you lead.",
    single: {
      label: "One course, standalone",
      note: "Follow-through was never a discipline problem. Five tools, each taught twice: once to run on yourself, once to run with anyone you lead.",
      modules: ["See the thought", "Trace the loop", "Find the driver", "Choose the instruction", "Take the seat"].map((title) => ({ title, line: "" }))
    }
  })
];

/**
 * The library, in the mockup’s three groups (`GROUPS`). The core curriculum is the four open collections; every
 * other collection is coming soon. Parenting & Family Life has no logo yet (Michelle is drawing it).
 */
export const GROUPS: { label: string; cards: (OpenCollection | SoonCollection)[] }[] = [
  { label: "Core Curriculum", cards: OPEN },
  {
    label: "Life Stage Collections",
    cards: [
      { name: "Teens", blurb: "Identity, big emotions, confidence, and the early practice of self-leadership, built for ages 14 to 18.", ...logo("teens") },
      { name: "Young Adult Life", blurb: "Self-trust, direction, and building stability while building a life, for ages 18 to 25.", ...logo("young-adult-life") },
      { name: "Life Transitions & Midlife", blurb: "For anyone in a season where the life they were living no longer fits the person they are becoming.", ...logo("life-transitions-and-midlife") },
      { name: "Parenting & Family Life", blurb: "How your inner world shapes your family system, and how to lead your home from the inside out." }
    ]
  },
  {
    label: "Domain Collections",
    cards: [
      { name: "Work, Career & Professional Life", blurb: "The inner game of work: identity, regulation under pressure, and personal ownership in the workplace.", ...logo("work-career-and-professional-life") },
      { name: "Purpose & Life Design", blurb: "Not motivation. Design. For the person ready to move from drifting to directing.", ...logo("purpose-and-life-design") },
      { name: "Spiritual Growth & Inner Expansion", blurb: "Presence, stillness, trust, and the dimensions of experience that science describes but cannot fully contain.", ...logo("spiritual-growth-and-inner-expansion") },
      { name: "Money & Financial Life", blurb: "The beliefs and identity stories driving your financial behavior, the self-leadership layer underneath the strategy.", ...logo("money-and-financial-life") },
      { name: "Grief & Loss", blurb: "The inner work of endings: death, divorce, identity loss, and what becomes possible on the other side.", ...logo("grief-and-loss") },
      { name: "Health & Energy", blurb: "The body as information. How your physical state shapes how you lead yourself, and the reverse.", ...logo("health-and-energy") }
    ]
  }
];

/** Everything the Academy sells, for the app’s checkout: each course, each whole collection, each single course. */
export const BUYABLE = OPEN.flatMap((c) => [
  ...(c.tiers || []).flatMap((t) => t.courses.map((k) => ({ id: k.id, title: k.title, kind: "course" as const, collection: c.id, price_cents: k.price }))),
  { id: c.id, title: c.name, kind: c.tiers ? ("collection" as const) : ("single" as const), collection: c.id, price_cents: c.price }
]);

/** The INQ modules, in order. */
export const MODULES: Module[] = [
  { n: "0", name: "Accreditation" },
  { n: "1", name: "Radical Awareness" },
  { n: "2", name: "Mastering Emotions" },
  { n: "3", name: "Identity Design & Reinvention" },
  { n: "4", name: "Relationships as the Mirror" },
  { n: "5", name: "Energy as a Leadership Strategy" },
  { n: "6", name: "Alignment in Action" },
  { n: "7", name: "Coaching Others: Becoming the Work" },
  { n: "8", name: "Integration & Certification: Being the Work" },
  { n: "B", name: "Bonus: The Entrepreneurial Path" }
];
