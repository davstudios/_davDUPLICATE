import { readFileSync } from 'node:fs';

const tag = process.env.RELEASE_TAG || '';
const expected = tag.startsWith('v') ? tag.slice(1) : tag;
if (!expected) throw new Error('Missing RELEASE_TAG');
const packageVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;
const tauriVersion = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8')).version;
const cargo = readFileSync('src-tauri/Cargo.toml', 'utf8');
const cargoVersion = cargo.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
const versions = { packageVersion, tauriVersion, cargoVersion };
for (const [name, value] of Object.entries(versions)) {
  if (value !== expected) throw new Error(`${name} is ${value}; expected ${expected} from ${tag}`);
}
console.log(`Release version verified: ${tag}`);
