import { expect, test } from "vitest";
import format from "./format.ts";

const ticket = `\`\`\`markdown
## User Story

As a user, I want exports to show progress, so that I don't export twice.

## About

Exports show no progress, so users click twice.

Exports should show a loading state.

## Acceptance Criteria

- The button shows a loading state.
- The button is disabled while exporting.

## Test Plan

1. Click Export. The button shows a loading state.
2. Click again. Nothing happens.
\`\`\``;

test("passes a well-formed ticket", () => {
  expect(format(ticket)).toEqual({ pass: true, score: 1, reason: "Format OK" });
});

test.each([
  ["markdown fences only, nothing outside", `Here you go:\n${ticket}`],
  ["markdown fences only, nothing outside", `${ticket}\nand another:\n${ticket}`],
  ["user story format", `${ticket}\n\n${ticket.replace("As a user", "The user")}`],
  ["exactly the four ## sections in order", ticket.replace("## About", "### About")],
  ["user story format", ticket.replace("As a user", "The user")],
  ["about has two or more paragraphs", ticket.replace("twice.\n\nExports", "twice. Exports")],
  ["acceptance criteria is an unordered list", ticket.replaceAll("- The", "* The")],
  ["test plan is a numbered list", ticket.replace("1. Click", "Click")],
])("fails %s", (check, output) => {
  const result = format(output);
  expect(result.pass).toBe(false);
  expect(result.reason).toContain(check);
});

test("passes one ticket per ask", () => {
  expect(format(`${ticket}\n\n${ticket}`).pass).toBe(true);
});

test("allows nested acceptance criteria", () => {
  expect(
    format(ticket.replace("- The button is disabled", "  - The button is disabled")).pass,
  ).toBe(true);
});

test("scores the share of checks passed", () => {
  expect(format(ticket.replace("1. Click", "Click")).score).toBeCloseTo(5 / 6);
});

test("fails everything without a fence", () => {
  expect(format("no ticket here")).toMatchObject({ pass: false, score: 0 });
});
