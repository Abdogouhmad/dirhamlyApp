#!/usr/bin/env bash
# packaging/scripts/uninstall.sh
set -e

APP_NAME="dirhamly"
DATA_DIR="$HOME/.local/share/com.dirhamly.app"
BIN_PATH="/usr/local/bin/$APP_NAME"
DESKTOP_PATH="$HOME/.local/share/applications/$APP_NAME.desktop"

echo "Uninstalling $APP_NAME..."

# Remove binary
if [ -f "$BIN_PATH" ]; then
    sudo rm -f "$BIN_PATH"
    echo "  ✓ Removed binary"
fi

# Remove desktop entry
if [ -f "$DESKTOP_PATH" ]; then
    rm -f "$DESKTOP_PATH"
    echo "  ✓ Removed desktop entry"
fi

# Remove app data
if [ -d "$DATA_DIR" ]; then
    read -rp "  Remove all app data at $DATA_DIR? [y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        rm -rf "$DATA_DIR"
        echo "  ✓ Removed app data"
    else
        echo "  – Skipped data removal"
    fi
fi

echo "Done. $APP_NAME has been uninstalled."
