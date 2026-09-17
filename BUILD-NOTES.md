# _davDUPLICATE v1.0.0 build notes

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

Version 1.0.0 is the stable exact-duplicate release. It verifies candidates byte for byte, recognizes hard links and moves explicitly selected files to the operating system Trash instead of permanently deleting them.
