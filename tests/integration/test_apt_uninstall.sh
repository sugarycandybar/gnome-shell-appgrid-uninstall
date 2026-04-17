#!/usr/bin/env bash
set -euo pipefail

if [[ "${APPGRID_UNINSTALL_DESTRUCTIVE_TESTS:-0}" != "1" ]]; then
  echo "[SKIP] Set APPGRID_UNINSTALL_DESTRUCTIVE_TESTS=1 to run destructive APT integration tests"
  exit 77
fi

if ! command -v apt-get >/dev/null 2>&1; then
  echo "[SKIP] apt-get unavailable"
  exit 77
fi

if ! command -v sudo >/dev/null 2>&1 || ! sudo -n true >/dev/null 2>&1; then
  echo "[SKIP] passwordless sudo required for APT integration test"
  exit 77
fi

TEST_PACKAGE="sl"

echo "[TEST] Updating apt metadata..."
sudo apt-get update

echo "[TEST] Installing ${TEST_PACKAGE}..."
sudo apt-get install -y "$TEST_PACKAGE"

echo "[TEST] Verifying install..."
if ! dpkg -s "$TEST_PACKAGE" >/dev/null 2>&1; then
  echo "[FAIL] ${TEST_PACKAGE} did not install"
  exit 1
fi

echo "[TEST] Removing ${TEST_PACKAGE}..."
sudo apt-get remove -y "$TEST_PACKAGE"

echo "[TEST] Verifying removal..."
if dpkg -s "$TEST_PACKAGE" >/dev/null 2>&1; then
  echo "[FAIL] ${TEST_PACKAGE} is still installed"
  exit 1
fi

echo "[PASS] APT install/remove flow validated"
