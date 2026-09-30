type Context = { vars: { notes: string } };

const criterion = (rule: string) => (_output: string, context: Context) =>
  `The notes were: ${context.vars.notes}

PASS only if: ${rule}`;

export const faithful = criterion(
  "Every requirement and fact in the ticket is stated or clearly implied by the notes; nothing is invented. The test plan may describe how to verify each criterion, and notes with no clear ask may become an investigation.",
);

export const complete = criterion(
  "Every requirement, constraint and open question in the notes appears in the ticket.",
);

export const testable = criterion("Each acceptance criterion is observable and testable.");

export const covered = criterion("The test plan exercises every acceptance criterion.");

export const plain = criterion("Wording is plain and concise.");
