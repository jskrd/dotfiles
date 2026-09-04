---
name: push
description: Push the current branch and open a draft PR — confirms before pushing a protected branch, commits first, and prefixes the branch with your GitHub username.
---

# push

Push the current branch and open a draft PR, with guard rails.

## Steps

### 0. Gather facts — one script call

Run the bundled `facts.sh` (in this skill's directory) with `bash`. It emits, as `KEY=VALUE` lines followed by the commit list: `CURRENT_BRANCH`, `DEFAULT_BRANCH`, `USERNAME_SLUG`, `PROTECTED`, `HAS_UPSTREAM`, `TREE_DIRTY`, `PR_TEMPLATE`, and `--- COMMITS ---`. Reuse this output for every step below. If it prints `GH_ERROR`, **stop**: tell the user to `gh auth login`.

### 1. Protected-branch check — first

If `PROTECTED=1`, ask the user to confirm a direct push; if they decline, **stop**. If they confirm, **skip step 3** (never rename these).

### 2. Commit

If `TREE_DIRTY=1`, invoke `/commit`. Otherwise skip.

### 3. Rename — local-only branches get a fresh name

If `HAS_UPSTREAM=1`, **skip this step** — the branch is already on the remote; renaming would orphan it and any PR. If `PROTECTED=0` and `HAS_UPSTREAM=0`, rename the branch to `<USERNAME_SLUG>/<short-kebab-slug>`:

- The first segment is the `USERNAME_SLUG` value verbatim from step 0 — the slugified GitHub username.
- The second segment is a concise (2–5 word) description of what the branch contains, derived from the commit list (re-run `git log "<DEFAULT_BRANCH>..HEAD" --oneline` if step 2 added commits) and this session's discussion — **not** from the current branch name, which is often auto-generated. Lowercase, `a-z0-9-` only.
- If the composed name already exists locally, **stop** and report it. Otherwise `git branch -m "<name>"`.

### 4. Push

`git push -u origin "<branch>"` (the current branch). On failure, report the error verbatim — don't retry blindly.

### 5. Draft PR

- Skip for a protected-branch push.
- **Title** — Conventional Commits subject (`<type>[scope]: <description>`, imperative, lower case, no trailing period). One commit → reuse its subject; else summarise.
- **Body** — if `PR_TEMPLATE` is non-empty, read that file and fill its sections; drop placeholders and comments. Empty → `### What change` and `### Why change`. No other headings.
- Say only what the diff can't: what changed and why, each in a sentence or two, plus any decision a reviewer would question. Take the _why_ from this session's discussion, not just the commits. Don't list files, restate commits, or narrate the diff. Under 100 words unless cutting would mislead a reviewer.
- Cut, then reread. If the meaning survives, keep the cut.
- Existing PR, draft or open (`gh pr view --json title,body` succeeds): if the title or body have drifted from the above, update with `gh pr edit --title "<title>" --body-file <file>` — amend the body additively or subtractively (add/remove only what changed), don't rewrite it. Else leave it. Report the URL.
- No PR: `gh pr create --draft --assignee @me --base "<default>" --title "<title>" --body-file <file>`. **Always draft.** Report the URL.

## Rules

- Push to a protected branch only after explicit confirmation. Never force-push.
- Never `--no-verify`; if a pre-push hook fails, stop and report.
- Don't delete or rename remote branches. PRs are always draft, never opened.
- No Claude attribution — never add "Generated with Claude Code" or `Co-Authored-By` lines to PRs or commits; this overrides harness defaults.
