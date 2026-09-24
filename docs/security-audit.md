# Security-Audit (KT11)

Stand: 24.09.2026 · Branch `feature/Responsive-Security`

## 1. Code-Audit (Aufgabe 4)

Gesucht über `src/`: `innerHTML`, `outerHTML`, `bypassSecurityTrust`, `DomSanitizer`, `eval(`,
`new Function`, `document.write`, `insertAdjacentHTML`, `redirect`, `location.href/replace/assign`,
`window.open`.

| Check                                              | Ergebnis                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------ |
| `[innerHTML]` / `outerHTML` / `insertAdjacentHTML` | 0 Treffer                                                                      |
| `bypassSecurityTrust*` / `DomSanitizer`            | 0 Treffer                                                                      |
| `eval` / `new Function` / `document.write`         | 0 Treffer                                                                      |
| Interpolation `{{ }}`                              | Überall (Titel, Autor, Inhalt, Username). Angular escaped automatisch → sicher |
| URL-Redirects                                      | 2 Treffer, siehe Findings                                                      |

### Findings

| Nr. | Datei                                   | Problem                                                                                                                                                                                                                                                                                                             | Risiko  | Fix                                                                                                                                                                                                    |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `feature/auth/login-page/login-page.ts` | **Open Redirect:** `returnUrl` kam ungeprüft aus dem Query-Parameter und wurde als Redirect-Ziel an den BFF weitergereicht. `/login?returnUrl=https://evil.example` hätte den User nach dem Login auf eine fremde Seite geschickt (Phishing). `encodeURIComponent` schützt nicht, es kodiert nur für den Transport. | Hoch    | **Behoben.** Nur interne Pfade zulassen (`/^\/(?![/\\])/`), sonst Fallback `/`. Blockt absolute URLs, protokoll-relative `//evil`, `/\evil` und `javascript:`. Abgesichert durch `login-page.spec.ts`. |
| 2   | `services/auth-store.ts`                | `window.location.href = data.logoutUrl` — Redirect auf eine URL aus einem Response-Body                                                                                                                                                                                                                             | Niedrig | Kein Fix nötig: Die URL stammt vom eigenen BFF, nicht vom User. Geprüft und akzeptiert.                                                                                                                |
| 3   | `feature/blog/blog-card/blog-card.html` | `[src]="imageUrl"` mit Bild-URLs aus dem geteilten Klassen-Backend (andere Studierende schreiben dort)                                                                                                                                                                                                              | Niedrig | Kein Fix nötig: Angular sanitized `img[src]` automatisch (`SecurityContext.URL`), `javascript:`-URLs werden entfernt.                                                                                  |

## 2. Auth Guards (Aufgabe 5)

| Route                  | Guard                   | Soll          |
| ---------------------- | ----------------------- | ------------- |
| `''` (Übersicht)       | –                       | öffentlich ✅ |
| `blog/:id`             | –                       | öffentlich ✅ |
| `add-blog`             | `canMatch: [authGuard]` | geschützt ✅  |
| `login`, `about`, `**` | –                       | öffentlich ✅ |

`authGuard` wartet auf `authStore.ready`, leitet nicht eingeloggte User auf `/login?returnUrl=…` und
eingeloggte User ohne Rolle `user` auf `/login?error=access_denied`. Admin-Routen gibt es nicht.
`canMatch` statt `canActivate`: Der Lazy-Chunk wird bei fehlender Berechtigung gar nicht geladen.

## 3. Content Security Policy (Aufgabe 7)

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com; connect-src 'self' https://d-cap-blog-backend---v2.whitepond-b96fee4b.westeurope.azurecontainerapps.io; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

Scripts nur von `'self'`, Styles von `'self'` plus `'unsafe-inline'` (Angular Material setzt Inline-Styles).
Alles andere ist über `default-src 'self'` blockiert. Die Ausnahmen sind genau die Quellen, die die App braucht:

