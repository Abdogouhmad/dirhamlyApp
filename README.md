<picture>
  <source media="(prefers-color-scheme: dark)" srcset="packaging/icons/icon.png">
  <img alt="Dirhamly" src="packaging/icons/icon.png" width="64" height="64">
</picture>

# Dirhamly — Finance OS

**A modern, native, offline-first desktop application for tracking expenses and income.**

Built with [Slint](https://slint.dev) and Rust — no webview, no JavaScript, no cloud.  
One binary, zero dependencies beyond the OS.

---

## Features

- **Dashboard** — Overview of your finances at a glance: total income, expenses, net savings
- **Transaction Management** — Add, categorize, and delete transactions with ease
- **Monthly Bar Chart** — Visual comparison of income vs. expense across the year
- **Category Breakdown** — See where your money goes with proportional category bars
- **Transaction Table** — Scrollable, filterable list with type badges and color-coded amounts
- **Month Filtering** — Filter transactions by any month via an interactive date picker
- **29 Currencies** — Full ISO currency support with locale-aware formatting via `rusty-money`
- **Profile & Avatar** — Custom name, profile picture upload, and currency preference
- **Dark Theme** — Premium dark design inspired by Linear, Raycast, and modern fintech
- **Onboarding** — First-run setup wizard for profile and currency selection
- **Settings** — Full profile management with image upload and data reset
- **Offline-First** — All data stored locally in SQLite; no network required
- **Portable** — Single binary, easy to distribute as AppImage, Arch package, or standalone executable

---

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (edition 2021)
- System libraries for Slint:
  - **Arch:** `sudo pacman -S fontconfig freetype2 libxkbcommon libxcb`
  - **Debian/Ubuntu:** `sudo apt install libfontconfig1-dev libfreetype6-dev libxkbcommon-dev libx11-dev libxcb1-dev`
  - **Fedora:** `sudo dnf install fontconfig-devel freetype-devel libxkbcommon-devel libxcb-devel`

### Run

```sh
just dev
```

Or without `just`:

```sh
cargo run
```

---

## Building

| Target | Command | Output |
|--------|---------|--------|
| Linux binary | `just build` | `target/release/dirhamly` |
| Stripped binary | `just build-stripped` | Stripped ELF |
| AppImage | `just appimage` | `target/dirhamly-*-x86_64.AppImage` |
| Arch package | `just pkg` | `target/dirhamly-*-x86_64.pkg.tar.zst` |
| Windows (cross) | `just build-win` | `target/dirhamly-*-win64.exe` |
| macOS (cross) | `just build-mac` | macOS x86_64 binary |
| macOS ARM (cross) | `just build-mac-arm64` | macOS ARM64 binary |

> **Note:** Cross-compilation targets require additional toolchains.  
> See `just setup-cross` for Arch or refer to the toolchain documentation for your distribution.

### Install System-Wide

```sh
just install
```

---

## Project Structure

```
dirhamly/
├── build.rs                 # Slint compiler integration
├── Cargo.toml               # Rust dependencies
├── Justfile                 # Task automation
├── PKGBUILD                 # Standalone Arch Linux package definition
├── dirhamly.desktop         # Desktop entry for launchers
├── assets/
│   └── icons/               # In-app SVG icons (calendar, close, delete)
├── ui/
│   ├── app.slint            # Root window, page routing
│   ├── theme.slint          # Design tokens (colors, spacing, radii)
│   ├── onboarding.slint     # First-run setup
│   ├── settings.slint       # Profile settings dialog
│   ├── components/
│   │   ├── button.slint     # Shared DirhamlyButton component
│   │   ├── charts/          # Reusable chart primitives (axis, bars, patterns)
│   │   └── table/           # Reusable table pieces (header, row, cards)
│   └── dashboard/
│       ├── dashboard.slint  # Main screen layout
│       ├── header.slint     # Greeting, avatar, add button
│       ├── summary.slint    # Income / Expense / Savings cards
│       ├── table.slint      # Transaction list with filters
│       ├── monthly_chart.slint  # Income vs expense bar chart
│       └── category_pie.slint   # Category breakdown bars
├── src/
│   ├── main.rs              # Application entry point & Slint callbacks
│   ├── model.rs             # Domain types (TxType, Category, Profile)
│   ├── db.rs                # SQLite operations
│   ├── commands.rs          # Business logic functions
│   ├── handlers.rs          # Slint callback handlers
│   ├── state.rs             # Shared application state
│   └── money.rs             # Currency formatting (rusty-money)
└── packaging/
    ├── aur/                 # Arch Linux PKGBUILD for the AUR
    ├── icons/               # Application icons (PNG, ICO, ICNS)
    ├── scripts/             # Install/uninstall helpers
    └── windows/             # NSIS Windows installer script
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI** | [Slint](https://slint.dev) 1.14 — native Rust GUI framework |
| **Backend** | Rust with `rusqlite` (bundled SQLite) |
| **Financial** | `rust_decimal` for precision arithmetic, `rusty-money` for formatting |
| **Dates** | `chrono` |
| **File Dialogs** | `rfd` (native file picker) |
| **Rendering** | `winit` + `femtovg` (OpenGL) |
| **Packaging** | `just` task runner, `linuxdeploy` for AppImage, `makepkg` for Arch |

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full history of releases.

---

## License

MIT
