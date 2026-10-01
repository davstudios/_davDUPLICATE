import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('metadata pacchetto _davstudios presenti',()=>{
  const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
  const tauri=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8'));
  const cargo=fs.readFileSync('src-tauri/Cargo.toml','utf8');
  assert.equal(pkg.version,'26.10.1');
  assert.equal(pkg.author,'_davstudios');
  assert.equal(pkg.license,'MIT');
  assert.equal(pkg.homepage,'https://davstudios.it');
  assert.equal(tauri.identifier,'studio.dav.duplicate');
  assert.equal(tauri.bundle.publisher,'_davstudios');
  assert.equal(tauri.bundle.homepage,'https://davstudios.it');
  assert.equal(tauri.bundle.license,'MIT');
  assert.equal(tauri.bundle.licenseFile,'../LICENSE');
  assert.equal(tauri.bundle.linux.deb.section,'utils');
  assert.equal(tauri.bundle.linux.deb.priority,'optional');
  assert.match(cargo,/license = "MIT"/);
  assert.match(cargo,/homepage = "https:\/\/davstudios\.it"/);
});

test('workflow GitHub usa la Description bilingue del commit',()=>{
  const text=fs.readFileSync('.github/workflows/release.yml','utf8');
  assert.match(text,/Read release description from tagged commit/);
  assert.match(text,/git log -1 --pretty=%b/);
  assert.match(text,/🇮🇹/);
  assert.match(text,/🇺🇸/);
  assert.match(text,/releaseBody:\s*\$\{\{ steps\.release_description\.outputs\.body \}\}/);
  assert.match(text,/prerelease:\s*false/);
  assert.doesNotMatch(text,/Stable release of _davDUPLICATE|generateReleaseNotes:\s*true/);
});

test('README documenta release non firmate',()=>{
  const text=fs.readFileSync('README.md','utf8');
  assert.match(text,/SmartScreen/);
  assert.match(text,/Gatekeeper/);
  assert.equal(text.includes('chmod +x _davDUPLICATE*.AppImage'),true);
});
