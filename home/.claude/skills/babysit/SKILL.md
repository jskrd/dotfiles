---
name: babysit
description: Watch the current branch's pull request, resolving merge conflicts and fixing failed CI until it is conflict-free and all checks pass. Use only when the user explicitly asks to babysit or autonomously keep a PR green.
---

# babysit

Watch the current branch's PR and keep repairing it until it is green.

Invocation authorizes commits and pushes only for repairs to the current PR.

## Steps

1. Run the bundled `watch.sh` (in this skill's directory) with `bash`. It waits while checks are pending and prints one result.
2. Handle the result:
   - `CONFLICT`: fetch `BASE`, merge `origin/BASE` with `--no-ff --no-commit`, resolve conflicts, and run the relevant checks locally.
   - `FAILED`: inspect the listed checks and failed logs, fix the root cause, and re-run the failing check locally. Re-run the CI job once instead when the failure is clearly transient.
   - `GREEN`: report success and stop.
   - `STOP` or `ERROR`: report the reason and stop.
3. After changing the branch, invoke `/commit`, then `/push`, and repeat from step 1 until `GREEN`.

## Rules

- Never merge the PR, force-push, rewrite history, weaken checks, or change PR draft state.
- Don't touch unrelated changes.
- Never reply to reviews; address them in code only.
- Persist through further failures; stop early only when a safe fix cannot be determined.
