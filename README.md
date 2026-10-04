<div align="center">
  <img src="src-tauri/icons/app-icon.png" width="112" alt="_davDUPLICATE icon">

# _davDUPLICATE

**Trova duplicati reali e recupera spazio in sicurezza, interamente in locale.**  
**Find true duplicates and reclaim space safely, entirely on your device.**

Windows · macOS · Linux · Local-first · Open source

[![Italiano](https://img.shields.io/badge/Italiano-006EDB?style=for-the-badge)](#-italiano)
[![English](https://img.shields.io/badge/English-141416?style=for-the-badge)](#-english)
</div>

---

# 🇮🇹 Italiano

_davDUPLICATE è un'app desktop multipiattaforma di **_davstudios** progettata per trovare file realmente identici senza basarsi soltanto su nome o estensione. La scansione resta sul dispositivo e usa una pipeline progressiva che riduce il lavoro inutile prima della verifica finale byte per byte.

<p>
  <a href="https://www.davstudios.it"><img src=".github/assets/website-it.svg" height="46" alt="Visita il sito"></a>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-it.svg" height="46" alt="Offrimi Un Caffè"></a>
</p>

## Funzioni principali

- selezione nativa di file e cartelle;
- drag & drop;
- scansione ricorsiva senza seguire symlink;
- pipeline dimensione → quick hash → BLAKE3 completo → verifica byte per byte;
- riconoscimento degli hard link;
- calcolo dello spazio realmente recuperabile per gruppo e totale;
- ricerca e filtri per nome, percorso, dimensione ed estensione;
- strategie automatiche per mantenere il file più vecchio, più recente, con percorso più corto o in una cartella preferita;
- selezione manuale delle copie da rimuovere;
- scansione annullabile con avanzamento locale;
- spostamento sicuro dei file selezionati nel Cestino/Trash;
- registro locale delle operazioni completate;
- interfaccia italiana e inglese;
- tema Sistema, Chiaro e Scuro;
- motion system coerente con il sito `_davstudios`.

## Come vengono verificati i duplicati

```text
1. Raggruppamento per dimensione
2. Quick hash dei candidati
3. Hash BLAKE3 completo
4. Verifica byte per byte
```

Un file viene mostrato come duplicato esatto solo dopo aver superato tutte le fasi. Gli hard link vengono riconosciuti e non sono conteggiati come spazio duplicato recuperabile.

## Sicurezza

_davDUPLICATE non elimina automaticamente alcun file. Le copie selezionate sono sempre visibili prima della pulizia e l'operazione utilizza il Cestino/Trash del sistema operativo.

La scansione non segue i link simbolici, riducendo il rischio di loop o attraversamenti inattesi del filesystem.

## Privacy e local-first

- nessun account;
- nessun upload;
- nessuna elaborazione cloud;
- nessuna telemetria integrata;
- hash e confronti eseguiti sul dispositivo.

I file analizzati e i relativi contenuti restano sul computer.

## Piattaforme

| Sistema | Architettura | Pacchetto |
| --- | --- | --- |
| Windows 10/11 | x64 | NSIS `.exe` |
| macOS | Intel + Apple Silicon | Universal `.dmg` |
| Linux | x64 | `.AppImage` / `.deb` |

Le release vengono compilate tramite GitHub Actions sui rispettivi sistemi operativi.

## Installazione di release non firmate

Le build pubbliche non utilizzano attualmente un certificato commerciale Windows né Apple Developer ID/notarizzazione. Scarica sempre gli artefatti dalla repository GitHub ufficiale di `_davstudios`.

### Windows

SmartScreen può mostrare **Windows ha protetto il PC**. Se il file proviene dalla repository ufficiale, scegli **Ulteriori informazioni → Esegui comunque**. La build Release è configurata come applicazione GUI tramite Windows GUI subsystem e non apre una finestra CMD separata.

### macOS

Se Gatekeeper blocca la prima apertura, prova ad aprire l'app e poi vai in **Impostazioni di Sistema → Privacy e Sicurezza → Apri comunque**.

### Linux

Per un'AppImage può essere necessario renderla eseguibile:

```bash
chmod +x _davDUPLICATE*.AppImage
```

## Sviluppo

Requisiti: Node.js, Rust e prerequisiti Tauri del sistema operativo.

```bash
npm install
npm run desktop
```

Test:

```bash
npm test
```

Build locale:

```bash
npm run bundle
```

Gli artefatti vengono generati in `src-tauri/target/release/bundle/`.

## Stack e identità

- Tauri 2;
- Rust;
- JavaScript + Vite;
- BLAKE3;
- verifica finale byte per byte;
- Plus Jakarta Sans con fallback di sistema;
- motion system coerente con il sito `_davstudios`;
- bundle identifier stabile: `studio.dav.duplicate`;
- licenza MIT.

La versione dell'app è gestita nei manifest tecnici e nelle GitHub Release; non viene mostrata nell'interfaccia ordinaria per mantenere la UI pulita e impedire stringhe di versione duplicate.

## Licenza

Distribuito con licenza **MIT**. Consulta [`LICENSE`](LICENSE).

---

# 🇺🇸 English

_davDUPLICATE is a cross-platform desktop app by **_davstudios** designed to find truly identical files without relying only on names or extensions. Scanning stays on the device and uses a staged pipeline that avoids unnecessary work before the final byte-for-byte verification.

<p>
  <a href="https://www.davstudios.it/en"><img src=".github/assets/website-en.svg" height="46" alt="Visit website"></a>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-en.svg" height="46" alt="Buy Me A Coffee"></a>
</p>

## Main features

- native file and folder selection;
- drag & drop;
- recursive scanning without following symlinks;
- size → quick hash → full BLAKE3 → byte-for-byte verification pipeline;
- hard-link awareness;
- reclaimable-space calculation per group and overall;
- search and filters by name, path, size and extension;
- automatic strategies to keep the oldest, newest, shortest-path or preferred-folder file;
- manual selection of copies to remove;
- cancellable scanning with local progress;
- safe movement of selected files to the operating system Trash/Recycle Bin;
- local activity log for completed cleanup operations;
- Italian and English interface;
- System, Light and Dark themes;
- motion system aligned with the `_davstudios` website.

## How duplicates are verified

```text
1. Group by file size
2. Quick hash candidates
3. Full BLAKE3 hash
4. Byte-for-byte verification
```

A file is shown as an exact duplicate only after passing every stage. Hard links are detected and excluded from reclaimable duplicated storage.

## Safety

_davDUPLICATE never deletes files automatically. Selected copies are always visible before cleanup and the operation uses the operating system Trash/Recycle Bin.

Symlinks are not followed during scanning, reducing the risk of loops or unexpected filesystem traversal.

## Privacy and local-first

- no account;
- no uploads;
- no cloud processing;
- no built-in telemetry;
- hashes and comparisons run on your device.

Analyzed files and their contents remain on your computer.

## Platforms

| System | Architecture | Package |
| --- | --- | --- |
| Windows 10/11 | x64 | NSIS `.exe` |
| macOS | Intel + Apple Silicon | Universal `.dmg` |
| Linux | x64 | `.AppImage` / `.deb` |

Releases are compiled through GitHub Actions on the corresponding operating systems.

## Installing unsigned releases

Public builds currently do not use a commercial Windows signing certificate or Apple Developer ID/notarization. Always download artifacts from the official `_davstudios` GitHub repository.

### Windows

SmartScreen may display **Windows protected your PC**. If the file comes from the official repository, choose **More info → Run anyway**. Release builds use the Windows GUI subsystem and do not open a separate CMD window.

### macOS

If Gatekeeper blocks the first launch, attempt to open the app and then go to **System Settings → Privacy & Security → Open Anyway**.

### Linux

An AppImage may need executable permission:

```bash
chmod +x _davDUPLICATE*.AppImage
```

## Development

Requirements: Node.js, Rust and the Tauri prerequisites for your operating system.

```bash
npm install
npm run desktop
```

Tests:

```bash
npm test
```

Local build:

```bash
npm run bundle
```

Artifacts are generated under `src-tauri/target/release/bundle/`.

## Stack and identity

- Tauri 2;
- Rust;
- JavaScript + Vite;
- BLAKE3;
- final byte-for-byte verification;
- Plus Jakarta Sans with system fallback;
- motion system aligned with the `_davstudios` website;
- stable bundle identifier: `studio.dav.duplicate`;
- MIT License.

The application version is managed by the technical manifests and GitHub Releases; it is intentionally omitted from the ordinary interface to keep the UI clean and prevent duplicated version strings.

## License

Released under the **MIT License**. See [`LICENSE`](LICENSE).
