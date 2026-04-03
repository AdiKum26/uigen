"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>
): string {
  const filename =
    typeof args.path === "string" && args.path
      ? args.path.split("/").pop() ?? args.path
      : null;

  if (toolName === "str_replace_editor") {
    let action: string;
    switch (args.command) {
      case "create":
        action = "Creating";
        break;
      case "str_replace":
      case "insert":
        action = "Editing";
        break;
      case "view":
        action = "Reading";
        break;
      default:
        action = "Editing";
    }
    return filename ? `${action} ${filename}` : `${action} file`;
  }

  if (toolName === "file_manager") {
    let action: string;
    switch (args.command) {
      case "rename":
        action = "Renaming";
        break;
      case "delete":
        action = "Deleting";
        break;
      default:
        action = "Managing";
    }
    return filename ? `${action} ${filename}` : `${action} file`;
  }

  // Fallback: format the tool name (replace underscores, title-case each word)
  return toolName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const label = getToolLabel(toolInvocation.toolName, toolInvocation.args);
  const isComplete =
    toolInvocation.state === "result" && toolInvocation.result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div
            className="w-2 h-2 rounded-full bg-emerald-500"
            data-testid="status-dot"
          ></div>
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2
            className="w-3 h-3 animate-spin text-blue-600"
            data-testid="spinner"
          />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
