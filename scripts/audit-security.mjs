import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const cli = process.env.npm_execpath;
assert.ok(cli, 'Ejecuta esta auditoría con pnpm audit:security');
const result = spawnSync(process.execPath, [cli, 'audit', '--json'], {
  encoding: 'utf8',
  timeout: 120000,
});
if (result.error) throw result.error;
const report = JSON.parse(result.stdout.replace(/^\uFEFF/, ''));
assert.ok(
  report.metadata?.vulnerabilities && report.advisories,
  'La auditoría no devolvió un informe válido',
);
const config = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const patch = config.pnpm?.patchedDependencies?.['braces@3.0.3'];
assert.ok(patch, 'Falta el parche versionado de braces');
const regression = spawnSync(
  process.execPath,
  ['--test', 'tests/security-dependencies.test.js'],
  { encoding: 'utf8', timeout: 15000 },
);
assert.equal(regression.status, 0, regression.stdout + regression.stderr);
let pending = 0;
for (const advisory of Object.values(report.advisories)) {
  if (
    advisory.github_advisory_id === 'GHSA-vfj7-8cjw-p6xm' &&
    advisory.module_name === 'braces' &&
    advisory.findings.every((finding) => finding.version === '3.0.3')
  ) {
    console.log(
      `MITIGADO con parche local y prueba de anidación: ${advisory.url}`,
    );
  } else {
    pending++;
    console.error(
      `${advisory.severity}: ${advisory.module_name} - ${advisory.url}`,
    );
  }
}
assert.equal(pending, 0, `${pending} avisos pendientes de mitigar`);
console.log(
  'Sin avisos pendientes en las dependencias auditadas; se mantiene visible la excepción parcheada.',
);
