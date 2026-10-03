import { readFileSync } from 'node:fs';

const tag = process.env.RELEASE_TAG || '';
const expected = tag.startsWith('v') ? tag.slice(1) : tag;
if (!expected) throw new Error('Missing RELEASE_TAG');

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const tauri = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8'));
const cargoText = readFileSync('src-tauri/Cargo.toml', 'utf8');
const cargoLockText = readFileSync('src-tauri/Cargo.lock', 'utf8');
const cargoVersion = cargoText.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
const cargoLockVersion = cargoLockText.match(/\[\[package\]\]\r?\nname = "davduplicate"\r?\nversion = "([^"]+)"/)?.[1];

const versions = {
  packageVersion: packageJson.version,
  packageLockVersion: packageLock.version,
  packageLockRootVersion: packageLock.packages?.['']?.version,
  tauriVersion: tauri.version,
  cargoVersion,
  cargoLockVersion
};

const mismatches = Object.entries(versions).filter(([, value]) => value !== expected);
if (mismatches.length) {
  console.error(`Release tag ${tag} expects app version ${expected}.`);
  for (const [name, value] of Object.entries(versions)) console.error(`${name}: ${value}`);
  process.exit(1);
}

console.log(`Release versions are aligned on ${expected}.`);

