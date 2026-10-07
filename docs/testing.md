# Testing (KT12)

Stand: 07.10.2026 · Branch `feature/Unit-E2E-Testing`

| Was                         | Befehl                                         | Ergebnis                                 |
| --------------------------- | ---------------------------------------------- | ---------------------------------------- |
| Unit Tests (Vitest)         | `npm test` / `npm run test:ci`                 | 42 Tests in 12 Dateien grün (vorher 19)  |
| E2E Tests (Playwright, Dev) | `npx playwright test` (startet `ng serve`)     | 7 Tests grün                             |
| E2E Tests (wie CI)          | `npm run build && CI=true npx playwright test` | 7 Tests grün, 3× wiederholt stabil       |
| Coverage                    | `npm run test:ci`                              | Functions 49 % → 68 %, Lines 70 % → 75 % |

**Vitest-Setup:** `npx vitest --version` → 4.1.8. Gestartet werden die Tests aber mit `ng test`, nicht mit
`npx vitest`. Vitest läuft hier über den Angular-Builder `@angular/build:unit-test`, der die Templates
kompiliert und jsdom einrichtet (`src/test-setup.ts`). Ein direktes `npx vitest run` schlägt fehl
(13 von 13 Dateien rot): Es fehlt die Angular-Kompilierung, und Vitest sammelt zusätzlich die
Playwright-Dateien in `e2e/` ein.

## Aufgabe 1 + 3: `BlogStateService` (`services/blog-state.spec.ts`)

Die Spec heisst wie die Service-Datei `blog-state.ts` (Angular-22-Namensschema ohne `.service`).
`BlogService` wird mit `vi.fn()` gemockt, es läuft also kein HTTP-Call. Den Store treiben die Tests
nur über seine öffentlichen Actions, denn `#state` ist privat und soll es auch bleiben.

| Bereich           | Tests                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Service (A1)      | leere Liste zu Beginn · `loading()` erst `true`, dann `false` · `blogCount()` · Backend-Fehler → `error()`                           |
| `computed()` (A3) | `blogCount()` 3 → 0 · `authors()` / `filteredBlogs()` folgen `setAuthor()` · `toggleLike()` +1/−1                                    |
| `effect()` (A3)   | Spy auf `Storage.prototype.setItem` + `TestBed.tick()` · Autor wird aus `localStorage` wiederhergestellt                             |
| Edge Cases (A3)   | `localStorage` leer (`null`) → `'all'` · leeres Array · unbekannter Autor · unbekannte ID · Fehler wird beim nächsten Laden gelöscht |

**`null` / `undefined`:**

- Aus dem Backend erreicht `null`/`undefined` den Store gar nicht. `BlogService` validiert mit zod und
  wirft bei ungültigen Daten (`shared/blog.spec.ts`), der Store landet dann im Fehlerzustand.
- Der `blogResolver` liefert `undefined`, wenn eine ID unbekannt ist oder das Backend nicht antwortet
  (`blog.resolver.spec.ts`). Die Detailseite zeigt dann „Blog-Post nicht gefunden.“
  (`blog-detail-page.spec.ts`).

Warum der Spy auf dem Prototyp sitzt: jsdom liefert ein echtes `Storage`. Ein
`vi.spyOn(localStorage, 'setItem')` würde über den Named-Property-Setter nur einen Eintrag namens
`setItem` anlegen und keinen einzigen Aufruf aufzeichnen.

## Aufgabe 2: `BlogCard` (`feature/blog/blog-card/blog-card.spec.ts`)

Shallow Test: Nur die Karte wird gerendert, Inputs werden per `componentRef.setInput('model', …)` gesetzt.
Die Tests prüfen: Komponente wird erstellt · Titel, Autor und Vorschau werden angezeigt · der Titel
verlinkt auf `/blog/1` · Klick auf Like emittiert `liked` mit der Blog-ID · Like-Status (Icon und
Zähler) · das Headerbild erscheint nur, wenn eine URL gesetzt ist.

## Aufgabe 4: E2E Blog-Liste mit AI (`e2e/blog-list.spec.ts`)

### Akzeptanzkriterien: Blog-Liste

1. Wenn die Seite geladen wird, werden Blog-Einträge angezeigt.
2. Jeder Blog-Eintrag zeigt einen Titel und eine Zusammenfassung.
3. Wählt man im Autor-Filter einen Autor aus, werden nur noch Blog-Einträge dieses Autors angezeigt.

### Prompt

```
Schreibe einen Playwright E2E-Test für diese Akzeptanzkriterien:
[Kriterien 1–3]
Die App läuft auf http://localhost:4200.
Nutze TypeScript und @playwright/test.
```

Die KI hat nur den Prompt gesehen, nicht den Code der App.

<details>
<summary>AI-Entwurf (unverändert)</summary>

