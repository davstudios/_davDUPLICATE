# _davDUPLICATE v26.10.1 build notes

## Requirements

- Node.js LTS
- Rust 1.77.2 or newer
- Tauri 2 platform prerequisites

## Windows

Run `RUN-WINDOWS.bat` or `BUILD-WINDOWS.bat`.

## macOS

Run `./RUN-MACOS.sh` or `./BUILD-MACOS.sh`.

## Linux

On Ubuntu/Debian run `./INSTALL-LINUX-DEPS-UBUNTU.sh` first, then use `./RUN-LINUX.sh` or `./BUILD-LINUX.sh`.

## Release scope

Version 26.10.1 adopts the `_davstudios` `YY.M.REVISIONE` release standard, standardized package metadata and automatic bilingual GitHub Release descriptions. The exact-duplicate engine and cleanup behavior are unchanged from the previous stable release.

The release is intentionally unsigned: Windows SmartScreen and macOS Gatekeeper may therefore show security warnings. See `README.md` for user-facing installation guidance.
