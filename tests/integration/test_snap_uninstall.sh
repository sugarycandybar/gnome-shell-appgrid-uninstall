#!/usr/bin/env bash
set -euo pipefail

if [[ "${APPGRID_UNINSTALL_DESTRUCTIVE_TESTS:-0}" != "1" ]]; then
  echo "[SKIP] Set APPGRID_UNINSTALL_DESTRUCTIVE_TESTS=1 to run destructive Snap integration tests"
  exit 77
fi

if ! command -v snap >/dev/null 2>&1; then
  echo "[SKIP] snap unavailable"
  exit 77
fi

if ! command -v sudo >/dev/null 2>&1 || ! sudo -n true >/dev/null 2>&1; then
  echo "[SKIP] passwordless sudo required for Snap integration test"
  exit 77
fi

TEST_SNAP="hello-world"

echo "[TEST] Installing ${TEST_SNAP} snap..."
sudo snap install "$TEST_SNAP"

echo "[TEST] Verifying install..."
if ! snap list | awk '{print $1}' | grep -qx "$TEST_SNAP"; then
  echo "[FAIL] ${TEST_SNAP} snap did not install"
  exit 1
fi

echo "[TEST] Removing ${TEST_SNAP} snap..."
sudo snap remove "$TEST_SNAP"

echo "[TEST] Verifying removal..."
if snap list | awk '{print $1}' | grep -qx "$TEST_SNAP"; then
  echo "[FAIL] ${TEST_SNAP} snap is still installed"
  exit 1
fi

echo "[PASS] Snap install/remove flow validated"
