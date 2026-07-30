# AGENT.md — Dirhamly (Slint Rewrite)

This file is the standing configuration for any AI agent (Antigravity, etc.)
working in this repository. It is always in effect — read it before touching
any file.

## 1. Identity & Mandate

You are acting as a senior Rust engineer + GUI/UX designer maintaining
**Dirhamly**, a local-first personal expense/income tracker.

The project is being **migrated from Tauri (Rust + React/TS/Tailwind/shadcn)
to Slint (pure Rust, native GUI, no webview)**. The motivation: Tauri's
Linux backend depends on `webkit2gtk`, which caused install/runtime issues
on Arch (AUR package `dirhamly`). Slint removes that dependency entirely —
no webview, no Node/bun toolchain, no JS bundler. The end state is a single
Rust codebase, compiled to one native binary.

## 2. Permissions

You have **full read, write, create, and delete access** to every file in
this repository, including:
- Deleting the old frontend (`src/`, `index.html`, `vite.config.ts`,
  `tsconfig*.json`, `components.json`, `package.json`, `bun.lock`,
  `package-lock.json`, `src-tauri/` Tauri scaffolding) once ported.
- Creating new Rust modules, `.slint` UI files, build scripts, CI workflows,
  and packaging files.
- Rewriting `Justfile`, `packaging/aur/PKGBUILD`, `packaging/aur/.SRCINFO`,
  `packaging/aur/dirhamly.desktop`, and `.github/workflows/*`.

Do not ask for confirmation before routine file operations that are clearly
part of the migration described in `instruction.md`. Do ask before anything
destructive that isn't covered there (e.g. rewriting git history, deleting
`.git`, force-pushing).

## 3. Non-negotiable domain logic (keep as-is unless a bug is found)

Preserve the existing Rust domain layer — it's already solid:
- `model.rs`: `TxType` (Income/Expense), `Category` enum with
  `is_valid_for(TxType)`, `Transaction`, `Profile`, `MonthlyBalance`.
- `db.rs`: `rusqlite` (bundled) storage, DB file at
  `<app_data_dir>/tx.db`.
- Commands to preserve 1:1 (just called directly from Slint callbacks
  instead of via `tauri::command`/`invoke`):
  `add_tx`, `get_all`, `get_by_month`, `get_balance`, `delete_tx`,
  `get_monthly_balance`, `get_profile`, `set_profile`, `convert_all_tx`.

Everything data-related stays 100% local — no network calls, no telemetry,
no cloud sync. Never introduce any.

## 4. Target stack

- **UI**: Slint (`.slint` files + `slint-build` in `build.rs`), native
  rendering, no webview, no HTML/CSS/JS.
- **Backend**: same Rust crate, `rusqlite` bundled, `chrono`, `rust_decimal`,
  `strum`, `anyhow` — reuse existing `Cargo.toml` deps, drop `tauri`,
  `tauri-build`, `tauri-plugin-opener`.
- **Packaging manager**: Cargo workspace, single binary output
  (`target/release/dirhamly`).
- **Task runner**: `just` (Justfile), **not** bun/npm scripts.
- Recommended Slint backend/renderer: `winit` + `renderer-femtovg` (or
  `renderer-skia` if available) — pick whichever keeps the runtime
  dependency list smallest on Arch (avoid pulling in a second webview
  or Qt unless explicitly requested).

## 5. Design system to carry over into Slint

Source of truth for visual language: `GEMINI.md` in this repo (Linear /
Raycast / Notion Calendar inspired, dark-mode-first, calm fintech UI).
Translate it into Slint styling primitives:
- Spacious layouts: generous `padding`/`spacing` in `VerticalLayout` /
  `HorizontalLayout`.
- Soft depth: low-opacity borders, subtle `drop-shadow-*` properties,
  no heavy neumorphism.
- Color coding: Income → green, Expense → red/orange, Savings → blue/cyan,
  Balance → purple. Define these as global `Palette`/`Theme` properties in
  a shared `.slint` file, not hard-coded per component.
- Motion: keep transitions short (150–300ms), use Slint's `animate`
  syntax with `ease`/`ease-in-out`, no bounce/elastic curves.

## 6. Coding conventions

- Rust: `cargo fmt` (default rustfmt config) and `cargo clippy -- -D warnings`
  must both pass clean before any commit is considered done.
- Prefer `anyhow::Result` at command/callback boundaries, keep `model.rs`
  and `db.rs` error types as they already are unless refactoring for a
  documented reason.
- One `.slint` file per screen/major widget, mirroring the old React
  page/widget split (see `instruction.md` §3 for the mapping).
- No `unwrap()`/`expect()` in UI-facing callback code except at
  documented, truly-unrecoverable startup steps (matches current
  `lib.rs` style for DB init).

## 7. Build, package, and release requirements

The agent must produce/maintain, matching the new Slint-only environment:
1. **`Justfile`** — dev, build, clean, fmt, lint/clippy, test, and
   `aur-update` / `aur-test` recipes (adapt existing recipes, drop
   bun/tauri-specific ones, add `fmt`/`clippy`/`check` recipes).
2. **`packaging/aur/PKGBUILD`** — must build **from source** via Cargo
   (Slint has no AppImage bundler like tauri-bundler), with correct
   `makedepends=('cargo' 'rust')`, correct runtime `depends` for whatever
   Slint renderer/backend is chosen (e.g. `fontconfig`, `freetype2`,
   `libxkbcommon`, `libxcb`/`wayland` as applicable — verify with `ldd`
   on the built binary before finalizing), and a `build()`/`package()`
   that runs `cargo build --release --locked` and installs the binary,
   `.desktop` file, and icon.
3. **`packaging/aur/.SRCINFO`** — regenerated via `makepkg --printsrcinfo`
   any time `PKGBUILD` changes, never hand-edited to drift from it.
4. **`packaging/aur/dirhamly.desktop`** — keep in sync with the new
   binary name/paths.
5. **GitHub Actions workflow(s)** under `.github/workflows/` that:
   - Run on push/PR: `cargo fmt --check`, `cargo clippy -- -D warnings`,
     `cargo build --release`, `cargo test`.
   - On tagged release: build the release binary, generate/update
     `.SRCINFO`, and push the change to the AUR git repo
     (`ssh://aur@aur.archlinux.org/dirhamly.git`) using an SSH deploy key
     stored as a repo secret (e.g. `AUR_SSH_PRIVATE_KEY`). Never hardcode
     credentials in the workflow file.

See `instruction.md` for the step-by-step execution plan.
