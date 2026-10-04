import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('workflow GitHub pubblica release stabile con description bilingue', () => {
  const text = fs.readFileSync('.github/workflows/release.yml', 'utf8');
  assert.match(text, /Verify release versions/);
  assert.match(text, /Read release description from tagged commit/);
  assert.match(text, /git log -1 --pretty=%b/);
  assert.match(text, /releaseBody:\s*\$\{\{ steps\.release_description\.outputs\.body \}\}/);
  assert.match(text, /prerelease:\s*false/);
  assert.doesNotMatch(text, /generateReleaseNotes:\s*true/);
});

test('Linux release workflow ignores unrelated Microsoft apt repository', () => {
  const text = fs.readFileSync('.github/workflows/release.yml', 'utf8');
  assert.match(text, /packages\.microsoft\.com/);
  assert.match(text, /Acquire::Retries=3/);
});

test('metadata pacchetto _davstudios presenti', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const tauri = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
  const cargo = fs.readFileSync('src-tauri/Cargo.toml', 'utf8');
  assert.equal(pkg.author, '_davstudios');
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.homepage, 'https://davstudios.it');
  assert.equal(tauri.identifier, 'studio.dav.duplicate');
  assert.equal(tauri.bundle.publisher, '_davstudios');
  assert.equal(tauri.bundle.homepage, 'https://davstudios.it');
  assert.equal(tauri.bundle.license, 'MIT');
  assert.equal(tauri.bundle.licenseFile, '../LICENSE');
  assert.equal(tauri.bundle.category, 'Productivity');
  assert.equal(tauri.bundle.linux.deb.section, 'utils');
  assert.equal(tauri.bundle.linux.deb.priority, 'optional');
  assert.match(cargo, /license = "MIT"/);
  assert.match(cargo, /homepage = "https:\/\/davstudios\.it"/);
});

test('identifier storico resta invariato', () => {
  const tauri = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
  assert.equal(tauri.identifier, 'studio.dav.duplicate');
});

test('set icone Tauri completo e documentato', () => {
  for (const file of ['32x32.png','128x128.png','128x128@2x.png','app-icon.png','icon.ico','icon.icns']) {
    assert.equal(fs.existsSync(`src-tauri/icons/${file}`), true, `${file} mancante`);
  }
  assert.equal(fs.existsSync('src-tauri/icons/RELEASE-METADATA.md'), true);
});

test('interfaccia usa il supporto _davstudios aggiornato', () => {
  const main = fs.readFileSync('src/main.js', 'utf8');
  assert.match(main, /Offrimi Un Caffè/);
  assert.doesNotMatch(main, /Comprami Un Caffè/);
  assert.match(main, /davstudios\.it/);
  assert.match(main, /MIT · Open source/);
});

test('motion system matches the _davstudios website v52 language', () => {
  const motion = fs.readFileSync('src/motion.css', 'utf8');
  assert.match(motion, /--motion-duration-base:720ms/);
  assert.match(motion, /--motion-duration-slow:940ms/);
  assert.match(motion, /--motion-step:72ms/);
  assert.match(motion, /--motion-page-out:170ms/);
  assert.match(motion, /--motion-page-in:430ms/);
  assert.match(motion, /cubic-bezier\(\.16,1,\.3,1\)/);
  assert.match(motion, /blur\(3px\)/);
  assert.match(motion, /dav-theme-reveal 680ms/);
  assert.match(motion, /prefers-reduced-motion:reduce/);
  const main = fs.readFileSync('src/main.js', 'utf8');
  assert.match(main, /navigatePage/);
  assert.match(main, /is-page-leaving/);
});

test('Windows release usa GUI subsystem e non ha helper CLI figli', () => {
  const main = fs.readFileSync('src-tauri/src/main.rs', 'utf8');
  const backend = [
    'src-tauri/src/backend.rs',
    'src-tauri/src/core.rs',
    'src-tauri/src/duplicate.rs',
    'src-tauri/src/lib.rs'
  ].map((path) => fs.readFileSync(path, 'utf8')).join('\n');
  assert.match(main, /cfg_attr\(not\(debug_assertions\), windows_subsystem = "windows"\)/);
  assert.doesNotMatch(backend, /Command::new|std::process::Command/);
});

test('README stabile e indipendente dalla release corrente', () => {
  const readme = fs.readFileSync('README.md', 'utf8');
  assert.match(readme, /Offrimi Un Caffè/);
  assert.match(readme, /Local-first/);
  assert.match(readme, /Windows GUI subsystem/);
  assert.match(readme, /motion system coerente con il sito `_davstudios`/);
  assert.doesNotMatch(readme, /Versione corrente:|Current version:|`v26\.10\.3`/);
  for (const asset of ['website-it.svg','website-en.svg','buy-coffee-it.svg','buy-coffee-en.svg']) {
    assert.equal(fs.existsSync(`.github/assets/${asset}`), true, `${asset} mancante`);
  }
});
