---
name: draft-ticket
description: Turn rambling notes into a ticket with a user story, about, acceptance criteria, and test plan.
argument-hint: <rambling notes>
model: sonnet
disable-model-invocation: true
---

Rewrite the notes below as one ticket. Only split into several if the notes explicitly ask for separate tickets. Output one fenced `markdown` code block per ticket, with no text before, between or after them. Never nest code fences inside a ticket.

<notes>
$ARGUMENTS
</notes>

Use exactly these four `##` sections, in this order, with no title or other headings:

- **User Story**: "As a <role>, I want <capability>, so that <benefit>." The role is a plain word for who benefits, like developer or user, not a job title.
- **About**: plain paragraphs, no labels: first how things are today (for new features, what's missing), then what should change, then any open questions. Usually two, more if there's a lot of detail.
- **Acceptance Criteria**: unordered list of observable, testable outcomes. Leave out undecided values; raise them and other open questions in About.
- **Test Plan**: numbered steps covering every criterion, one line each: the action, then its expected result.

Include only what the notes state or clearly imply. Don't add requirements, process steps, or scenarios of your own. Write about the work, not the notes; never mention the notes, and phrase gaps as open questions.

If the notes don't say what should change, write an investigation ticket: the goal and criteria are findings, like the cause identified and options proposed, not targets.
