# ────────────────────────────────────────────
# Dirhamly — Build & Release Automation
# ────────────────────────────────────────────

project := "dirhamly"
version := `sed -n 's/^version = "\(.*\)"/\1/p' Cargo.toml | head -1`
arch := `uname -m`

default:
    @just --list --unsorted

# ── Dev ──────────────────────────────────────

# run in dev mode
dev:
    cargo run

# run in dev mode (alias)
run: dev

# ── Quality ──────────────────────────────────

# format code
fmt:
    cargo fmt --all

# check formatting
fmt-check:
    cargo fmt --all -- --check

# lint with clippy
lint:
    cargo clippy --all-targets --all-features -- -D warnings

# run all checks
check: fmt-check lint
    cargo test

# ── Clean ────────────────────────────────────

# clean build artifacts
clean:
    cargo clean

# clean local app data (Linux)
clean-db-linux:
    rm -rf ~/.local/share/dirhamly

# clean everything + rebuild
reset: clean clean-db-linux run

# ── Linux Binary ─────────────────────────────

# build release binary (Linux x86_64)
build:
    cargo build --release

# build & strip binary
build-stripped: build
    strip target/release/{{project}}

# install system-wide (Linux)
install: build-stripped
    sudo cp target/release/{{project}} /usr/local/bin/{{project}}
    sudo mkdir -p /usr/local/share/applications /usr/local/share/icons/hicolor/128x128/apps
    sudo cp packaging/aur/dirhamly.desktop /usr/local/share/applications/{{project}}.desktop
    sudo cp packaging/icons/128x128.png /usr/local/share/icons/hicolor/128x128/apps/{{project}}.png
    sudo update-desktop-database || true
    @echo "Installed /usr/local/bin/{{project}}"

# uninstall (Linux)
uninstall:
    sudo rm -f /usr/local/bin/{{project}}
    sudo rm -f /usr/local/share/applications/{{project}}.desktop
    @echo "Removed {{project}}"

# ── Linux AppImage ───────────────────────────

APPDIR := "target/{{project}}.{{version}}.AppDir"

# build AppImage (auto-downloads linuxdeploy + appimagetool)
appimage: _appimage-deps build-stripped _appimage-prepare _appimage-bundle _appimage-package

# check AppImage deps & download if missing
_appimage-deps:
    @mkdir -p target/tools
    @if ! [ -x target/tools/linuxdeploy ]; then \
        echo "Downloading linuxdeploy..."; \
        curl -sSfL \
            "https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-{{arch}}.AppImage" \
            -o target/tools/linuxdeploy; \
        chmod +x target/tools/linuxdeploy; \
    fi
    @if ! [ -x target/tools/appimagetool ]; then \
        echo "Downloading appimagetool..."; \
        curl -sSfL \
            "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-{{arch}}.AppImage" \
            -o target/tools/appimagetool; \
        chmod +x target/tools/appimagetool; \
    fi

# create AppDir structure
_appimage-prepare:
    rm -rf {{APPDIR}}
    mkdir -p {{APPDIR}}/usr/bin
    mkdir -p {{APPDIR}}/usr/share/applications
    mkdir -p {{APPDIR}}/usr/share/icons/hicolor/128x128/apps
    mkdir -p {{APPDIR}}/usr/share/icons/hicolor/32x32/apps
    cp target/release/{{project}} {{APPDIR}}/usr/bin/
    cp packaging/icons/128x128.png {{APPDIR}}/usr/share/icons/hicolor/128x128/apps/{{project}}.png
    cp packaging/icons/32x32.png {{APPDIR}}/usr/share/icons/hicolor/32x32/apps/{{project}}.png
    cp packaging/aur/dirhamly.desktop {{APPDIR}}/usr/share/applications/{{project}}.desktop
    cp packaging/aur/dirhamly.desktop {{APPDIR}}/{{project}}.desktop
    cp packaging/icons/icon.png {{APPDIR}}/.DirIcon

