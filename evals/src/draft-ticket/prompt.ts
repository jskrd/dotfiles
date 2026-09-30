import { readFileSync } from "node:fs";
import { join } from "node:path";

const skill = readFileSync(
  join(import.meta.dirname, "../../../home/.claude/skills/draft-ticket/SKILL.md"),
  "utf8",
).replace(/^---\n[\s\S]*?\n---\n/, "");

export default ({ vars }: { vars: { notes: string } }): string =>
  skill.replace("$ARGUMENTS", () => vars.notes);
