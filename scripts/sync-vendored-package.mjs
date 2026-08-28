#!/usr/bin/env node
/**
 * Re-syncs the vendored @saganta packages from a local checkout of
 * SagantaHQ/stellar-appkit.
 *
 * Usage:
 *   node scripts/sync-vendored-package.mjs                       # default path
 *   node scripts/sync-vendored-package.mjs /path/to/stellar-appkit
 *
 * For each of `core` and `react-native`:
 *   - builds dist/ (if the source tree can run the build),
 *   - copies src/, dist/, tsconfig.json, README.md, package.json,
 *   - marks the copy `private: true` so it can never be published by accident,
 *   - re-points the RN package's core dependency at the sibling vendored copy.
 *
 * Afterwards run `npm install` so the file: dependencies are re-copied into
 * node_modules.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_SRC = path.resolve(import.meta.dirname, '../../../repo_clone');
const repoRoot = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SRC;
const vendorDir = path.resolve(import.meta.dirname, '../packages');

const PACKAGES = [
  { src: 'core', dest: 'stellar-appkit' },
  { src: 'react-native', dest: 'stellar-appkit-react-native' },
];

if (!fs.existsSync(path.join(repoRoot, 'packages/core/package.json'))) {
  console.error(`No packages/core at ${repoRoot} — pass the stellar-appkit repo path as the first argument.`);
  process.exit(1);
}

for (const { src, dest } of PACKAGES) {
  const srcRoot = path.join(repoRoot, 'packages', src);
  const destRoot = path.join(vendorDir, dest);
  console.log(`\nSyncing ${srcRoot} -> ${destRoot}`);

  try {
    execSync('bun run build', { cwd: srcRoot, stdio: 'inherit' });
  } catch {
    console.warn(`  build failed — falling back to the existing dist/ if present`);
  }

  fs.rmSync(destRoot, { recursive: true, force: true });
  fs.mkdirSync(destRoot, { recursive: true });
  for (const entry of ['src', 'dist', 'tsconfig.json', 'README.md', 'package.json']) {
    const from = path.join(srcRoot, entry);
    if (!fs.existsSync(from)) {
      console.warn(`  missing (skipped): ${entry}`);
      continue;
    }
    fs.cpSync(from, path.join(destRoot, entry), { recursive: true });
    console.log(`  copied: ${entry}`);
  }

  const pkgPath = path.join(destRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.private = true;
  if (pkg.dependencies?.['@saganta/stellar-appkit']) {
    pkg.dependencies['@saganta/stellar-appkit'] = 'file:../stellar-appkit';
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

console.log('\nDone. Now run `npm install` so node_modules picks up the fresh copies.');
