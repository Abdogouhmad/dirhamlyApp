# Justfile for Tauri project
# Place this file in project root
# Requires: just[](https://github.com/casey/just), cargo-xwin, nsis, clang/lld/llvm (for linking)

# set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]
# set dotenv-load    := true

# Default recipe (run with just → shows help)
default:
    @just --list

# ─── Dev / Run on Linux ──────────────────────────────────────────────────────────

# Run in dev mode (watches frontend + rust)
dev:
    bun install
    cargo tauri dev

# Alias for dev
run: dev

# ─── Build for current platform (Linux) ──────────────────────────────────────────

# Build release binary + bundle for Linux (AppImage / deb etc.)
build-linux:
    cargo tauri build --release

# ─── Cross-compile for Windows (from Linux) ──────────────────────────────────────

# Build Windows x64 installer (.exe via NSIS)
# First run is slow (~1-2 GB download of MSVC/SDK → cached afterward)
build-windows:
    cargo tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc

# Alias
win: build-windows


# Clean target dir (useful before cross builds if weird errors appear)
clean:
    cargo clean
# Clean only android target (useful if only Android build is broken, doesn't touch frontend dist etc.)
clean-android:
    rm -rf src-tauri/target
# Very clean (also removes frontend dist, node_modules etc.)
clean-all:
    rm -rf src-tauri/target
    rm -rf node_modules
    rm -rf dist
    @echo "All clean. Run 'npm install' or 'bun install' again if needed."
