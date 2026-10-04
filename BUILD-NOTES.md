# Build notes — _davDUPLICATE v26.10.3

## Prerequisiti

- Node.js LTS
- Rust stable
- dipendenze native richieste da Tauri 2 sulla piattaforma di destinazione

## Comandi

### Windows

`BUILD-WINDOWS.bat`

### macOS

`./BUILD-MACOS.sh`

### Linux

Esegui prima `./INSTALL-LINUX-DEPS-UBUNTU.sh` quando necessario, quindi `./BUILD-LINUX.sh`.

## Release GitHub

Il workflow `.github/workflows/release.yml` crea NSIS, Universal DMG, AppImage e DEB. Prima della build verifica che il tag e le versioni in `package.json`, `package-lock.json`, Tauri, `Cargo.toml` e `Cargo.lock` siano perfettamente allineati.

La v26.10.3 applica il motion system `_davstudios` derivato dal sito v52, rimuove la versione dall'interfaccia ordinaria, configura la build Windows Release con GUI subsystem, aggiorna il supporto Buy Me A Coffee e mantiene invariato il motore locale di rilevamento duplicati.
