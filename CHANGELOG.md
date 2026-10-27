# Changelog — Solitaire fără frontiere

Format: [SemVer](https://semver.org/lang/ro/) MAJOR.MINOR.PATCH. Istoricul versiunilor 1.x se află în secțiunea „Istoric / Changelog” din `README.ro.md`.

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
