import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create command", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/App.jsx" })).toBe("Creating App.jsx");
});

test("getToolLabel: str_replace_editor str_replace command", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "src/components/Card.tsx" })).toBe("Editing Card.tsx");
});

test("getToolLabel: str_replace_editor insert command", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "src/index.ts" })).toBe("Editing index.ts");
});

test("getToolLabel: str_replace_editor view command", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "src/utils.ts" })).toBe("Reading utils.ts");
});

test("getToolLabel: str_replace_editor unknown command falls back to Editing", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" })).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor with no args falls back gracefully", () => {
  expect(getToolLabel("str_replace_editor", {})).toBe("Editing file");
});

test("getToolLabel: file_manager rename command", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "src/OldName.tsx" })).toBe("Renaming OldName.tsx");
});

test("getToolLabel: file_manager delete command", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "src/Unused.tsx" })).toBe("Deleting Unused.tsx");
});

test("getToolLabel: file_manager unknown command falls back to Managing", () => {
  expect(getToolLabel("file_manager", { command: "unknown", path: "src/File.tsx" })).toBe("Managing File.tsx");
});

test("getToolLabel: unknown tool name is formatted as title case", () => {
  expect(getToolLabel("some_custom_tool", {})).toBe("Some Custom Tool");
});

test("getToolLabel: path with no slashes uses the path as filename", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "App.jsx" })).toBe("Creating App.jsx");
});

// --- ToolCallBadge rendering tests ---

test("ToolCallBadge shows green dot when state is result", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/App.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );

  expect(screen.getByTestId("status-dot")).toBeDefined();
  expect(screen.queryByTestId("spinner")).toBeNull();
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallBadge shows spinner when state is not result", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/App.jsx" },
        state: "call",
      }}
    />
  );

  expect(screen.getByTestId("spinner")).toBeDefined();
  expect(screen.queryByTestId("status-dot")).toBeNull();
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallBadge shows spinner when result is null", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "src/Button.tsx" },
        state: "result",
        result: null,
      }}
    />
  );

  expect(screen.getByTestId("spinner")).toBeDefined();
  expect(screen.queryByTestId("status-dot")).toBeNull();
});

test("ToolCallBadge renders editing label for str_replace command", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "2",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "src/components/Card.tsx" },
        state: "result",
        result: "Done",
      }}
    />
  );

  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("ToolCallBadge renders file_manager delete label", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "3",
        toolName: "file_manager",
        args: { command: "delete", path: "src/OldComponent.tsx" },
        state: "result",
        result: "Deleted",
      }}
    />
  );

  expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
});

test("ToolCallBadge renders file_manager rename label", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "4",
        toolName: "file_manager",
        args: { command: "rename", path: "src/NewName.tsx" },
        state: "result",
        result: "Renamed",
      }}
    />
  );

  expect(screen.getByText("Renaming NewName.tsx")).toBeDefined();
});

test("ToolCallBadge renders formatted fallback for unknown tool", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "5",
        toolName: "some_custom_tool",
        args: {},
        state: "result",
        result: "Done",
      }}
    />
  );

  expect(screen.getByText("Some Custom Tool")).toBeDefined();
});
