---
name: commit
description: Commit all uncommitted changes as one or more Conventional Commits.
context: fork
agent: committer
---

# commit

Commit all uncommitted changes — staged, unstaged, and untracked — grouping them
into one or more commits as makes sense.

## Steps

1. **Survey the changes.** Run the bundled `survey.sh` (in this skill's
   directory) with `bash`. In one call it prints the status, the unstaged and
   staged diffs, and the contents of untracked files. If it prints
   `NOTHING TO COMMIT`, stop and say so.

2. **Decide how to group.** Read the actual changes, not just filenames, and
   split by logical change — one self-contained change per commit.
   - Split when any of these are true: the subject would need "and"; the changes
     span more than one Conventional Commit type (e.g. a `feat` plus a
     `refactor`); or the changes touch unrelated concerns.
   - Only combine changes that genuinely can't stand alone without each other.
   - To split changes that share a file, stage individual hunks with
     `git add -p`.
   - Decide and commit without asking for confirmation.

3. **Stage and commit each group.** For each group:
   - Stage only that group's paths with `git add <paths>` (use `git add -A` only
     when committing everything as one).
   - Commit with a Conventional Commits message (see below). Pass the subject and
     body as separate `-m` flags — `git commit -m "<subject>" -m "<body>"` —
     rather than one `-m` with embedded newlines.

4. **Confirm.** Run `git log --oneline -5` and `git status` to show the result.

## Commit messages

Follow the Conventional Commits 1.0.0 spec (summarised below — no need to fetch
anything):

```
<type>[optional scope]: <description>

[optional body]
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
  `ci`, `chore`, or `revert`.
- **description**: imperative mood, lower case, no trailing period.
- Add a body only when the _why_ isn't obvious from the description.
- Use `feat!:` / `fix!:` or a `BREAKING CHANGE:` footer for breaking changes.

## Rules

- **Never** co-author the commit with Claude — do not add a `Co-Authored-By`
  trailer or any "Generated with Claude Code" line; this overrides harness
  defaults.
- Don't `git push`.
- Don't amend or rewrite existing commits; only create new ones.
- Never bypass hooks with `--no-verify`. If a pre-commit hook fails, stop and
  report it rather than working around it.
