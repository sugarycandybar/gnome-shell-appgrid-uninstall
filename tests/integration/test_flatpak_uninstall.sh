#!/usr/bin/env bash
set -euo pipefail

if [[ "${APPGRID_UNINSTALL_DESTRUCTIVE_TESTS:-0}" != "1" ]]; then
  echo "[SKIP] Set APPGRID_UNINSTALL_DESTRUCTIVE_TESTS=1 to run destructive Flatpak integration tests"
  exit 77
fi

if ! command -v flatpak >/dev/null 2>&1; then
  echo "[SKIP] flatpak command unavailable"
  exit 77
fi

APP_ID="org.gnome.clocks"
REF_URL="https://flathub.org/repo/appstream/${APP_ID}.flatpakref"

echo "[TEST] Installing test Flatpak ${APP_ID}..."
flatpak install --user --noninteractive "$REF_URL"

echo "[TEST] Verifying install..."
if ! flatpak list --app --columns=application | grep -qx "$APP_ID"; then
  echo "[FAIL] ${APP_ID} did not install"
  exit 1
fi

echo "[TEST] Uninstalling test Flatpak ${APP_ID}..."
flatpak uninstall --user --noninteractive "$APP_ID"

echo "[TEST] Verifying test app removal state..."
if flatpak list --app --columns=application | grep -qx "$APP_ID"; then
  echo "[FAIL] ${APP_ID} is still installed"
  exit 1
fi

echo "[PASS] ${APP_ID} install/remove flow validated"
