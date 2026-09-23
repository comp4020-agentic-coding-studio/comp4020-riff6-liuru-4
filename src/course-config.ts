import type { CourseMetaInput } from "astro-course-university";
import { z } from "astro/zod";

// The level digits ANU uses: 1000--4000 undergraduate, 6000 and 8000
// postgraduate. Both the code pattern and the level field derive from this.
const LEVELS = [1, 2, 3, 4, 6, 8] as const;
const allowedCode = new RegExp(`^SLOP[${LEVELS.join("")}]\\d{3}$`);

// A learning outcome is a capability the course claims to produce, carried
// under a stable `LO<n>` handle so content can point at it and the outcomes
// map can be checked. The catalogue contract only accepts flat sentences, so
// the handle is rendered into the string --- see `courseMeta` below.
const outcomeSchema = z.strictObject({
  code: z.string().regex(/^LO\d+$/, { message: "use an LO<n> handle" }),
  // The short label the outcomes map puts above the sentence.
  title: z.string().trim().min(1).max(60),
  // Long enough to be something a marker could actually judge against.
  description: z.string().trim().min(60),
});

export const slopCourseMetaSchema = z
  .strictObject({
    code: z.string().regex(allowedCode, {
      message: "use SLOP plus a 1000–4000, 6000 or 8000 level code",
    }),
    title: z.string().trim().min(1).max(100),
    session: z.string().trim().min(1).max(40),
    year: z.number().int().min(2026).max(2200),
    level: z.literal(LEVELS),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    description: z.string().trim().min(80).max(300),
    tags: z.array(z.string().trim().min(2).max(24)).min(1).max(3),
    learningOutcomes: z.array(z.string().trim().min(1)).min(4),
  })
  .superRefine((course, ctx) => {
    const codeLevel = Number(course.code.at(4));
    if (course.level !== codeLevel) {
      ctx.addIssue({
        code: "custom",
        path: ["level"],
        message: `must match ${course.code}'s first digit (${codeLevel})`,
      });
    }
    if (course.startDate > course.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "must not be after endDate",
      });
    }
  });

// What the course claims a student can do by the end, and the spine the
// /outcomes/ map hangs every lecture, seminar and assessment off. These are
// deliberately about attribution as a practice --- the evidence types, the
// methods that disagree, the verdict someone has to sign --- rather than
// about Tang Yin as a biography, because that practice is what the semester
// actually drills and what the dossier and defense actually mark.
//
// Content points back with `outcomes: [LO2, LO3]` in frontmatter, and
// `spec/learning-outcomes.test.ts` fails the build if an outcome goes
// untaught, unassessed, or is referenced by a handle that isn't here.
export const learningOutcomes = z
  .array(outcomeSchema)
  .min(4)
  .superRefine((outcomes, ctx) => {
    const codes = outcomes.map((outcome) => outcome.code);
    if (new Set(codes).size !== codes.length) {
      ctx.addIssue({ code: "custom", message: `duplicate outcome code in ${codes.join(", ")}` });
    }
    const expected = outcomes.map((_, index) => `LO${index + 1}`);
    if (codes.join() !== expected.join()) {
      ctx.addIssue({
        code: "custom",
        message: `number outcomes LO1..LO${outcomes.length}, got ${codes.join(", ")}`,
      });
    }
  })
  .parse([
    {
      code: "LO1",
      title: "Situate the dispute",
      description:
        "Account for why an attribution to Tang Yin is contested at all: the " +
        "Suzhou pian workshop economy that produced fakes for two centuries, " +
        "and what separates a securely attributed painting from a disputed one.",
    },
    {
      code: "LO2",
      title: "Read the object",
      description:
        // Em dashes are written as the character, not as `---`: these
        // strings are rendered straight into HTML and never pass through
        // the markdown pipeline that converts the shorthand in content files.
        "Weigh the physical evidence of a painting — paper, silk, ink, " +
        "pigment and brushwork — and say what each kind can and cannot " +
        "establish about whose hand held the brush.",
    },
    {
      code: "LO3",
      title: "Read the paper trail",
      description:
        "Interpret seals and colophons as documentary evidence, testing a " +
        "painting's paper trail with the source-critical habits of kaozheng " +
        "scholarship rather than taking an inscription at face value.",
    },
    {
      code: "LO4",
      title: "Adjudicate between methods",
      description:
        "Set the verbal and visual traditions of jianding against each other, " +
        "and both against computational stroke analysis, judging what each " +
        "method is competent to settle and where they are entitled to disagree.",
    },
    {
      code: "LO5",
      title: "Defend a verdict",
      description:
        "Reach a verdict proportionate to the evidence actually assembled, " +
        "state the confidence it carries and what would overturn it, and " +
        "defend it live against questions aimed at its weakest point.",
    },
  ]);

// The single source of truth for the course record. The generated homepage,
// navigation label and /api/index.json all read this object.
// Replace every placeholder value, but keep the shape: the catalogue ingests
// this API contract when the course is published.
//
// The code's last three digits were assigned to this repo when it was
// provisioned, and no other course in the cohort has them. Change the first
// digit to your course's level (and `level` to match); keep the other three.
export const courseMeta = slopCourseMetaSchema.parse({
  code: "SLOP6779",
  title: "The Tang Yin Problem",
  session: "Semester 1",
  year: 2027,
  level: 6,
  startDate: "2027-02-22",
  endDate: "2027-05-28",
  description:
    "A postgraduate seminar in connoisseurship: using six centuries of " +
    "disputed, copied and forged paintings attributed to the Ming master " +
    "Tang Yin to teach how attribution actually gets decided, and how " +
    "rarely it gets settled for good.",
  tags: ["connoisseurship", "art history", "forgery"],
  // The catalogue takes plain sentences, so each outcome arrives with its
  // handle rendered in --- `LO2. Weigh the physical evidence ...` --- which
  // keeps the code readable to a human and parseable by the spec test.
  learningOutcomes: learningOutcomes.map(({ code, description }) => `${code}. ${description}`),
}) satisfies CourseMetaInput;
