# Supporto multipiattaforma — _davDUPLICATE v26.10.2

## Desktop nativo

- Windows: Tauri 2 + WebView2.
- macOS: Tauri 2 + WKWebView.
- Linux: Tauri 2 + WebKitGTK.

## Elaborazione locale

La scansione, gli hash BLAKE3, la verifica byte-per-byte, il riconoscimento degli hard link e la selezione dei duplicati restano sul dispositivo locale. `_davDUPLICATE` non richiede servizi cloud per il proprio motore di analisi.

## Sicurezza filesystem

La scansione non segue i link simbolici. I file selezionati per la pulizia vengono spostati nel Cestino/Trash del sistema operativo e non vengono eliminati automaticamente durante la fase di analisi.

## Release

Il workflow GitHub costruisce e pubblica automaticamente installer NSIS per Windows, Universal DMG per macOS e AppImage/DEB per Linux quando viene pubblicato un tag `v*` coerente con la versione del progetto. La Description bilingue 🇮🇹/🇺🇸 del commit associato al tag viene utilizzata come descrizione della GitHub Release; il workflow interrompe la pubblicazione se una delle due sezioni manca.

La v26.10.2 applica la repository normalization dei file testuali e preserva byte-per-byte gli asset binari. Il workflow verifica anche i lockfile prima della pubblicazione della release.

