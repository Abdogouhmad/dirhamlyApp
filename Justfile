# Justfile for Dirhamly (Tauri v2)
version := `jq -r .version src-tauri/tauri.conf.json`
app := "dirhamly"
build_dir := "src-tauri/target/release/bundle/appimage"


default:
    @just --list

# ==================== Development ====================

# Run in development mode (frontend + Rust hot reload)
dev:
    bun install
    cargo tauri dev

# Alias for dev
run: dev

# ==================== Building ====================

# Build release for Linux (AppImage / deb)
build:
    cargo tauri build
    just rename
# Build release for Windows using cross-compilation (from Linux/macOS)
build-windows:
    cargo tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc -- --release

# Alias for Windows build
win: build-windows

# Build both Linux and Windows release
build-all: build build-windows

# ==================== Cleaning ====================

# Clean Rust build artifacts
clean:
    cargo clean
    @echo "Rust target directory cleaned."

# Full clean: Rust + frontend + node_modules
clean-all:
    rm -rf src-tauri/target
    rm -rf node_modules
    rm -rf dist
    @echo "Full project cleaned (Rust + frontend)."

# Clean Linux app data (⚠️ This removes your local database!)
clean-db-linux:
    rm -rf ~/.local/share/com.dirhamly.app
    @echo "Linux app data deleted."

# Clean Windows app data (⚠️ This removes your local database!)
clean-db-windows:
    rm -rf ~/AppData/Roaming/com.dirhamly.app
    @echo "Windows app data deleted."

# ==================== Utilities ====================

# Clean then rebuild Linux
rebuild-linux: clean build

# Clean then rebuild Windows
rebuild-win: clean build-windows

# Full reset: clean everything + run dev (use with caution)
reset: clean-all clean-db-linux run
    @echo "Project fully reset and running in dev mode."

# rename the app
rename:
    mv {{build_dir}}/{{app}}-x86_64.AppImage \
       {{build_dir}}/{{app}}_{{version}}_amd64.AppImage

# ====================== AUR TEST =========================

# Generate .SRCINFO for AUR (run after editing PKGBUILD)
aur-update:
    cd packaging/aur && makepkg --printsrcinfo > .SRCINFO

# Test the PKGBUILD locally before publishing
aur-test:
    cd packaging/aur && makepkg -si
