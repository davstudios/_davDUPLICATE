# Changelog

## 26.10.1

- Adottato il nuovo standard di versioning `_davstudios` `YY.M.REVISIONE`.
- Sincronizzata la versione dell'app su npm, Tauri, Cargo, lockfile, documentazione e test.
- Standardizzati i metadata ufficiali del pacchetto con publisher `_davstudios`, homepage, copyright, licenza MIT e metadata Debian.
- Mantenuto l'identifier storico `studio.dav.duplicate` per preservare la continuità dell'identità applicativa.
- Aggiunte al README le istruzioni per le release GitHub non firmate su Windows, macOS e Linux.
- Il workflow GitHub Actions usa ora automaticamente la Description bilingue del commit associato al tag come descrizione della GitHub Release.
- Rafforzata l'installazione delle dipendenze Linux contro repository Microsoft non raggiungibili sui runner Ubuntu.
- Nessuna modifica alla logica di scansione, rilevamento duplicati, selezione o pulizia.

## 1.0.1

- La versione mostrata nell'interfaccia viene ora letta automaticamente dal runtime Tauri.
- Rimossi i numeri di versione hardcoded dalla UI.
- Aggiunti test automatici per mantenere sincronizzati package.json, tauri.conf.json e Cargo.toml.
- Aggiunto un controllo che impedisce di reintrodurre versioni hardcoded in src/main.js.

## 1.0.0

Stable release of `_davDUPLICATE`.

- Exact duplicate detection with size grouping, quick BLAKE3, full BLAKE3 and final byte verification.
- Hard-link awareness with correct reclaimable-space calculation.
- Recursive local scanning without following symlinks.
- Cancellable progress reporting.
- Search, size and extension filters.
- Manual and automatic selection strategies.
- Safe move-to-Trash cleanup with no automatic deletion.
- Local structured activity log.
- Italian and English interface with System, Light and Dark themes.
- Final application icon set derived from the official `_davDUPLICATE` ICO.
- Stable Windows, macOS and Linux GitHub release workflow.
- Source comment audit.

## 0.1.0
Initial preview of `_davDUPLICATE`.

- Exact duplicate detection with staged scanning.
- Size grouping, quick BLAKE3, full BLAKE3 and byte verification.
- Hard-link awareness and reclaimable-space calculation.
- Recursive local file/folder scanning without following symlinks.
- Cancellable scan progress.
- Search, size and extension filters.
- Manual and automatic duplicate selection strategies.
- Safe move-to-Trash cleanup.
- Local cleanup activity log.
- Italian and English interface.
- Shared `_davstudios` themes, motion system, donation and website buttons.
- Windows, macOS and Linux release workflow.
- Source comment audit.
