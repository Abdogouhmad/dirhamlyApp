# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1] — 2026-07-30

### Added
- Profile image upload via native file dialog (`rfd`)
- Settings dialog with avatar, name, currency picker, profile image upload
- Onboarding screen with profile image upload and currency ComboBox descriptions
- Global padding (`12px`) across the entire app via `VerticalLayout`
- "Reset All Data" button with confirmation in Settings
- `delete_all_data()` and `reset_all_data()` database/command functions
- 29 currency options with full descriptions in ComboBoxes
- `rusty-money` for locale-aware money formatting
- `rfd` integration for native file dialogs

### Changed
- **Full rewrite from Tauri (React/TS/Tailwind) → Slint (pure Rust, native GUI)**
- Replaced React frontend with native Slint components (no webview)
- Redesigned header with profile image / initials avatar toggle
- Replaced add-transaction category LineEdit with dual ComboBox (expense/income)
- Replaced date LineEdit with custom DatePickerPopup
- Redesigned `monthly_chart.slint`: thicker bars, rounded caps, grid lines
- Redesigned `category_pie.slint`: horizontal bars, color dots, spaced layout
- Current Balance card removed → 3 stat cards (Income, Expenses, Savings)
- Replaced X button centering hack with native Rectangle+Text+TouchArea approach

### Removed
- All React/TypeScript frontend files (`src/`, `index.html`, `vite.config.ts`, etc.)
- All Tauri scaffolding (`src-tauri/`)
- `webkit2gtk` dependency
- JavaScript build toolchain (Node, bun, npm)

### Fixed
- DatePickerPopup positioning — moved out of `if` conditional to component root
- Image border-radius — `clip: true` + `border-radius` on parent Rectangle

## [0.5.0] — 2026-07

### Added
- Slint-based native UI foundation
- Dashboard with transaction table, summary cards, charts
- Monthly bar chart and category breakdown pie chart
- Add/delete transaction with modal dialog
- Profile system (name, currency)
- SQLite-backed local storage via `rusqlite` (bundled)
- `build.rs` integration for `slint-build`
- CI workflow with clippy, formatting, build, and test

### Changed
- Migrated application shell from Tauri to pure Slint

## [0.3.5] — 2025

### Added
- AUR package (`packaging/aur/`) with `PKGBUILD` for Arch Linux
- Justfile with recipes for dev, build, clean, AUR update, and AUR test
- `install.sh` and `uninstall.sh` scripts
- Application icons (PNG, ICO, ICNS) in `packaging/icons/`

### Changed
- Improved color scheme and UI styling
- Updated database with `get_balance_by_month` function
- Implemented bar chart component

### Fixed
- Various bug fixes

## [0.3.0] — 2025

### Added
- Transaction filtering by month
- Monthly balance tracking
- Custom title bar component
- Sidebar with navigation

### Changed
- Major UI overhaul — improved overall design language
- Color system refined

## [0.2.0] — 2025

### Added
- Issue templates for bug reports and feature requests
- Clean-android recipe to Justfile

## [0.1.0] — 2025

### Added
- Initial Tauri + React + TypeScript project scaffold
- UI components: skeleton, tab bar, table, text, textarea, tooltip
- Basic expense/income tracking
- SQLite database schema
- Rust backend with `rusqlite`
