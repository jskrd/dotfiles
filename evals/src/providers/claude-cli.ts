import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

type Message = { role: string; content: string };

export function splitPrompt(prompt: string) {
  try {
    const messages: Message[] = JSON.parse(prompt);
    const join = (keep: (m: Message) => boolean) =>
      messages
        .filter(keep)
        .map((m) => m.content)
        .join("\n\n");
    return { system: join((m) => m.role === "system"), input: join((m) => m.role !== "system") };
  } catch {
    return { system: "", input: prompt };
  }
}

export function runClaude(model: string, prompt: string) {
  const { system, input } = splitPrompt(prompt);
  const args = [
    "-p",
    "--model",
    model,
    "--tools",
    "",
    "--setting-sources",
    "",
    "--strict-mcp-config",
    "--disable-slash-commands",
    "--no-session-persistence",
    "--system-prompt",
    system || "Follow the user's instructions exactly.",
  ];

  return new Promise<{ output?: string; error?: string }>((resolve) => {
    const child = spawn("claude", args, { cwd: tmpdir() });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) =>
      resolve(
        code === 0
          ? { output: stdout.trim() }
          : { error: stderr.trim() || `claude exited ${code}` },
      ),
    );
    child.stdin.end(input);
  });
}

// promptfoo instantiates providers with `new`, so this can't be an arrow function
export default function claudeCli(options: { config?: { model?: string } }) {
  const model = options.config?.model ?? "sonnet";
  return {
    id: () => `claude-cli:${model}`,
    callApi: (prompt: string) => runClaude(model, prompt),
  };
}
