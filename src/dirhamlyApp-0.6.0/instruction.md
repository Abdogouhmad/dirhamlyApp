# instruction.md — Rewrite Dirhamly: Tauri → Slint

**Access grant:** you have full read, write, create, and delete permission
over this entire repository. Use it — delete obsolete files, don't just
leave them alongside new ones.

Read `AGENT.md` first for standing rules (permissions, domain logic to
preserve, design system, packaging requirements). This file is the concrete
execution plan.

---

## 0. Current state (for reference)

- Frontend: React + TS + Vite + Tailwind + shadcn-ui, in `src/`.
  - `src/pages/onboarding/main.tsx` — first-run profile setup.
  - `src/pages/dashboard/main.tsx` + `widgets/` (`dashheader`, `sumdata`,
    `table`, `tablecolumes`, `chart`, `piechart`, `deletedata`) — main
    screen: header, balance summary, transaction table, monthly bar
    chart, category pie chart, delete flow.
  - `src/pages/dashboard/service/dashservice.ts` — calls Tauri `invoke()`.
- Backend: `src-tauri/src/{lib,main,model,db,tauricmd}.rs` — Rust, SQLite
  via `rusqlite` (bundled), local file at app data dir `tx.db`.
- Packaging: `Justfile`, `packaging/aur/PKGBUILD` (downloads AppImage
  release asset, extracts, installs), `packaging/aur/.SRCINFO`,
  `packaging/aur/dirhamly.desktop`. No GitHub Actions workflow exists yet
  besides `.github/ISSUE_TEMPLATE`.

## 1. New project layout

```
dirhamly/
├── Cargo.toml              # single crate, was src-tauri/Cargo.toml
├── build.rs                # slint_build::compile(...)
├── ui/
│   ├── app.slint            # root window, navigation between screens
│   ├── theme.slint          # colors, spacing, fonts (from GEMINI.md)
│   ├── onboarding.slint      # first-run profile setup screen
│   └── dashboard/
│       ├── dashboard.slint
│       ├── header.slint
│       ├── summary.slint     # balance / income / expense cards
│       ├── table.slint       # transaction list
│       ├── monthly_chart.slint
│       └── category_pie.slint
├── src/
│   ├── main.rs
│   ├── model.rs              # unchanged
│   ├── db.rs                 # unchanged
│   └── commands.rs           # was tauricmd.rs — plain functions now
├── packaging/
│   ├── aur/{PKGBUILD,.SRCINFO,dirhamly.desktop}
│   └── scripts/{install.sh,uninstall.sh}
├── Justfile
└── .github/workflows/ci.yml, release.yml
```

Delete once the port is complete and verified building: `src/` (old
React tree), `index.html`, `vite.config.ts`, `tsconfig.json`,
`tsconfig.node.json`, `components.json`, `package.json`, `package-lock.json`,
`bun.lock`, `public/vite.svg`, `public/tauri.svg`, and the old
`src-tauri/` directory (after moving `model.rs`/`db.rs` up).

## 2. Domain layer — carry over unchanged

1. Move `src-tauri/src/model.rs` and `src-tauri/src/db.rs` to `src/model.rs`
   and `src/db.rs` with **no logic changes**. They have no Tauri
   dependency today — they should compile as-is.
2. Rename `tauricmd.rs` → `commands.rs`. Convert each `#[tauri::command]`
   function into a plain `pub fn` taking `&DiBase` (or whatever state
   handle you choose) instead of `State<'_, DiBase>`, dropping the
   `Result<T, String>` → keep it as-is or switch to `anyhow::Result<T>`,
   your call, but keep it consistent across all nine functions:
   `add_tx`, `get_all`, `get_by_month`, `get_balance`, `delete_tx`,
   `get_monthly_balance`, `get_profile`, `set_profile`, `convert_all_tx`.

## 3. Application shell

1. In `main.rs`, replicate what `lib.rs::run()` currently does at startup:
   resolve the app's local data directory (there's no Tauri `app_handle`
   anymore — use the `dirs` crate, e.g. `dirs::data_dir()`, joined with
   `"dirhamly"`), create it if missing, open `tx.db` via `DiBase::new`,
   call `.initialize()`.
