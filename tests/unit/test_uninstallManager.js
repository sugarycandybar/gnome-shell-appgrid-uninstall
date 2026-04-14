import {UninstallManager} from '../../extension/uninstallManager.js';
import {PackageDetector, PackageType} from '../../extension/packageDetector.js';
import {assertEqual, assertTrue, runAsyncTest} from './testlib.js';

function fakeApp(name = 'Test App') {
  return {
    get_name: () => name,
    get_id: () => 'test.app.desktop',
    get_app_info: () => ({
      get_filename: () => '/tmp/test.desktop',
      should_show: () => true,
    }),
  };
}

export async function run() {
  const tests = [];

  tests.push(await runAsyncTest('shows error when package type is unknown', async () => {
    const originalDetect = PackageDetector.prototype.detect;
    PackageDetector.prototype.detect = async () => ({type: PackageType.UNKNOWN, identifier: null});

    const manager = new UninstallManager(null, fakeApp('Unknown App'));
    let errorCalled = false;
    manager._notification = {
      showError: () => { errorCalled = true; },
      showProgress: () => {},
      showSuccess: () => {},
    };

    await manager.startUninstall();

    PackageDetector.prototype.detect = originalDetect;
    assertTrue(errorCalled, 'Expected error notification for unknown package type');
  }));

  tests.push(await runAsyncTest('starts uninstall flow for known package type', async () => {
    const originalDetect = PackageDetector.prototype.detect;
    PackageDetector.prototype.detect = async () => ({type: PackageType.FLATPAK, identifier: 'org.example.App'});

    const manager = new UninstallManager(null, fakeApp('Flatpak App'));
    let called = false;
    manager._performUninstall = () => { called = true; };

    await manager.startUninstall();

    PackageDetector.prototype.detect = originalDetect;
    assertEqual(called, true);
  }));

  return tests;
}
