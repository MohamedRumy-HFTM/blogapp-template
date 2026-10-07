import { expect, test, type Page } from '@playwright/test';

// Akzeptanzkriterien: docs/testing.md → Aufgabe 4
// Das Live-Backend wird von der ganzen Klasse befüllt: keine festen Anzahlen oder Titel prüfen.
test.describe('Blog-Liste', () => {
  const cards = (page: Page) => page.locator('app-blog-card');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('AK1: zeigt beim Laden Blog-Einträge an', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
    await expect(cards(page).first()).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeHidden();
  });

  test('AK2: jeder Blog-Eintrag zeigt Titel und Zusammenfassung', async ({ page }) => {
    await expect(cards(page).first()).toBeVisible();

    for (const card of await cards(page).all()) {
      await expect(card.locator('mat-card-title')).toHaveText(/\S/);
      await expect(card.locator('mat-card-content p')).toHaveText(/\S/);
    }
  });

  test('AK3: Autor-Filter zeigt nur Einträge des gewählten Autors', async ({ page }) => {
    const subtitles = page.locator('app-blog-card mat-card-subtitle');
    await expect(subtitles.first()).toBeVisible();

    // Option 0 ist "Alle Autoren", Option 1 der erste echte Autor
    const filter = page.getByLabel('Autor');
    const author = (await filter.locator('option').nth(1).textContent())!.trim();
    const expected = (await subtitles.allTextContents()).filter(
      (text) => text.trim() === `Von ${author}`,
    ).length;

    await filter.selectOption(author);

    // Gleiche Anzahl Karten wie vorher von diesem Autor, und jede davon exakt "Von <author>"
    await expect(subtitles).toHaveText(Array(expected).fill(`Von ${author}`));
  });
});
