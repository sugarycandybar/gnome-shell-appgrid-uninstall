# Install Guide

## 1) End-user install (local)

```bash
EXT_UUID="appgrid-uninstall@i-soumya18.github.io"
mkdir -p "$HOME/.local/share/gnome-shell/extensions/$EXT_UUID"
rsync -a --delete extension/ "$HOME/.local/share/gnome-shell/extensions/$EXT_UUID/"
glib-compile-schemas "$HOME/.local/share/gnome-shell/extensions/$EXT_UUID/schemas/"
gnome-extensions enable "$EXT_UUID"
```

On Wayland, log out/in if GNOME Shell does not immediately pick up changes.

## 2) Build + install (system)

```bash
meson setup build --prefix=/usr
ninja -C build
sudo meson install -C build
```

This installs extension files, schemas, and helper policy metadata to system paths.

## 3) Packaging install paths

- Extension JS files: `/usr/share/gnome-shell/extensions/appgrid-uninstall@i-soumya18.github.io`
- GSettings schema XML: `/usr/share/glib-2.0/schemas`
- Polkit policy: `/usr/share/polkit-1/actions/org.gnome.AppGridUninstall.policy`
- D-Bus service metadata: `/usr/share/dbus-1/system-services/org.gnome.AppGridUninstall.service`

## 4) Troubleshooting

- Extension not visible: verify UUID folder name exactly matches `metadata.json`
- Settings schema errors: re-run `glib-compile-schemas` in installed schema directory
- Polkit prompt not shown: ensure a polkit agent is running in your desktop session