```ts
import { expect, test, type Page } from '@playwright/test';

// Annahmen (an die echte App anpassen, falls abweichend):
// - Jeder Blog-Eintrag ist ein <article> mit Titel als Überschrift (h1-h6) und Zusammenfassung als <p>.
// - Der Autor-Filter ist ein <select> mit Label "Autor"; der Autorenname steht im Eintrag.
const entries = (page: Page) => page.getByRole('article');

test.describe('Blog-Liste', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('zeigt beim Laden Blog-Einträge an', async ({ page }) => {
    await expect(entries(page).first()).toBeVisible();
    expect(await entries(page).count()).toBeGreaterThan(0);
  });

  test('jeder Blog-Eintrag zeigt Titel und Zusammenfassung', async ({ page }) => {
    await expect(entries(page).first()).toBeVisible();

    for (const entry of await entries(page).all()) {
      const title = entry.getByRole('heading').first();
      await expect(title).toBeVisible();
      await expect(title).not.toHaveText(/^\s*$/);

      const summary = entry.locator('p').first();
      await expect(summary).toBeVisible();
      await expect(summary).not.toHaveText(/^\s*$/);
    }
  });

  test('Autor-Filter zeigt nur Einträge des gewählten Autors', async ({ page }) => {
    await expect(entries(page).first()).toBeVisible();
    const countBefore = await entries(page).count();

    const filter = page.getByLabel(/autor/i);
    const options = await filter.locator('option').allTextContents();
    // Platzhalter wie "Alle" oder leere Option überspringen
    const author = options.map((o) => o.trim()).find((o) => o && !/^(alle|all|bitte|--)/i.test(o));
    expect(author, 'Autor-Filter enthält mindestens einen Autor').toBeTruthy();

    await filter.selectOption({ label: author! });

    await expect
      .poll(async () => {
        const texts = await entries(page).allTextContents();
        return texts.length > 0 && texts.every((t) => t.includes(author!));
      })
      .toBe(true);

    expect(await entries(page).count()).toBeLessThanOrEqual(countBefore);
  });
});
```

</details>

### Review und Ausführung

Ausgeführt gegen den Prod-Build: **alle 3 Tests rot** (`getByRole('article')` → `element(s) not found`).
Immerhin hat die KI ihre Annahmen selbst als Kommentar markiert, das macht das Review einfacher.

| Problem im Entwurf                                                                             | Korrektur                                                                                                   |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Annahme `<article>`: `<mat-card>` hat keine `article`-Rolle                                    | `app-blog-card` als Eintrag                                                                                 |
| Annahme „Titel als Überschrift“: `<mat-card-title>` ist ein eigenes Element ohne Heading-Rolle | `mat-card-title` bzw. `mat-card-content p` für Titel und Zusammenfassung                                    |
| `page.goto('http://localhost:4200')` umgeht die `baseURL` aus `playwright.config.ts`           | `page.goto('/')`                                                                                            |
| Filter: `t.includes(author)` ist ein Teilstring-Vergleich (Autor `anna` träfe auch `anna-b`)   | `toHaveText([...])` vergleicht jede Karte exakt mit `Von <Autor>` und prüft zusätzlich die erwartete Anzahl |
| `toBeLessThanOrEqual(countBefore)` ist auch ohne funktionierenden Filter erfüllt               | siehe oben: erwartete Anzahl wird vor dem Filtern aus der Seite gezählt                                     |
| Keine Rücksicht auf das geteilte Klassen-Backend                                               | bewusst keine festen Anzahlen oder Titel. Erwartungswerte werden zur Laufzeit aus der Seite gelesen         |

Nach den Korrekturen: 3/3 grün.

## Aufgabe 5: E2E Blog-Detail & Navigation (`e2e/blog-detail.spec.ts`)

### Akzeptanzkriterien: Blog-Detail & Navigation

1. Klickt man in der Blog-Übersicht auf den Titel eines Eintrags, öffnet sich dessen Detailseite (URL `/blog/<id>`).
2. Die Detailseite zeigt denselben Titel als Überschrift und den Autor an.
3. Über den Link „Zurück zur Übersicht“ gelangt man wieder zur Blog-Liste.
4. Eine unbekannte URL zeigt eine 404-Seite an.
5. Ruft man `/add-blog` ohne Login auf, wird man auf die Login-Seite weitergeleitet.
6. _(im Review ergänzt)_ Die Detailseite funktioniert auch beim Direktaufruf bzw. Reload.

Der Prompt ist derselbe wie in Aufgabe 4, nur mit den Kriterien 1–5.

<details>
<summary>AI-Entwurf (unverändert)</summary>

