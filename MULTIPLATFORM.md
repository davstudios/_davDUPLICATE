# Multiplatform

`_davDUPLICATE` v26.10.1 uses one Tauri codebase for Windows, macOS and Linux.

- Windows x64: NSIS installer
- macOS: Universal DMG for Intel and Apple Silicon
- Linux x64: AppImage and DEB

The included GitHub Actions workflow builds each package on its native runner. Releases are currently unsigned; installation guidance for Windows SmartScreen, macOS Gatekeeper and Linux AppImage permissions is documented in `README.md`.
