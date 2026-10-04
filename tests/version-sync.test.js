import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const packageVersion = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
const packageLock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));
const tauri = JSON.parse(readFileSync(resolve(root, 'src-tauri/tauri.conf.json'), 'utf8'));
const cargoText = readFileSync(resolve(root, 'src-tauri/Cargo.toml'), 'utf8');
const cargoVersion = cargoText.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
const cargoLockText = readFileSync(resolve(root, 'src-tauri/Cargo.lock'), 'utf8');
const cargoLockVersion = cargoLockText.match(/\[\[package\]\]\r?\nname = "davduplicate"\r?\nversion = "([^"]+)"/)?.[1];
const mainSource = readFileSync(resolve(root, 'src/main.js'), 'utf8');

test('release versions stay aligned', () => {
  assert.equal(packageVersion, '26.10.3');
  assert.equal(packageLock.version, packageVersion);
  assert.equal(packageLock.packages[''].version, packageVersion);
  assert.equal(tauri.version, packageVersion);
  assert.equal(cargoVersion, packageVersion);
  assert.equal(cargoLockVersion, packageVersion);
});

test('Cargo.lock remains readable with Windows CRLF line endings', () => {
  const windowsCargoLock = cargoLockText.replace(/\r?\n/g, '\r\n');
  const windowsCargoLockVersion = windowsCargoLock.match(/\[\[package\]\]\r?\nname = "davduplicate"\r?\nversion = "([^"]+)"/)?.[1];
  assert.equal(windowsCargoLockVersion, packageVersion);
});

test('versione non viene duplicata nella UI ordinaria', () => {
  assert.doesNotMatch(mainSource, /getVersion/);
  assert.doesNotMatch(mainSource, /appVersion/);
  assert.doesNotMatch(mainSource, /class="version"/);
  assert.doesNotMatch(mainSource, /v\$\{/);
  assert.match(mainSource, /MIT · Open source/);
});