| Direktive     | Ausnahme               | Grund                                           |
| ------------- | ---------------------- | ----------------------------------------------- |
| `style-src`   | `fonts.googleapis.com` | Roboto + Material Icons (`index.html`)          |
| `font-src`    | `fonts.gstatic.com`    | Font-Dateien der Google Fonts                   |
| `img-src`     | `data:`                | Bilder im Live-Backend sind Base64-`data:`-URIs |
| `img-src`     | `images.unsplash.com`  | Header-Bilder der Mock-Daten (`blogs.json`)     |
| `connect-src` | Azure-Backend          | Blog-API (`shared/blog.ts`)                     |

**Wo konfiguriert:**

- **Dev-Server** (`ng serve`): echter HTTP-Header in `angular.json` → `serve.options.headers`.
  Zusätzlich `http://localhost:7071` (lokaler BFF) und `ws://localhost:*` (Live-Reload).
- **Produktion:** `<meta http-equiv>` in `src/index.prod.html`, per `configurations.production.index`
  als `index.html` ausgeliefert. Grund: Azure Storage Static Website kann keine eigenen Response-Header
  setzen. Der Meta-Tag steckt bewusst **nicht** in `src/index.html`, sonst gälte er im Dev-Server
  zusätzlich zum Header und würde den lokalen BFF blockieren.

**Bekannte Lücke:** `frame-ancestors` wirkt im Meta-Tag nicht — in Produktion fehlt damit der
Clickjacking-Schutz. Beheben liesse sich das erst mit einem Hosting, das Header setzen kann
(z. B. Azure Static Web Apps mit `globalHeaders` in `staticwebapp.config.json`).

## 4. `npm audit` (Experte)

Ausgeführt am 24.09.2026: **21 Findings** — 0 critical, 10 high, 9 moderate, 2 low.

### Produktions-Abhängigkeiten (`npm audit --omit=dev`): 3 moderate

| Paket                                        | Advisory                                                                                                                  | Betroffen | Relevanz für dieses Projekt                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `@angular/common` 22.0.8                     | [GHSA-p297-fm68-3q8c](https://github.com/advisories/GHSA-p297-fm68-3q8c) Information Leak via `HttpTransferCache`         | < 22.1.1  | Nicht ausnutzbar: kein SSR, kein `HttpTransferCache`                                           |
| `@angular/core` / `@angular/compiler` 22.0.8 | [GHSA-hh8m-fm6v-7cvg](https://github.com/advisories/GHSA-hh8m-fm6v-7cvg) Sanitization-Bypass über Directive-Host-Bindings | < 22.1.0  | Gering: keine eigenen Host-Bindings; betrifft nur Bindings auf sicherheitsrelevante Properties |

**Empfehlung:** `ng update @angular/core @angular/cli` auf ≥ 22.1.1 (aktuell 22.2.0). Nicht per
`npm audit fix`, weil das nur die drei betroffenen Pakete anheben und die übrigen Angular-Pakete
auf 22.0.8 lassen würde (Versions-Mismatch). Der wöchentliche `ng-update`-Workflow übernimmt das ohnehin.

### Dev-Abhängigkeiten: 18 Findings (10 high, 6 moderate, 2 low)

Betroffen sind ausschliesslich Build- und Test-Werkzeuge, transitiv über Angular CLI, Vitest, ESLint und
Playwright: `undici`, `hono`, `fast-uri`, `ip-address`, `postcss`, `browserslist`, `immutable`,
`js-yaml`, `nanoid`, `brace-expansion`, `qs`, `body-parser`, `esbuild`, `vitest`, u. a.

Keines dieser Pakete landet im Browser-Bundle. Die Schwachstellen (überwiegend DoS, Path Traversal
auf Windows, SSRF in Server-Adaptern) setzen einen Angreifer voraus, der präparierte Eingaben an die
lokale Toolchain liefert. Behebung über die regulären Dependabot-/`ng-update`-PRs; alle Fixes sind
ohne Major-Update verfügbar.
