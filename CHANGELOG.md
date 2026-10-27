# Changelog — Solitaire fără frontiere

Format: [SemVer](https://semver.org/lang/ro/) MAJOR.MINOR.PATCH. Istoricul versiunilor 1.x se află în secțiunea „Istoric / Changelog” din `README.ro.md`.

## 2.2.0 — 2026-10-27

### Adăugat
- **Rata MĂSURATĂ de găsire a unui plan**, afișată sub opțiunea „Doar înțelegeri rezolvabile”, pentru jocul curent (8 limbi; fr/it/es/pt/de/hu: traducere automată). Măsurătoare: 30 de înțelegeri (#1001–#1030) per joc, opțiunile implicite, limita aplicației (40 000 de noduri / 2,5 s), un singur calculator: FreeCell 97 %, Eight Off 97 %, Yukon 60 %, Pyramid 50 %, Klondike 47 %, Baker’s 43 %, Canfield 37 %, Tri Peaks 23 %, Scorpion 13 %, Clock 7 %, **Spider / Golf / Forty Thieves 0 %**. Nu este rata reală de rezolvabilitate (multe înțelegeri sunt rezolvabile, dar solverul nu le găsește în limită) și depinde de viteza dispozitivului; textul spune asta.
- Pentru jocurile cu rată măsurată 0 % (Spider, Golf, Forty Thieves) căutarea se oprește după **8 încercări** (în loc de 60), cu același mesaj de eșec: înainte, utilizatorul aștepta minute întregi fără șanse. Restul jocurilor păstrează 60 de încercări.
- Test nou: `tests/solv-rate.test.mjs` (9 verificări): tabela acoperă toate jocurile, plafonul de încercări, mesajele în 8 limbi, reproducerea ratelor pe probe (FreeCell/Eight Off ≥ 6 din 8; Spider/Golf 0), 0 cereri de rețea.

### NU implementat
- **Garanția de soluție pentru Spider / Forty Thieves / Golf**: solverul actual nu găsește planuri acolo (≈1,3k noduri/s la Spider și atinge limita de căutare); ar cere un solver nou, nu o modificare sigură. Rămâne documentat, nu simulat.
- „Mod multiplayer local unificat”: planificat.

## 2.1.0 — 2026-10-27

### Adăugat
- **Statistici locale: serii de victorii.** Două coloane noi în tabelul „Statistici”: *Serie curentă* și *Cea mai lungă serie*, per joc și set de opțiuni. Seria crește la fiecare victorie și revine la 0 când începi o partidă nouă (același joc și aceleași opțiuni) fără să o fi câștigat pe cea precedentă; recordul se păstrează. Datele vechi (`sol.stats.v1`) se încarcă fără migrare. Textele sunt în cele 8 limbi (fr/it/es/pt/hu/de: traduceri automate, neverificate nativ).
- Test nou: `tests/stats-streak.test.mjs` (serii, abandon, compatibilitate cu date vechi, tabelul din dialog).

### Deja prezent (din v2.0.0), fără modificări în acest PR
- **Garanția că înțelegerea are soluție:** opțiunea „Doar înțelegeri rezolvabile (verificate)” – solverul local găsește un plan câștigător și îl reia mutare cu mutare înainte să accepte înțelegerea; „Sugestie” și „Rezolvă automat” folosesc apoi planul. Verificat în `tests/solvable-daily.test.mjs` pentru FreeCell, Klondike și Eight Off. La Spider și Forty Thieves solverul găsește rar soluții și căutarea poate eșua (limită 60 de încercări); aplicația spune acest lucru.
- Provocarea zilei (seed determinist din dată și joc).

### Neschimbat
- Offline: un singur `index.html`, fără CDN, fără urmărire, fără conturi. Hash-urile CSP ale scripturilor inline au fost recalculate.
- „Mod multiplayer local unificat” între jocurile de cărți: **planificat**, nu implementat.
