#!/usr/bin/env bash
# packaging/scripts/install.sh
set -e

APP_NAME="dirhamly"
VERSION="0.3.5"
APPIMAGE_URL="https://github.com/Abdogouhmad/dirhamlyApp/releases/download/v$VERSION/${APP_NAME}_${VERSION}_amd64.AppImage"
BIN_PATH="/usr/local/bin/$APP_NAME"
DESKTOP_PATH="$HOME/.local/share/applications/$APP_NAME.desktop"

echo "Installing $APP_NAME v$VERSION..."

# Download AppImage
curl -L "$APPIMAGE_URL" -o "/tmp/$APP_NAME.AppImage"
chmod +x "/tmp/$APP_NAME.AppImage"

# Install binary
sudo mv "/tmp/$APP_NAME.AppImage" "$BIN_PATH"
echo "  ✓ Installed to $BIN_PATH"

# Desktop entry
mkdir -p "$HOME/.local/share/applications"
cat > "$DESKTOP_PATH" <<EOF
[Desktop Entry]
Name=Dirhamly
Exec=$BIN_PATH
Icon=dirhamly
Type=Application
Categories=Finance;
EOF
echo "  ✓ Created desktop entry"

echo "Done! Run: $APP_NAME"
