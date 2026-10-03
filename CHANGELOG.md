# Changelog

## 26.10.2

- Eseguita la repository normalization completa dei file testuali con regole EOL/EOF deterministiche.
- Rafforzata la sincronizzazione versione includendo package-lock.json e Cargo.lock.
- Reso il parser di Cargo.lock compatibile con checkout Windows CRLF.
- Aggiornato il workflow GitHub Actions con Description bilingue 🇮🇹/🇺🇸, verifica completa delle versioni e hardening Linux.
- Preservati byte-per-byte gli asset binari delle icone e aggiunti metadata di release nella relativa cartella.
- Nessuna modifica funzionale al motore di rilevamento duplicati, alla logica di selezione o alla pulizia tramite Cestino/Trash.

## 26.10.1

- Adottato il sistema di versioning `_davstudios` `YY.M.REVISIONE`.
- Standardizzati metadata applicazione, licenza MIT, homepage, publisher e packaging multipiattaforma.
- Mantenuto invariato l'identifier storico `studio.dav.duplicate`.
- Aggiunte istruzioni per release non firmate e distribuzione tramite GitHub.

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

