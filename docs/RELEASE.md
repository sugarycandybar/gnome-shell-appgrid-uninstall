# Release Guide

## Create extension ZIP

```bash
bash packaging/make_zip.sh
```

## GitHub release

Tag and push:

```bash
git tag v1.0.0
git push origin v1.0.0
```

`release.yml` will build and attach `packaging/*.zip` artifacts.

## Debian/RPM metadata

- Debian packaging files: `packaging/debian/`
- RPM spec: `packaging/rpm/gnome-shell-appgrid-uninstall.spec`
