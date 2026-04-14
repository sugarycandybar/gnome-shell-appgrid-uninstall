const PROTECTED_APP_IDS = new Set([
  'org.gnome.Nautilus',
  'org.gnome.Settings',
  'org.gnome.Shell',
  'org.gnome.Terminal',
  'org.freedesktop.Tracker3.Miner.Files',
  'org.gnome.Software',
  'gnome-session',
  'polkit-gnome-authentication-agent-1',
]);

const PROTECTED_PATH_PREFIXES = [
  '/usr/share/applications/gnome-',
  '/usr/share/applications/nautilus',
  '/usr/share/applications/org.gnome.Settings',
];

export class SystemAppGuard {
  isProtected(app) {
    if (!app)
      return true;

    const appId = this._normalizeAppId(app.get_id?.() ?? '');
    if (PROTECTED_APP_IDS.has(appId))
      return true;

    const appInfo = app.get_app_info?.();
    const desktopPath = appInfo?.get_filename?.() ?? '';
    if (PROTECTED_PATH_PREFIXES.some(prefix => desktopPath.startsWith(prefix)))
      return true;

    if (appInfo && !appInfo.should_show?.())
      return true;

    return false;
  }

  _normalizeAppId(appId) {
    return appId.replace(/\.desktop$/, '');
  }
}
