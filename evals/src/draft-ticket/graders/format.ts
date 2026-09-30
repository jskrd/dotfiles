const SECTIONS = ["User Story", "About", "Acceptance Criteria", "Test Plan"];
export const FENCE = /```markdown\n([\s\S]*?)\n```/gi;

const checkTicket = (body: string): Record<string, boolean> => {
  const sections: Record<string, string> = Object.fromEntries(
    body
      .split(/^## /m)
      .slice(1)
      .map((s) => [s.replace(/\n[\s\S]*/, "").trim(), s.replace(/^.*\n?/, "").trim()]),
  );
  const headings = [...body.matchAll(/^#+ (.+)$/gm)].map((m) => m[0]);

  return {
    "exactly the four ## sections in order":
      headings.join("|") === SECTIONS.map((s) => `## ${s}`).join("|"),
    "user story format": /^As an? .+, I want .+, so that .+\.$/.test(sections["User Story"] ?? ""),
    "about has two or more paragraphs": (sections["About"] ?? "").split(/\n\s*\n/).length >= 2,
    "acceptance criteria is an unordered list": /^( *- .+\n?)+$/.test(
      sections["Acceptance Criteria"] ?? "",
    ),
    "test plan is a numbered list": /^(\d+\. .+\n?)+$/.test(sections["Test Plan"] ?? ""),
  };
};

export default (output: string) => {
  const tickets = [...output.matchAll(FENCE)].map((m) => checkTicket(String(m[1])));
  const checks: Record<string, boolean> = {
    "markdown fences only, nothing outside":
      tickets.length > 0 && output.replace(FENCE, "").trim() === "",
    ...Object.fromEntries(
      Object.keys(checkTicket("")).map((k) => [
        k,
        tickets.length > 0 && tickets.every((t) => t[k]),
      ]),
    ),
  };

  const failed = Object.keys(checks).filter((k) => !checks[k]);
  return {
    pass: failed.length === 0,
    score: 1 - failed.length / Object.keys(checks).length,
    reason: failed.length ? `Failed: ${failed.join("; ")}` : "Format OK",
  };
};
