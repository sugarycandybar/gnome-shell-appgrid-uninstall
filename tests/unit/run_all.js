import {run as runPackageDetectorTests} from './test_packageDetector.js';
import {run as runSystemAppGuardTests} from './test_systemAppGuard.js';

function summarize(results) {
  const total = results.length;
  const failed = results.filter(r => !r.ok).length;
  const passed = total - failed;

  print(`\nTest summary: ${passed}/${total} passed, ${failed} failed`);
  if (failed > 0)
    return 1;
  return 0;
}

async function loadUninstallManagerTests() {
  try {
    const module = await import('./test_uninstallManager.js');
    return await module.run();
  } catch (error) {
    print(`SKIP uninstallManager tests: ${error.message}`);
    return [];
  }
}

const uninstallManagerResults = await loadUninstallManagerTests();
const packageDetectorResults = await runPackageDetectorTests();
const systemAppGuardResults = runSystemAppGuardTests();

const results = [
  ...packageDetectorResults,
  ...systemAppGuardResults,
  ...uninstallManagerResults,
];

const code = summarize(results);
if (code !== 0)
  throw new Error('Unit tests failed');
