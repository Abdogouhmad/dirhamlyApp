# Justfile for Tauri project

default:
    @just --list

# Run in development mode (frontend + Rust hot reload)
dev:
    bun install
    cargo tauri dev

# Alias for dev
run: dev

# Build release bundle for Linux (AppImage / deb)
build-linux:
    cargo tauri build --release

# Cross-compile Windows x64 installer using cargo-xwin
build-windows:
    cargo tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc

# Alias for Windows build
win: build-windows

# Clean Rust build artifacts (target/)
clean:
    cargo clean
    @echo "Rust target cleaned."

# Remove all build artifacts + frontend dependencies
clean-all:
    rm -rf src-tauri/target
    rm -rf node_modules
    rm -rf dist
    @echo "Full project cleaned."

# Delete Linux app data (⚠️ removes database)
clean-db-linux:
    rm -rf ~/.local/share/com.dirhamly.app
    @echo "Linux app data deleted."

# Delete Windows app data (⚠️ removes database)
clean-db-windows:
    rm -rf ~/AppData/Roaming/com.dirhamly.app
    @echo "Windows app data deleted."

# Full reset (build + database)
reset: clean-all clean-db-linux
    @echo "Project and DB fully reset."

# Clean then rebuild for Linux
rebuild-linux: clean build-linux

# Clean then rebuild for Windows
rebuild-win: clean build-windows
