# Build notes — _davDUPLICATE v26.10.2

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

La v26.10.2 applica la repository normalization, mantiene il parser di `Cargo.lock` compatibile LF/CRLF e preserva il motore locale di rilevamento duplicati senza modifiche funzionali.

