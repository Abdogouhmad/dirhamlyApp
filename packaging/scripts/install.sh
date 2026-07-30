#!/usr/bin/env bash
# packaging/scripts/install.sh
set -e

APP_NAME="dirhamly"
VERSION="0.5.0"
BINARY_URL="https://github.com/Abdogouhmad/dirhamlyApp/releases/download/v$VERSION/${APP_NAME}"
BIN_PATH="/usr/local/bin/$APP_NAME"
DESKTOP_PATH="$HOME/.local/share/applications/$APP_NAME.desktop"

echo "Installing $APP_NAME v$VERSION..."

# Build locally or download release binary
if [ -f "target/release/dirhamly" ]; then
    echo "Using local release binary..."
    sudo cp "target/release/dirhamly" "$BIN_PATH"
else
    echo "Downloading release binary from GitHub..."
    curl -L "$BINARY_URL" -o "/tmp/$APP_NAME"
    chmod +x "/tmp/$APP_NAME"
    sudo mv "/tmp/$APP_NAME" "$BIN_PATH"
fi

echo "  ✓ Installed to $BIN_PATH"

# Desktop entry
mkdir -p "$HOME/.local/share/applications"
cat > "$DESKTOP_PATH" <<EOF
[Desktop Entry]
Name=Dirhamly
Exec=$BIN_PATH
Icon=dirhamly
Type=Application
Categories=Finance;Utility;
Comment=Track expenses and income easily
Terminal=false
StartupWMClass=dirhamly
EOF
echo "  ✓ Created desktop entry"

echo "Done! Run: $APP_NAME"
