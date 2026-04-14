#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bash "$SCRIPT_DIR/test_flatpak_uninstall.sh"
bash "$SCRIPT_DIR/test_snap_uninstall.sh"
bash "$SCRIPT_DIR/test_apt_uninstall.sh"

echo "[DONE] Integration suite finished"
