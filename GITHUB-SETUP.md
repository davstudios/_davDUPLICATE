# GitHub setup

1. Crea una repository chiamata `_davDUPLICATE`.
2. Copia il contenuto del progetto nella root.
3. Esegui `npm test` e prova l'app con `npm run desktop`.
4. Fai commit e push.
5. Per pubblicare la release stabile crea il tag:

```bash
git tag -a v1.0.1 -m "Release _davDUPLICATE v1.0.1"
git push origin v1.0.1
```

GitHub Actions creerà le build Windows, macOS e Linux e le allegherà alla release stabile. Il workflow può anche essere avviato manualmente indicando un tag già esistente.
