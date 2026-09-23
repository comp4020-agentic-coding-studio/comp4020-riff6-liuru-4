import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface ApiNode {
  id: string;
  type: string;
  title: string;
  meta?: Record<string, unknown>;
}

interface CourseApi {
  course?: { learningOutcomes?: string[] };
  nodes: ApiNode[];
}

const api = JSON.parse(readFileSync(resolve("dist/api/index.json"), "utf8")) as CourseApi;
const outcomesPage = readFileSync(resolve("dist/outcomes/index.html"), "utf8");
const homePage = readFileSync(resolve("dist/index.html"), "utf8");

const statements = api.course?.learningOutcomes ?? [];
/** Every statement is written `LO<n>. <sentence>`; the code is the handle. */
const codeOf = (statement: string) => statement.match(/^(LO\d+)\.\s/)?.[1];
const codes = statements.map(codeOf).filter((code): code is string => Boolean(code));

const byType = (type: string) => api.nodes.filter((node) => node.type === type);
const taught = [...byType("lectures"), ...byType("sessions"), ...byType("assessments")];
const outcomesOf = (node: ApiNode) => (node.meta?.outcomes as string[] | undefined) ?? [];

describe("the course declares its learning outcomes", () => {
  it("publishes them on the catalogue API", () => {
    expect(statements.length, "course.learningOutcomes").toBeGreaterThanOrEqual(4);
  });

  it("gives every outcome a unique LO<n> handle", () => {
    expect(codes, "well-formed LO codes").toHaveLength(statements.length);
    expect(new Set(codes).size, "distinct codes").toBe(codes.length);
  });

  it("states each outcome as something a student can be judged against", () => {
    for (const statement of statements) {
      expect(statement.replace(/^LO\d+\.\s/, "").length, statement).toBeGreaterThan(40);
    }
  });
});

describe("every teaching artefact maps to an outcome", () => {
  it("declares at least one outcome on each lecture, seminar and assessment", () => {
    const unmapped = taught.filter((node) => outcomesOf(node).length === 0).map((node) => node.id);
    expect(unmapped, "content with no outcomes").toEqual([]);
  });

  it("only references outcomes the course actually declares", () => {
    const dangling = taught.flatMap((node) =>
      outcomesOf(node)
        .filter((code) => !codes.includes(code))
        .map((code) => `${node.id} -> ${code}`),
    );
    expect(dangling, "references to undeclared outcomes").toEqual([]);
  });
});

describe("every outcome is actually taught and actually assessed", () => {
  it("backs each outcome with at least one seminar", () => {
    for (const code of codes) {
      const seminars = byType("sessions").filter((node) => outcomesOf(node).includes(code));
      expect(seminars.length, `${code} seminars`).toBeGreaterThanOrEqual(1);
    }
  });

  it("backs each outcome with at least one assessment", () => {
    for (const code of codes) {
      const assessments = byType("assessments").filter((node) => outcomesOf(node).includes(code));
      expect(assessments.length, `${code} assessments`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("the front page states the outcomes, not just the prose", () => {
  it("names every outcome a prospective student is being promised", () => {
    for (const statement of statements) {
      const code = codeOf(statement)!;
      expect(homePage, `${code} on the front page`).toContain(code);
      // The sentence itself, not just the handle --- a bare "LO3" on the
      // homepage tells a prospective student nothing.
      const opening = statement.replace(/^LO\d+\.\s/, "").slice(0, 40);
      expect(homePage, `${code} statement on the front page`).toContain(opening);
    }
  });

  it("sends the reader to the full map rather than repeating it", () => {
    expect(homePage, "link to /outcomes/").toMatch(/href="[^"]*\/outcomes\/"/);
  });
});

describe("the outcomes page is the map a student can read", () => {
  it("names every outcome", () => {
    for (const code of codes) {
      expect(outcomesPage, `${code} on /outcomes/`).toContain(code);
    }
  });

  it("lists, under each outcome, the work that addresses it", () => {
    for (const node of taught) {
      if (outcomesOf(node).length === 0) continue;
      expect(outcomesPage, `${node.id} linked from /outcomes/`).toContain(`${node.id}/`);
    }
  });
});
