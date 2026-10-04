# Supporto multipiattaforma — _davDUPLICATE v26.10.3

## Desktop nativo

- Windows: Tauri 2 + WebView2.
- macOS: Tauri 2 + WKWebView.
- Linux: Tauri 2 + WebKitGTK.

## Elaborazione locale

La scansione, gli hash BLAKE3, la verifica byte-per-byte, il riconoscimento degli hard link e la selezione dei duplicati restano sul dispositivo locale. `_davDUPLICATE` non richiede servizi cloud per il proprio motore di analisi.

## Sicurezza filesystem

La scansione non segue i link simbolici. I file selezionati per la pulizia vengono spostati nel Cestino/Trash del sistema operativo e non vengono eliminati automaticamente durante la fase di analisi.

## Interfaccia e motion

Il motion system segue il linguaggio del sito `_davstudios` v52 con easing condivisi, reveal, stagger, transizioni pagina, reveal radiale del tema e supporto a `prefers-reduced-motion`.

Su Windows la build Release usa il GUI subsystem per evitare una finestra CMD separata e una voce aggiuntiva in Alt+Tab.

## Release

Il workflow GitHub costruisce e pubblica automaticamente installer NSIS per Windows, Universal DMG per macOS e AppImage/DEB per Linux quando viene pubblicato un tag `v*` coerente con la versione del progetto. La Description bilingue 🇮🇹/🇺🇸 del commit associato al tag viene utilizzata come descrizione della GitHub Release; il workflow interrompe la pubblicazione se una delle due sezioni manca.

La v26.10.3 mantiene il parser di `Cargo.lock` compatibile con checkout LF e CRLF e verifica i lockfile prima della pubblicazione.
