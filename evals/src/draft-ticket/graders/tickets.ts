import { FENCE } from "./format.ts";

export default (output: string, context: { vars: { tickets?: number } }) => {
  const expected = context.vars.tickets ?? 1;
  const actual = (output.match(FENCE) ?? []).length;
  const pass = actual === expected;
  return {
    pass,
    score: pass ? 1 : 0,
    reason: `Expected ${expected} ticket(s), got ${actual}`,
  };
};
