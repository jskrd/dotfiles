import { expect, test } from "vitest";
import prompt from "./prompt.ts";

test("strips the frontmatter", () => {
  const output = prompt({ vars: { notes: "notes" } });
  expect(output).not.toContain("name: draft-ticket");
  expect(output).not.toMatch(/^---/);
});

test("substitutes the notes", () => {
  const output = prompt({ vars: { notes: "the export is slow" } });
  expect(output).toContain("<notes>\nthe export is slow\n</notes>");
  expect(output).not.toContain("$ARGUMENTS");
});

test("keeps replacement patterns in notes literal", () => {
  expect(prompt({ vars: { notes: "costs $& and $'" } })).toContain("costs $& and $'");
});
