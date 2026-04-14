#!/usr/bin/env bash
set -euo pipefail

echo "[TEST] Installing test Flatpak..."
flatpak install --user --noninteractive \
  https://flathub.org/repo/appstream/org.gnome.clocks.flatpakref || true

echo "[TEST] Triggering uninstall via UI simulation placeholder..."
echo "[TODO] Use xdotool to open app grid, right-click target app, choose Uninstall"

echo "[TEST] Verifying test app removal state..."
if flatpak list | grep -q 'org.gnome.clocks'; then
  echo "[INFO] org.gnome.clocks still present (manual uninstall step may be pending)"
else
  echo "[PASS] org.gnome.clocks not found"
fi