2. Instantiate the root Slint `AppWindow` (generated from `ui/app.slint`),
   wrap the `DiBase` handle in an `Rc<RefCell<..>>` (Slint callbacks are
   `'static` closures on the same thread), and wire every Slint callback
   (`add-transaction`, `delete-transaction`, `load-transactions`,
   `get-balance`, `save-profile`, `load-profile`, `convert-all`, etc.) to
   the corresponding function in `commands.rs`.
3. First-run flow: if `get_profile()` returns `None`, show
   `onboarding.slint` first; once a profile is saved, switch to
   `dashboard.slint`. Use a `PageIndex` enum property on the root window
   to switch between them (a single window with conditional visibility,
   or Slint's `if`/component switching — either is fine).

## 4. UI screens — map old React widgets to new Slint components

| Old (React)                        | New (Slint)                         | Notes |
|---|---|---|
| `pages/onboarding/main.tsx`        | `ui/onboarding.slint`               | Name, currency, optional avatar image path → `set_profile`. |
| `pages/dashboard/widgets/dashheader.tsx` | `ui/dashboard/header.slint`     | App title, profile name/avatar, maybe currency switch. |
| `pages/dashboard/widgets/sumdata.tsx` | `ui/dashboard/summary.slint`      | Balance / income / expense cards, color-coded per `AGENT.md` §5. |
| `pages/dashboard/widgets/table.tsx` + `tablecolumes.tsx` | `ui/dashboard/table.slint` | Scrollable list of transactions; use a Slint `ListView` bound to a model built from `get_all`/`get_by_month`. |
| `pages/dashboard/widgets/chart.tsx` | `ui/dashboard/monthly_chart.slint`  | Bar chart of `get_monthly_balance`; draw with `Path`/`Rectangle` layout in Slint (no chart lib — keep it simple and native). |
| `pages/dashboard/widgets/piechart.tsx` | `ui/dashboard/category_pie.slint` | Category breakdown; same approach, draw arcs/segments manually or via `Path`. |
| `pages/dashboard/widgets/deletedata.tsx` | delete confirmation `PopupWindow` inside `table.slint` | Confirm → call `delete_tx`. |
| `pages/dashboard/service/dashservice.ts` | gone — direct Rust calls from `main.rs` | No IPC layer needed anymore. |

Add-transaction form: build as a `PopupWindow`/dialog in
`dashboard.slint` with fields for `tx_type` (Income/Expense toggle),
`amount`, `category` (dropdown filtered by `Category::is_valid_for`),
`description`, `date` (Slint has no built-in date picker — a simple
text field with `YYYY-MM-DD` validation, or a custom calendar component,
is fine).

## 5. Styling

Define one `theme.slint` global singleton with the palette and spacing
tokens described in `GEMINI.md`/`AGENT.md` §5 (dark background, soft
borders, income=green, expense=red/orange, savings=blue/cyan,
balance=purple, animation durations 150/220/300ms). Every other `.slint`
file imports and uses `Theme.*` — no magic colors hardcoded per component.

## 6. Justfile — rewrite recipes for the new stack

Replace the bun/tauri-cli recipes with cargo-native ones. Keep the same
recipe names where it makes sense so muscle memory transfers:

```just
default:
    @just --list

# ==================== Development ====================
dev:
    cargo run

run: dev

# ==================== Quality ====================
fmt:
    cargo fmt --all

fmt-check:
    cargo fmt --all -- --check

lint:
    cargo clippy --all-targets --all-features -- -D warnings

check: fmt-check lint
    cargo test

# ==================== Building ====================
build:
    cargo build --release

# ==================== Cleaning ====================
clean:
    cargo clean

clean-db-linux:
    rm -rf ~/.local/share/dirhamly
    @echo "Linux app data deleted."

reset: clean clean-db-linux run

# ==================== AUR ====================
aur-update:
    cd packaging/aur && makepkg --printsrcinfo > .SRCINFO

aur-test:
    cd packaging/aur && makepkg -si
```

Adjust the data dir path (`clean-db-linux`) to whatever
`dirs::data_dir()`-based path you actually use in `main.rs` — keep them
in sync.

## 7. PKGBUILD — build from source, drop webkit2gtk

The old `PKGBUILD` downloaded a Tauri-bundled AppImage. Slint has no
such bundler, so build from source instead:

```bash
pkgname=dirhamly
pkgver=0.5.0
pkgrel=1
pkgdesc="A modern, native, offline-first app for tracking expenses and income"
arch=('x86_64')
url="https://github.com/Abdogouhmad/dirhamlyApp"
license=('MIT')
depends=('gcc-libs' 'fontconfig' 'freetype2' 'libxkbcommon')  # verify with ldd on the release binary; add wayland/libxcb if the chosen winit backend needs them
makedepends=('cargo' 'rust')
source=("$pkgname-$pkgver.tar.gz::https://github.com/Abdogouhmad/dirhamlyApp/archive/refs/tags/$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
  cd "$pkgname-$pkgver" || cd "dirhamlyApp-$pkgver"
  cargo build --release --locked
}

package() {
  cd "$pkgname-$pkgver" || cd "dirhamlyApp-$pkgver"
  install -Dm755 "target/release/dirhamly" "$pkgdir/usr/bin/dirhamly"
  install -Dm644 "packaging/aur/dirhamly.desktop" \
    "$pkgdir/usr/share/applications/dirhamly.desktop"
  install -Dm644 "src-tauri/icons/128x128.png" \
    "$pkgdir/usr/share/pixmaps/dirhamly.png"  # move icon out of src-tauri when it's deleted
}
```

Run the exact `ldd target/release/dirhamly` yourself once the binary
builds, and finalize `depends=()` from real output rather than guessing —
the list above is a starting point, not gospel. Regenerate
`.SRCINFO` (`just aur-update`) every time `PKGBUILD` changes.

## 8. GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy
      - name: System deps for Slint (winit backend)
        run: |
          sudo apt-get update
          sudo apt-get install -y libfontconfig1-dev libfreetype6-dev \
            libxkbcommon-dev libx11-dev libxcb1-dev
      - run: cargo fmt --all -- --check
      - run: cargo clippy --all-targets --all-features -- -D warnings
      - run: cargo build --release
      - run: cargo test --all
```

Create `.github/workflows/release.yml` (triggered on tag push, e.g.
`v*`):

```yaml
name: Release & AUR
on:
  push:
    tags: ["v*"]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo build --release
      - name: Update AUR .SRCINFO
        run: |
          # bump pkgver in packaging/aur/PKGBUILD to match the tag first
          cd packaging/aur
          makepkg --printsrcinfo > .SRCINFO
      - name: Push to AUR
        uses: KSXGitHub/github-actions-deploy-aur@v3
        with:
          pkgname: dirhamly
          pkgbuild: packaging/aur/PKGBUILD
          commit_username: ${{ github.actor }}
          commit_email: ${{ github.actor }}@users.noreply.github.com
          ssh_private_key: ${{ secrets.AUR_SSH_PRIVATE_KEY }}
          commit_message: "release: sync to ${{ github.ref_name }}"
```

Add the deploy key: generate an SSH key pair, add the **public** key to
your AUR account (Account → My Account → SSH Public Key), store the
**private** key as the repo secret `AUR_SSH_PRIVATE_KEY`. Never commit
either key to the repo.

## 9. Definition of done

- [ ] `cargo fmt --all -- --check` passes.
- [ ] `cargo clippy --all-targets --all-features -- -D warnings` passes.
- [ ] `cargo build --release` produces a single native binary, no
      webview/webkit2gtk in `ldd` output.
- [ ] App launches straight into onboarding on a clean data dir, then
      into the dashboard on subsequent launches.
- [ ] All nine data operations (`add_tx` … `convert_all_tx`) work
      end-to-end from the Slint UI against the existing SQLite schema.
- [ ] `just aur-test` builds and installs the package locally without
      pulling in `webkit2gtk`.
- [ ] Old React/Tauri files are deleted, not just superseded.
- [ ] CI workflow is green on a pushed branch/PR.
