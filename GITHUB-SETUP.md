# GitHub setup

1. Crea o usa la repository pubblica `_davDUPLICATE`.
2. Copia il contenuto del progetto nella root senza eliminare la cartella locale `.git`.
3. Esegui `npm test` e prova l'app con `npm run desktop` quando necessario.
4. In GitHub Desktop usa come Summary `_davDUPLICATE v26.10.1` e inserisci nella Description le modifiche complete in formato bilingue `🇮🇹 ...` e `🇺🇸 ...`.
5. Fai commit e Push Origin.
6. Pubblica la release creando il tag:

```bash
git tag -a v26.10.1 -m "Release _davDUPLICATE v26.10.1"
git push origin v26.10.1
```

GitHub Actions creerà le build Windows, macOS e Linux e userà automaticamente la Description del commit taggato come testo della GitHub Release. Il workflow rifiuta una Description vuota o priva di entrambe le sezioni `🇮🇹` e `🇺🇸`.