# bundle shared libraries (Arch path for libGL)
_appimage-bundle:
    ./target/tools/linuxdeploy \
        --appdir {{APPDIR}} \
        --output appimage \
        --desktop-file {{APPDIR}}/{{project}}.desktop \
        --icon-file {{APPDIR}}/.DirIcon \
        --library /usr/lib/libGL.so.1 2>/dev/null || \
    ./target/tools/linuxdeploy \
        --appdir {{APPDIR}} \
        --desktop-file {{APPDIR}}/{{project}}.desktop \
        --icon-file {{APPDIR}}/.DirIcon

# package into AppImage
_appimage-package:
    ARCH={{arch}} ./target/tools/appimagetool {{APPDIR}} \
        target/{{project}}-{{version}}-{{arch}}.AppImage
    @echo "AppImage: target/{{project}}-{{version}}-{{arch}}.AppImage"

# ── Arch Linux Package (PKGBUILD) ────────────

# build Arch Linux package via makepkg
pkg: build-stripped
    cd packaging/aur && makepkg -cf --noconfirm && mv *.pkg.tar.zst ../../target/
    @echo "Arch package: target/{{project}}-{{version}}-1-{{arch}}.pkg.tar.zst"

# install Arch Linux package locally
pkg-install: pkg
    sudo pacman -U --noconfirm target/{{project}}-*.pkg.tar.zst

# ── Windows Cross-Compile ────────────────────

# build Windows x86_64 binary (requires mingw-w64)
# Install: yay -S mingw-w64-toolchain
build-win: _win-deps
    rustup target add x86_64-pc-windows-gnu
    cargo build --release --target x86_64-pc-windows-gnu
    cp target/x86_64-pc-windows-gnu/release/{{project}}.exe \
       target/{{project}}-{{version}}-win64.exe

_win-deps:
    @which x86_64-w64-mingw32-gcc >/dev/null 2>&1 || { \
        echo "Install mingw-w64: yay -S mingw-w64-toolchain"; \
        exit 1; \
    }

# ── macOS Cross-Compile ──────────────────────
# Note: Full macOS builds require a macOS CI runner or osxcross toolchain.
# Install: yay -S osxcross

# build macOS x86_64 binary (requires osxcross)
build-mac: _mac-deps
    rustup target add x86_64-apple-darwin
    cargo build --release --target x86_64-apple-darwin
    cp target/x86_64-apple-darwin/release/{{project}} \
       target/{{project}}-{{version}}-mac-x86_64

# build macOS ARM64 binary (Apple Silicon, requires osxcross)
build-mac-arm64: _mac-deps
    rustup target add aarch64-apple-darwin
    cargo build --release --target aarch64-apple-darwin
    cp target/aarch64-apple-darwin/release/{{project}} \
       target/{{project}}-{{version}}-mac-aarch64

_mac-deps:
    @echo "=== macOS cross-compile ==="
    @echo "Requires osxcross: yay -S osxcross"
    @echo "Set CC=o64-clang and SDK path in your environment."
    @which o64-clang >/dev/null 2>&1 || { \
        echo "osxcross not found. Skipping macOS build."; \
        exit 1; \
    }

# ── All Builds ───────────────────────────────

# build all that works on this machine (Linux binary + AppImage + Arch package)
release: build appimage pkg

# build all known targets (requires all toolchains)
release-all: build appimage pkg build-win build-mac build-mac-arm64

# ── AUR ──────────────────────────────────────

# generate .SRCINFO for AUR
aur-update:
    cd packaging/aur && makepkg --printsrcinfo > .SRCINFO

# test AUR package build from source
aur-test:
    cd packaging/aur && makepkg -si

# ── Toolchain Setup (Arch Linux) ─────────────

# install slint system deps
setup-deps:
    sudo pacman -S --needed fontconfig freetype2 libxkbcommon libxcb

# install cross-compilation toolchains
setup-cross:
    yay -S --needed mingw-w64-toolchain osxcross

# ── Help ─────────────────────────────────────

# list all available targets with descriptions
help:
    @just --list --unsorted
