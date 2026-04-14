# App Grid Uninstall

Right-click any app in the GNOME App Grid and uninstall it directly.

`App Grid Uninstall` is a GNOME Shell extension that adds an **Uninstall** action to app icon context menus in Activities -> App Grid.

## Features

- App-grid context menu injection with clean enable/disable lifecycle
- Package-type detection for:
  - Flatpak
  - Snap
  - APT/dpkg
  - RPM/DNF
- Interactive uninstall confirmation dialog
- Protected system-app guardrails (prevents destructive removals of critical apps)
- Progress/success/error notifications via GNOME Message Tray
- Polkit-based privileged uninstall path (`pkexec`) for system package managers
- Preferences panel in GNOME Extensions settings (behavior + package-type toggles)
- Release packaging for:
  - extensions.gnome.org ZIP
  - Debian (`packaging/debian`)
  - RPM (`packaging/rpm`)

## Compatibility

- Ubuntu 22.04 LTS / 24.04 LTS
- GNOME Shell 42-49 (best effort beyond the original target matrix)

## Project Status

Current implementation includes Phases 1-9 from the project plan in `CLAUDE.md`.

- Implemented: core extension, context menu patching, uninstall backend, dialogs, notifications, Polkit policy assets, preferences UI, testing scaffolding, packaging workflow
- In progress / roadmap: deeper runtime settings integration, hardened integration tests with full UI automation, optional native D-Bus helper implementation

## Quick Start (Development)

```bash
sudo apt update
sudo apt install -y \
  gnome-shell gnome-shell-extensions gnome-extensions-app \
  gjs libglib2.0-dev libpolkit-gobject-1-dev \
  meson ninja-build gcc flatpak snapd xdotool xvfb dbus-x11 \
  eslint shellcheck jq zip unzip

npm install -g eslint @eslint/js
```

```bash
meson setup build --prefix=/usr
ninja -C build
```

```bash
EXT_UUID="appgrid-uninstall@i-soumya18.github.io"
mkdir -p "$HOME/.local/share/gnome-shell/extensions/$EXT_UUID"
rsync -a --delete extension/ "$HOME/.local/share/gnome-shell/extensions/$EXT_UUID/"
glib-compile-schemas "$HOME/.local/share/gnome-shell/extensions/$EXT_UUID/schemas/"
gnome-extensions enable "$EXT_UUID"
```

Logs:

```bash
journalctl -f -o cat /usr/bin/gnome-shell | grep AppGridUninstall
```

## Packaging

Create extensions.gnome.org ZIP:

```bash
bash packaging/make_zip.sh
```

Artifacts and metadata for Debian/RPM are available under `packaging/`.

## Documentation

- [Install Guide](docs/INSTALL.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)

## Security Notes

- No shell interpolation for uninstall commands; subprocesses use argv arrays
- Privileged package removal routes through Polkit + `pkexec`
- System app guard blocks protected components

## License

GPL-2.0-or-later. See `LICENSE`.
