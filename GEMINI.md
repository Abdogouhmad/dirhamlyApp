# Dirhamly - Project Instructions

## Tech Stack
- **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS v4, shadcn/ui.
- **Backend:** Rust, Tauri v2, SQLite (via `rusqlite`).
- **Icons:** `lucide-react`.
- **State Management:** React Hooks, local state, and context providers (e.g., `RefreshContext`).
- **Routing:** React Router v7.
- **Charts:** `recharts`.
- **Toasts:** `sonner`.

## Architecture & Conventions

### Frontend
- **Path Aliases:** Always use `@/` aliases as defined in `tsconfig.json` and `components.json`.
  - `@/components`: Shared UI components.
  - `@/lib`: Utility functions and shared logic.
  - `@/hooks`: Custom React hooks.
  - `@/pages`: Page components.
- **Components:**
  - Standard UI components are in `src/components/ui`.
  - Use the `cn` utility from `@/lib/utils` for conditional class merging.
  - Page-specific logic and services should be placed in a `service` folder within the page directory (e.g., `src/pages/dashboard/service`).
- **Data Fetching:**
  - Use `@tauri-apps/api/core`'s `invoke` to call Rust commands.
  - Wrap backend calls in service functions within `src/pages/.../service`.

### Backend (Rust)
- **Module Structure:**
  - `src-tauri/src/lib.rs`: Main entry point, setup, and command registration.
  - `src-tauri/src/tauricmd.rs`: Implementation of Tauri commands.
  - `src-tauri/src/db.rs`: Database connection and initialization logic.
  - `src-tauri/src/model.rs`: Data models and types.
- **Command Registration:** When adding a new command, it MUST be registered in `src-tauri/src/lib.rs` within the `tauri::generate_handler![]` macro.
- **Error Handling:** Use `anyhow::Result` for flexible error handling in backend logic.
- **Currency:** Use `rust_decimal` and `rust_decimal_macros` for handling financial values to avoid floating-point errors.

### Styling
- **Tailwind v4:** Use Tailwind CSS v4 features.
- **Colors:** Adhere to the defined color palette (e.g., `cobalt`, `rust`, etc., as seen in the codebase).

## Workflows
- **New Feature:**
  1. Define the data model in `src-tauri/src/model.rs`.
  2. Implement DB logic in `src-tauri/src/db.rs`.
  3. Create Tauri commands in `src-tauri/src/tauricmd.rs`.
  4. Register commands in `src-tauri/src/lib.rs`.
  5. Create a frontend service in `src/pages/.../service`.
  6. Implement the UI using shadcn components and Tailwind.
- **Testing:** Ensure commands are tested or at least manually verified via the UI.
