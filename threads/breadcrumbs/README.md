# Breadcrumbs (MVP Scaffold)

Breadcrumbs is a **local-first**, keyboard-first desktop continuity layer that helps a founder resume interrupted work across Slack, browser tabs, notes, files, Finder, and terminal contexts.

## What this MVP includes

- Passive local activity capture scaffold (`MockActivityCaptureAdapter`) with timestamped events.
- Global quick checkpoint flow (`Ctrl/Cmd+Shift+K`) with <5-second prompt shape.
- Thread-centric local CRUD for threads, checkpoints, events, and artifacts.
- Thread suggestion pipeline through a provider abstraction (`LlmProvider`) using a local stub implementation.
- Re-entry packet builder for instant context recovery.
- Home screen focused on interruption recovery (continue card, risk warnings, no kanban).
- Daily digest generation and resume score heuristic.
- Realistic seed data for founder workflows.

## Architecture

- **Desktop shell**: Tauri scaffold (`src-tauri`)
- **Frontend**: React + TypeScript
- **Local storage**: IndexedDB via `idb` (swappable with SQLite plugin later)
- **LLM interface**: Provider abstraction with a local stub for offline behavior

## Run

```bash
npm install
npm run dev
```

Then wrap with Tauri when desired.

## Next implementation steps

1. Replace mock activity adapter with OS-level ingestion service (front app/window, browser tab URL, file path).
2. Switch local persistence to SQLite (Tauri plugin/sqlx/rusqlite).
3. Add one-click reopen actions via shell APIs for URLs and local files.
4. Add unresolved blocker workflows and richer resume scoring features.
