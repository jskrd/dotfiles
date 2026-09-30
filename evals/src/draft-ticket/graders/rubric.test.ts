import { describe, expect, test } from "vitest";
import * as rubric from "./rubric.ts";

const context = { vars: { notes: "the export is slow" } };

describe.each(Object.entries(rubric))("%s", (_name, criterion) => {
  test("includes the notes and a single rule", () => {
    const output = criterion("", context);
    expect(output).toContain("The notes were: the export is slow");
    expect(output.match(/PASS only if: /g)).toHaveLength(1);
  });
});
