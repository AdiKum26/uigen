import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Mock contexts
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div>{children}</div>,
  useFileSystem: vi.fn(() => ({
    fileSystem: {},
    selectedFile: null,
    setSelectedFile: vi.fn(),
    getAllFiles: vi.fn(() => new Map()),
    refreshTrigger: 0,
    handleToolCall: vi.fn(),
    reset: vi.fn(),
  })),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div>{children}</div>,
  useChat: vi.fn(() => ({
    messages: [],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    status: "idle",
  })),
}));

// Mock heavy child components
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Actions</div>,
}));

// Mock resizable panels
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders preview view by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("switches to code view when Code tab is clicked", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Preview should be shown by default
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  // Click the "Code" tab
  const codeTab = screen.getByRole("tab", { name: "Code" });
  await user.click(codeTab);

  // Code editor should now be shown
  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();
});

test("switches back to preview view when Preview tab is clicked", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Switch to code view first
  const codeTab = screen.getByRole("tab", { name: "Code" });
  await user.click(codeTab);

  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Now click the "Preview" tab
  const previewTab = screen.getByRole("tab", { name: "Preview" });
  await user.click(previewTab);

  // Preview should be shown again
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("Preview tab is active by default", () => {
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  const codeTab = screen.getByRole("tab", { name: "Code" });

  expect(previewTab.getAttribute("data-state")).toBe("active");
  expect(codeTab.getAttribute("data-state")).toBe("inactive");
});

test("Code tab becomes active after clicking", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  const codeTab = screen.getByRole("tab", { name: "Code" });

  await user.click(codeTab);

  expect(previewTab.getAttribute("data-state")).toBe("inactive");
  expect(codeTab.getAttribute("data-state")).toBe("active");
});

test("toggle works multiple times", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  const codeTab = screen.getByRole("tab", { name: "Code" });

  // Default: preview
  expect(previewTab.getAttribute("data-state")).toBe("active");

  // Click code
  await user.click(codeTab);
  expect(codeTab.getAttribute("data-state")).toBe("active");

  // Click preview
  await user.click(previewTab);
  expect(previewTab.getAttribute("data-state")).toBe("active");

  // Click code again
  await user.click(codeTab);
  expect(codeTab.getAttribute("data-state")).toBe("active");

  // Click preview again
  await user.click(previewTab);
  expect(previewTab.getAttribute("data-state")).toBe("active");
});