```ts
import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://localhost:4200' });

test.describe('Blog-Detail & Navigation', () => {
  test('Detailseite zeigt Titel und Autor, Zurück-Link führt zur Liste', async ({ page }) => {
    // Übersicht laden und ersten Blog-Eintrag (Link auf /blog/<id>) wählen
    await page.goto('/');
    const titleLink = page.locator('a[href*="/blog/"]').first();
    await expect(titleLink).toBeVisible();
    const title = (await titleLink.innerText()).split('\n')[0].trim();

    // AK 1: Klick auf den Titel öffnet die Detailseite /blog/<id>
    await titleLink.click();
    await expect(page).toHaveURL(/\/blog\/[^/]+$/);

    // AK 2: Titel als Überschrift und Autor werden angezeigt
    await expect(page.getByRole('heading', { name: title }).first()).toBeVisible();
    await expect(page.getByText(/Autor|Author/i).first()).toBeVisible();

    // AK 3: "Zurück zur Übersicht" führt zurück zur Blog-Liste
    await page.getByRole('link', { name: 'Zurück zur Übersicht' }).click();
    await expect(page).not.toHaveURL(/\/blog\/[^/]+$/);
    await expect(page.locator('a[href*="/blog/"]').first()).toBeVisible();
  });

  test('unbekannte URL zeigt 404-Seite', async ({ page }) => {
    // AK 4
    await page.goto('/diese-seite-gibt-es-nicht');
    await expect(page.getByText(/404|nicht gefunden/i).first()).toBeVisible();
  });

  test('/add-blog ohne Login leitet auf Login-Seite weiter', async ({ page }) => {
    // AK 5
    await page.goto('/add-blog');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

</details>

### Review und Ausführung

Ausgeführt gegen den Prod-Build: 1 rot, 2 grün. Die beiden grünen Tests prüfen aber zu wenig.

| Problem im Entwurf                                                                          | Korrektur                                                                 |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **rot:** `getByText(/Autor/)`: Die App schreibt „Von &lt;Name&gt;“, nicht „Autor“           | `.author` muss exakt dem Untertitel der Karte entsprechen                 |
| 404: `/404\|nicht gefunden/` wäre auch bei „Blog-Post nicht gefunden.“ grün (falsche Seite) | `h1` muss exakt `404 – Seite nicht gefunden` sein                         |
| Login: `/\/login/` prüft nicht, ob `returnUrl` mitgegeben wird                              | URL muss `/login?returnUrl=%2Fadd-blog` sein, plus Überschrift „Login“    |
| Zurück: `not.toHaveURL(/blog/)` ist auch bei einer Fehlerseite erfüllt                      | Überschrift „Blog“ und mindestens eine Karte müssen sichtbar sein         |
| `a[href*="/blog/"]` + `split('\n')`: fragiler Selektor und Text-Hack                        | Titel aus `mat-card-title` der ersten Karte, Link per `getByRole('link')` |
| `test.use({ baseURL })` dupliziert die Konfiguration aus `playwright.config.ts`             | entfernt                                                                  |

### Bug gefunden: Detailseite beim Reload „nicht gefunden“

Beim Review fiel auf: Ein Test, der nur in der App klickt, verpasst den Direktaufruf. Der
`blogResolver` las nur den Cache von `BlogService`, und der enthält nach einem Reload erst die
Mock-Daten (`blogs.json`, IDs 1–6). Ein geteilter Link wie `/blog/862` zeigte deshalb „Blog-Post nicht
gefunden.“, obwohl es den Blog im Backend gibt.

- **Test zuerst:** AK6 lädt `/blog/<id>` direkt. Gegen den alten Build war er **rot**.
- **Fix:** `blog.resolver.ts` lädt bei einem Cache-Miss vom Backend nach. Schlägt das Laden fehl,
  bleibt es bei der „nicht gefunden“-Anzeige.
- **Unit-Test:** `blog.resolver.spec.ts` deckt Cache-Treffer, Nachladen, unbekannte ID und Backend-Fehler ab.
- Danach: 7/7 E2E-Tests grün.

## Kontrolle: Fangen die Tests echte Fehler? (Mutationsprobe)

Absichtlich kaputter Produktionscode, danach wurden die Tests erneut ausgeführt. Jede Mutante muss mindestens
einen Test rot machen.

| Mutante                                               | Gefangen von                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| `loadBlogs()` setzt `loading` nicht auf `true`        | `should update loading state`                                        |
| `effect()` schreibt nicht mehr in `localStorage`      | `effect() persists the selected author to localStorage`              |
| `blogCount()` zählt `filteredBlogs()` statt `blogs()` | `authors() and filteredBlogs() follow …` (erst nachträglich ergänzt) |
| Resolver ohne Nachladen (alter Stand)                 | `loads from the backend on a cache miss` + E2E AK6                   |
| Resolver ohne `try/catch`                             | `returns undefined when the backend fails`                           |

Die dritte Mutante hat zunächst überlebt. Daraufhin legt der Test jetzt fest, dass `blogCount()` alle
Blogs zählt, unabhängig vom Filter.

## Bonus: Screenshots bei Fehlern

`playwright.config.ts` → `use.screenshot: 'only-on-failure'`. Beim roten AK6-Lauf wurde der Screenshot
nach `test-results/…/test-failed-1.png` geschrieben (der Ordner ist in `.gitignore`).
