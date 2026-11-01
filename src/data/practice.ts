/**
 * The content behind the interactive parts of the design (November 1, 2026), word for word: the ten reasons
 * (/story), the twelve Academy collections and their lessons (/academy), and the INQ journey (/inq).
 */
export interface Reason { title: string; sub: string; body: string; practice: string; changes: string; line: string }
export interface Collection { name: string; title: string; desc: string; levels: string[][]; image: string }
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

export const LEVELS = ["Foundations", "Practicum", "Graduate"] as const;
export const LEVEL_NOTES: string[] = ["Foundations: the core ideas and your first reps.", "Practicum: applying the skill in harder, real situations.", "Graduate: leading with the skill and helping others build it."];

export const COLLECTIONS: Collection[] = [
  {
    "name": "Self Awareness",
    "title": "Understand yourself. Lead your life.",
    "desc": "Build greater self awareness, recognize your patterns, and make more intentional choices.",
    "levels": [
      [
        "Understanding your inner world",
        "Thoughts, feelings, and behaviors",
        "Personal values and beliefs",
        "Building self trust",
        "Creating new patterns"
      ],
      [
        "Noticing patterns in real time",
        "Your story versus the facts",
        "Values in hard decisions",
        "Keeping promises to yourself"
      ],
      [
        "Self awareness under pressure",
        "Leading from your values",
        "Teaching what you practice"
      ]
    ],
    "image": "/images/practice/collection-self-awareness.webp"
  },
  {
    "name": "Emotional Regulation",
    "title": "Feel it without being ruled by it.",
    "desc": "Name what you feel, tolerate discomfort, and choose your response.",
    "levels": [
      [
        "Naming emotions",
        "Feelings as information",
        "The pause",
        "Tolerating discomfort",
        "Recovering after a reaction"
      ],
      [
        "Regulating in conflict",
        "Fear and action",
        "Frustration without blame",
        "Disappointment without quitting"
      ],
      [
        "Steady under pressure",
        "Emotional leadership at home and work",
        "Helping others pause"
      ]
    ],
    "image": "/images/practice/collection-emotional-regulation.webp"
  },
  {
    "name": "Relationships",
    "title": "Love well, on purpose.",
    "desc": "Practical skills for the people who matter most.",
    "levels": [
      [
        "Listening to understand",
        "Expressing needs without blame",
        "Allowing difference",
        "The art of repair",
        "Showing up with more than leftovers"
      ],
      [
        "Hard conversations at home",
        "Trust after a break",
        "Boundaries that hold"
      ],
      [
        "Relational leadership",
        "Building a family culture",
        "Long term connection"
      ]
    ],
    "image": "/images/practice/collection-relationships.webp"
  },
  {
    "name": "Communication",
    "title": "Say what matters, clearly.",
    "desc": "Speak honestly, listen fully, and handle hard conversations.",
    "levels": [
      [
        "Clear requests",
        "Listening without fixing",
        "Feedback you can hear",
        "Saying no",
        "Courageous conversations"
      ],
      [
        "Conflict without casualties",
        "Talking when you are hurt",
        "Difficult news"
      ],
      [
        "Communication as a leader",
        "Facilitating hard rooms",
        "Building a feedback culture"
      ]
    ],
    "image": "/images/practice/collection-communication.webp"
  },
  {
    "name": "Confidence",
    "title": "Be your own proof.",
    "desc": "Build self trust through action, follow through, and recovery.",
    "levels": [
      [
        "Confidence from evidence",
        "Keeping commitments",
        "Taking manageable risks",
        "Recovering from setbacks",
        "Acting before you feel ready"
      ],
      [
        "Self doubt in real time",
        "Visibility and courage",
        "Comparison"
      ],
      [
        "Confidence as a leader",
        "Holding your ground",
        "Helping others build proof"
      ]
    ],
    "image": "/images/practice/collection-confidence.webp"
  },
  {
    "name": "Decision Making",
    "title": "Decide without guarantees.",
    "desc": "Make clearer choices and stop waiting for certainty.",
    "levels": [
      [
        "Uncertainty is normal",
        "Choosing by your values",
        "Stopping avoidance",
        "Small decisions, daily",
        "Owning the outcome"
      ],
      [
        "Big decisions",
        "Decision fatigue",
        "Changing your mind well"
      ],
      [
        "Deciding for a team",
        "Speed and judgment",
        "Building decision habits"
      ]
    ],
    "image": "/images/practice/collection-decision-making.webp"
  },
  {
    "name": "Leadership",
    "title": "Lead yourself first.",
    "desc": "Leadership starts with the ability to lead yourself.",
    "levels": [
      [
        "Self leadership basics",
        "Responsibility and influence",
        "Your next action",
        "Leading without a title",
        "Accountability"
      ],
      [
        "Leading people you love",
        "Leading in hard seasons",
        "Delegation"
      ],
      [
        "Organizational leadership",
        "Culture by behavior",
        "Developing leaders"
      ]
    ],
    "image": "/images/practice/collection-leadership.webp"
  },
  {
    "name": "Productivity",
    "title": "Do what matters, repeatedly.",
    "desc": "Habits and systems that make progress less dependent on motivation.",
    "levels": [
      [
        "Reps over motivation",
        "Priorities",
        "Time and attention",
        "Follow through",
        "Adjusting what isn’t working"
      ],
      [
        "Breaking a habit",
        "Building a routine",
        "Overwhelm"
      ],
      [
        "Team rhythms",
        "Sustainable pace",
        "Systems that last"
      ]
    ],
    "image": "/images/practice/collection-productivity.webp"
  },
  {
    "name": "Health and Wellbeing",
    "title": "Care for the person living this life.",
    "desc": "Treat your own life as worth the same care you give everyone else.",
    "levels": [
      [
        "Rest without guilt",
        "Energy and attention",
        "Sustainable habits",
        "Stress and recovery",
        "Self respect"
      ],
      [
        "Health goals that stick",
        "Burnout warning signs",
        "Saying yes to yourself"
      ],
      [
        "Wellbeing as a leader",
        "Modeling balance",
        "Supporting your team"
      ]
    ],
    "image": "/images/practice/collection-health-and-wellbeing.webp"
  },
  {
    "name": "Purpose",
    "title": "Live on purpose, now.",
    "desc": "Get clear on what matters and take part in your life today.",
    "levels": [
      [
        "What matters to you",
        "Presence",
        "Meaning in ordinary days",
        "Dreams and participation",
        "Your next chapter"
      ],
      [
        "Transitions",
        "Starting over",
        "Legacy"
      ],
      [
        "Purpose at work",
        "Leading with meaning",
        "Helping others find theirs"
      ]
    ],
    "image": "/images/practice/collection-purpose.webp"
  },
  {
    "name": "Parenting",
    "title": "Be here for these years.",
    "desc": "Pausing, listening, and repair with the kids you love.",
    "levels": [
      [
        "Pausing before reacting",
        "Listening to your kids",
        "Repair after a hard moment",
        "Boundaries with warmth",
        "Being present"
      ],
      [
        "Parenting teenagers",
        "Parenting together after separation",
        "Letting them be different"
      ],
      [
        "Family culture",
        "Modeling self leadership",
        "Raising leaders"
      ]
    ],
    "image": "/images/practice/collection-parenting.webp"
  },
  {
    "name": "Money and Work",
    "title": "Build results you’re proud of.",
    "desc": "Decisions, boundaries, and leadership in your work and finances.",
    "levels": [
      [
        "Money stories",
        "Work and worth",
        "Asking for what you want",
        "Saying no at work",
        "Owning your results"
      ],
      [
        "Career decisions",
        "Building a business",
        "Leading a team"
      ],
      [
        "Running an organization",
        "Growth without burnout",
        "Building what lasts"
      ]
    ],
    "image": "/images/practice/collection-money-and-work.webp"
  }
];

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
