#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

run_test() {
	local script="$1"

	set +e
	bash "$script"
	local code=$?
	set -e

	if [[ $code -eq 0 ]]; then
		return 0
	fi

	if [[ $code -eq 77 ]]; then
		echo "[SKIP] $(basename "$script")"
		return 0
	fi

	echo "[FAIL] $(basename "$script") exited with code $code"
	return "$code"
}

run_test "$SCRIPT_DIR/test_flatpak_uninstall.sh"
run_test "$SCRIPT_DIR/test_snap_uninstall.sh"
run_test "$SCRIPT_DIR/test_apt_uninstall.sh"

echo "[DONE] Integration suite finished"
