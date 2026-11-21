---
name: wydanie
description: Wydaje nową wersję projektu (SemVer, CHANGELOG.md, commit i tag z adnotacją). Uruchamia go tylko użytkownik przez /wydanie.
disable-model-invocation: true
allowed-tools: Bash(git status:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git tag:*), Bash(npm test:*), Bash(npm run lint:*), PowerShell(git status:*), PowerShell(git log:*), PowerShell(git add:*), PowerShell(git commit:*), PowerShell(git tag:*), PowerShell(npm test:*), PowerShell(npm run lint:*)
---

# Wydanie nowej wersji

1. Sprawdź, czy drzewo robocze jest czyste (`git status`). Jeśli nie, zatrzymaj się i zapytaj.
2. Uruchom testy i lintery projektu (w projektach npm: `npm test` i `npm run lint`, o ile te skrypty są w `package.json`; inne polecenia znajdziesz w `CLAUDE.md`). Wszystkie muszą przejść. Jeśli projekt nie ma ani testów, ani linterów, powiedz o tym i zapytaj, czy kontynuować.
3. Ustal numer nowej wersji według SemVer: poprawki to patch, nowe funkcje to minor, zmiany niezgodne wstecz to major. Jeśli nie jest to jasne, zapytaj.
4. Zmień numer wersji w pliku, w którym projekt go trzyma (np. `version` w `package.json`). W projektach npm zmień go ręcznie, bez `npm version`, żeby nie tworzyć taga za wcześnie. Jeśli nie wiadomo, gdzie jest wersja, zapytaj.
5. Dopisz na górze `CHANGELOG.md` sekcję `## [X.Y.Z]` z listą zmian od ostatniego taga (`git log vPOPRZEDNI..HEAD --oneline`, a przy pierwszym wydaniu cała historia). Jeśli pliku nie ma, utwórz go.
6. Zrób commit `Wydanie X.Y.Z` z plikiem wersji i `CHANGELOG.md`.
7. Utwórz tag z adnotacją: `git tag -a vX.Y.Z -m "Wydanie X.Y.Z"`.
8. Niczego nie wypychaj na zdalne repozytorium. Na koniec pokaż `git log -1` i listę tagów.
