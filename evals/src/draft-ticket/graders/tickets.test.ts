import { expect, test } from "vitest";
import tickets from "./tickets.ts";

const ticket = "```markdown\n## User Story\n```";

test("expects one ticket by default", () => {
  expect(tickets(ticket, { vars: {} }).pass).toBe(true);
  expect(tickets(`${ticket}\n${ticket}`, { vars: {} })).toMatchObject({ pass: false, score: 0 });
});

test("expects the number of tickets the test sets", () => {
  expect(tickets(`${ticket}\n${ticket}`, { vars: { tickets: 2 } }).pass).toBe(true);
  expect(tickets(ticket, { vars: { tickets: 2 } }).reason).toBe("Expected 2 ticket(s), got 1");
});

test("counts no tickets when there are none", () => {
  expect(tickets("nothing", { vars: {} }).reason).toBe("Expected 1 ticket(s), got 0");
});
