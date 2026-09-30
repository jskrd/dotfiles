import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { beforeEach, describe, expect, test, vi } from "vitest";
import claudeCli, { runClaude, splitPrompt } from "./claude-cli.ts";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn() }));
vi.mock("node:child_process", () => ({ spawn }));

let stdin: string;

const fakeChild = (code: number, stdout = "", stderr = "") => {
  const child = Object.assign(new EventEmitter(), {
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    stdin: {
      end: (input: string) => {
        stdin = input;
        child.stdout.end(stdout);
        child.stderr.end(stderr);
        setImmediate(() => child.emit("close", code));
      },
    },
  });
  return child;
};

const argAfter = (flag: string) => {
  const args: string[] = spawn.mock.lastCall?.[1];
  return args[args.indexOf(flag) + 1];
};

beforeEach(() => {
  spawn.mockReset();
  stdin = "";
});

describe("splitPrompt", () => {
  test("passes a plain prompt through", () => {
    expect(splitPrompt("hello")).toEqual({ system: "", input: "hello" });
  });

  test("separates system and other messages", () => {
    const prompt = JSON.stringify([
      { role: "system", content: "grade" },
      { role: "user", content: "one" },
      { role: "user", content: "two" },
    ]);
    expect(splitPrompt(prompt)).toEqual({ system: "grade", input: "one\n\ntwo" });
  });
});

describe("runClaude", () => {
  test("runs claude with the model", async () => {
    spawn.mockImplementation(() => fakeChild(0));
    await runClaude("haiku", "hi");
    expect(spawn.mock.lastCall?.[0]).toBe("claude");
    expect(argAfter("--model")).toBe("haiku");
  });

  test("sends a plain prompt on stdin with a default system prompt", async () => {
    spawn.mockImplementation(() => fakeChild(0, " answer \n"));
    expect(await runClaude("sonnet", "hello")).toEqual({ output: "answer" });
    expect(stdin).toBe("hello");
    expect(argAfter("--system-prompt")).toBe("Follow the user's instructions exactly.");
  });

  test("sends chat messages as system prompt and stdin", async () => {
    spawn.mockImplementation(() => fakeChild(0));
    await runClaude(
      "sonnet",
      JSON.stringify([
        { role: "system", content: "grade" },
        { role: "user", content: "one" },
      ]),
    );
    expect(argAfter("--system-prompt")).toBe("grade");
    expect(stdin).toBe("one");
  });

  test("returns stderr on failure", async () => {
    spawn.mockImplementation(() => fakeChild(1, "", " boom \n"));
    expect(await runClaude("sonnet", "hi")).toEqual({ error: "boom" });
  });

  test("reports the exit code when stderr is empty", async () => {
    spawn.mockImplementation(() => fakeChild(2));
    expect(await runClaude("sonnet", "hi")).toEqual({ error: "claude exited 2" });
  });
});

describe("claudeCli", () => {
  test("defaults to sonnet", () => {
    expect(claudeCli({}).id()).toBe("claude-cli:sonnet");
  });

  test("runs claude with the configured model", async () => {
    spawn.mockImplementation(() => fakeChild(0, "ok"));
    const cli = claudeCli({ config: { model: "opus" } });
    expect(await cli.callApi("hi")).toEqual({ output: "ok" });
    expect(cli.id()).toBe("claude-cli:opus");
    expect(argAfter("--model")).toBe("opus");
  });
});
