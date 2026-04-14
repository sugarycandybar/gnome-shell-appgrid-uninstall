import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ConfirmDialog} from './confirmDialog.js';
import {NotificationHandler} from './notificationHandler.js';
import {PackageDetector, PackageType} from './packageDetector.js';
import {SystemAppGuard} from './systemAppGuard.js';

export class UninstallManager {
  constructor(extension, app) {
    this._extension = extension;
    this._app = app;
    this._notification = new NotificationHandler(extension);
  }

  async startUninstall() {
    const guard = new SystemAppGuard();
    if (guard.isProtected(this._app)) {
      this._showSystemAppWarning();
      return;
    }

    const detector = new PackageDetector();
    const pkg = await detector.detect(this._app);

    if (pkg.type === PackageType.UNKNOWN) {
      this._notification.showError(
        this._t('Cannot Uninstall'),
        this._t('Could not determine how "%s" was installed.').format(
          this._app?.get_name?.() ?? this._t('this application')
        )
      );
      return;
    }

    const dialog = new ConfirmDialog(this._app, pkg, () => {
      this._performUninstall(pkg);
    });
    dialog.open();
  }

  _performUninstall(pkg) {
    const appName = this._app?.get_name?.() ?? this._t('application');
    this._notification.showProgress(this._t('Uninstalling %s…').format(appName));

    switch (pkg.type) {
    case PackageType.FLATPAK:
      this._uninstallFlatpak(pkg.identifier);
      break;
    case PackageType.SNAP:
      this._uninstallSnap(pkg.identifier);
      break;
    case PackageType.APT:
      this._uninstallApt(pkg.identifier);
      break;
    case PackageType.RPM:
      this._uninstallRpm(pkg.identifier);
      break;
    case PackageType.DNF:
      this._uninstallDnf(pkg.identifier);
      break;
    default:
      this._notification.showError(
        this._t('Cannot Uninstall'),
        this._t('Unsupported package type.')
      );
      break;
    }
  }

  _runSubprocess(argv, successMsg, errorMsg) {
    try {
      const proc = Gio.Subprocess.new(
        argv,
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
      );

      proc.communicate_utf8_async(null, null, (self, result) => {
        try {
          const [, , stderr] = self.communicate_utf8_finish(result);
          if (self.get_exit_status() === 0) {
            this._notification.showSuccess(successMsg);
          } else {
            this._notification.showError(errorMsg, (stderr ?? '').trim());
          }
        } catch (e) {
          this._notification.showError(errorMsg, e.message);
        }
      });
    } catch (e) {
      this._notification.showError(errorMsg, e.message);
    }
  }

  _uninstallFlatpak(appId) {
    this._runSubprocess(
      ['flatpak', 'uninstall', '--noninteractive', '--user', appId],
      this._t('%s was successfully uninstalled.').format(this._app.get_name()),
      this._t('Failed to uninstall %s.').format(this._app.get_name())
    );
  }

  _uninstallSnap(snapName) {
    const snapBin = this._resolveBinary('/usr/bin/snap', 'snap');
    this._runSubprocess(
      ['pkexec', snapBin, 'remove', snapName],
      this._t('%s was successfully uninstalled.').format(this._app.get_name()),
      this._t('Failed to uninstall %s.').format(this._app.get_name())
    );
  }

  _uninstallApt(packageName) {
    const aptGetBin = this._resolveBinary('/usr/bin/apt-get', 'apt-get');
    this._runSubprocess(
      ['pkexec', aptGetBin, 'remove', '-y', '--auto-remove', packageName],
      this._t('%s was successfully uninstalled.').format(this._app.get_name()),
      this._t('Failed to uninstall %s.').format(this._app.get_name())
    );
  }

  _uninstallRpm(packageName) {
    const rpmBin = this._resolveBinary('/usr/bin/rpm', 'rpm');
    this._runSubprocess(
      ['pkexec', rpmBin, '-e', packageName],
      this._t('%s was successfully uninstalled.').format(this._app.get_name()),
      this._t('Failed to uninstall %s.').format(this._app.get_name())
    );
  }

  _uninstallDnf(packageName) {
    const dnfBin = this._resolveBinary('/usr/bin/dnf', 'dnf');
    this._runSubprocess(
      ['pkexec', dnfBin, 'remove', '-y', packageName],
      this._t('%s was successfully uninstalled.').format(this._app.get_name()),
      this._t('Failed to uninstall %s.').format(this._app.get_name())
    );
  }

  _showSystemAppWarning() {
    const dialog = new ConfirmDialog(this._app, null, null, {
      warningMode: true,
      warningText: this._t('"%s" is a system application and cannot be uninstalled.')
        .format(this._app?.get_name?.() ?? this._t('This app')),
    });
    dialog.open();
  }

  _t(text) {
    if (typeof this._extension?.gettext === 'function')
      return this._extension.gettext(text);
    return text;
  }

  _resolveBinary(expectedPath, fallbackName) {
    if (GLib.file_test(expectedPath, GLib.FileTest.EXISTS))
      return expectedPath;

    const found = GLib.find_program_in_path(fallbackName);
    return found ?? fallbackName;
  }
}
