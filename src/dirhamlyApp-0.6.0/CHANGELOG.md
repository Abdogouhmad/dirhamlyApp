# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] — 2026-07-31

### Added
- Shared `DirhamlyButton` component for close, delete, and other actions across the app
- New `Theme` color variables: `primary`, `on-primary`, `success`, `warning`, `danger`
- Slint-based native UI foundation with a dashboard (transaction table, summary cards, charts)
- Monthly bar chart and category breakdown pie chart
- Add/delete transaction with modal dialog
- Profile system (name, currency) with SQLite-backed local storage via `rusqlite` (bundled)
- Profile image upload via native file dialog (`rfd`)
- Settings dialog with avatar, name, currency picker, and profile image upload
- Onboarding screen with profile image upload and currency ComboBox descriptions
- Global padding (`12px`) across the entire app
- "Reset All Data" button with confirmation in Settings
- `delete_all_data()` and `reset_all_data()` database/command functions
- 29 currency options with full descriptions in ComboBoxes
- `rusty-money` for locale-aware money formatting
- Transaction filtering by month and monthly balance tracking
- AUR package (`packaging/aur/`) with `PKGBUILD` for Arch Linux
- Justfile with recipes for dev, build, clean, AUR update, AUR test, and Windows installer
- `install.sh` and `uninstall.sh` scripts
- Application icons (PNG, ICO, ICNS) in `packaging/icons/`
- Issue templates for bug reports and feature requests
- `build.rs` integration for `slint-build`
- CI workflow with clippy, formatting, build, and test

### Changed
- **Full rewrite from Tauri (React/TS/Tailwind) → Slint (pure Rust, native GUI)**
- Replaced React frontend with native Slint components (no webview)
- Redesigned header with profile image / initials avatar toggle
- Replaced add-transaction category LineEdit with dual ComboBox (expense/income)
- Replaced date LineEdit with custom DatePickerPopup
- Redesigned `monthly_chart.slint`: thicker bars, rounded caps, grid lines
- Redesigned `category_pie.slint`: horizontal bars, color dots, spaced layout
- Current Balance card replaced by 3 stat cards (Income, Expenses, Savings)
- Replaced X button centering hack with native Rectangle+Text+TouchArea approach
- Improved color scheme and UI styling
- Implemented bar chart component

### Removed
- All React/TypeScript frontend files (`src/`, `index.html`, `vite.config.ts`, etc.)
- All Tauri scaffolding (`src-tauri/`)
- `webkit2gtk` dependency
- JavaScript build toolchain (Node, bun, npm)

### Fixed
- DatePickerPopup positioning — moved out of `if` conditional to component root
- Image border-radius — `clip: true` + `border-radius` on parent Rectangle
- `build-win-installer` Justfile task now supports portable `.exe` and setup `.exe`
- Packaging: standalone script to define app info for the Windows installer
- Various bug fixes
