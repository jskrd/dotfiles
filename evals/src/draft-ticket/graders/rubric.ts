type Context = { vars: { notes: string } };

const criterion = (rule: string) => (_output: string, context: Context) =>
  `The notes were: ${context.vars.notes}

PASS only if: ${rule}`;

export const faithful = criterion(
  "Every requirement and fact in the ticket is stated or clearly implied by the notes; nothing is invented. The test plan may describe how to verify each criterion, and notes with no clear ask may become an investigation.",
);

export const complete = criterion(
  "Every requirement and constraint the notes state as settled appears in the ticket; unclear or undecided points may be left out.",
);

export const testable = criterion("Each acceptance criterion is observable and testable.");

export const covered = criterion("The test plan exercises every acceptance criterion.");

export const titled = criterion(
  "Each ticket's title is a few words, starts with an action verb, and gets straight to the point.",
);

export const plain = criterion("Wording is plain and concise.");
