# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup
npm run setup          # installs deps, generates Prisma client, runs migrations

# Development
npm run dev            # Next.js dev server with Turbopack on port 3000

# Testing
npm run test           # run all Vitest tests
npm run test -- path/to/file.test.ts  # run a single test file

# Linting
npm run lint           # ESLint

# Database
npm run db:reset       # reset SQLite database (destructive)
```

Environment: `.env` requires `ANTHROPIC_API_KEY` for real AI responses; without it, the app falls back to a mock provider that returns a static component.

## Architecture

UIGen is a Next.js 15 (App Router) application that lets users describe React components in chat, which Claude AI generates live into a virtual file system with a Monaco editor and iframe preview.

### AI Integration (`src/lib/`, `src/app/api/chat/`)

- **`/api/chat/route.ts`**: Streams Claude responses via Vercel AI SDK. The AI uses two tools — `str_replace_editor` (create/edit files) and `file_manager` (rename/delete) — to manipulate the virtual file system.
- **`src/lib/provider.ts`**: Switches between real `@ai-sdk/anthropic` (Claude Haiku 4.5) and a `MockLanguageModel` based on whether `ANTHROPIC_API_KEY` is set.
- **`src/lib/prompts/generation.tsx`**: System prompt for Claude. Uses Anthropic's ephemeral cache control for cost efficiency.
- **`src/lib/tools/`**: Tool definitions (`str-replace.ts`, `file-manager.ts`) that the AI uses to write code.

### Virtual File System (`src/lib/file-system.ts`, `src/lib/contexts/file-system-context.tsx`)

All generated code lives in-memory — nothing is written to disk. The `FileSystem` class manages the in-memory file tree and is serialized to JSON for database persistence. `FileSystemContext` exposes it to React components and handles tool call results from the AI stream.

### Live Preview (`src/components/preview/PreviewFrame.tsx`, `src/lib/transform/jsx-transformer.ts`)

When files change, `jsx-transformer.ts` uses Babel standalone to transpile JSX/TypeScript, builds an import map (local blobs for project files, `esm.sh` CDN for packages), and injects them into an iframe with `<script type="importmap">`. The preview auto-detects the entry point (e.g., `App.jsx`).

### State Management

Two primary contexts:
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`): Messages, streaming status, user input, and AI response handling.
- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`): Virtual FS state, selected file, and refresh triggers. Bridges AI tool call results to the file system.

### Authentication & Persistence (`src/lib/auth.ts`, `src/actions/`)

- JWT tokens stored in HTTP-only cookies (via `jose`), passwords hashed with `bcrypt`.
- Server actions in `src/actions/` handle sign-up, sign-in, sign-out, and project CRUD.
- Anonymous users can work without signing in; their work is carried over on sign-up.
- `src/middleware.ts` protects API routes.

### Database (Prisma + SQLite)

The database schema is defined in `prisma/schema.prisma`. Reference it every time you need to understand the structure of the data stored in the database. Two models:
- **`User`**: email + hashed password
- **`Project`**: stores serialized messages (JSON string) and virtual file system state (JSON string) alongside a `userId` (nullable — anonymous projects have no user)

### Path Alias

`@/*` maps to `./src/*` throughout the codebase.

## Code Style

- Use comments sparingly — only for complex or non-obvious logic.
