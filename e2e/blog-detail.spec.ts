import { expect, test } from '@playwright/test';

// Akzeptanzkriterien: docs/testing.md → Aufgabe 5
test.describe('Blog-Detail & Navigation', () => {
  test('AK1–3: Titel öffnet die Detailseite, Zurück-Link führt zur Liste', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('app-blog-card').first();
    const title = (await card.locator('mat-card-title').textContent())!.trim();
    const author = (await card.locator('mat-card-subtitle').textContent())!.trim();

    await card.getByRole('link', { name: title }).click();

    await expect(page).toHaveURL(/\/blog\/\d+$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('.author')).toHaveText(author);

    await page.getByRole('link', { name: 'Zurück zur Übersicht' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
    await expect(page.locator('app-blog-card').first()).toBeVisible();
  });

  test('AK4: unbekannte URL zeigt die 404-Seite', async ({ page }) => {
    await page.goto('/diese-seite-gibt-es-nicht');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('404 – Seite nicht gefunden');
  });

  test('AK5: /add-blog ohne Login leitet auf die Login-Seite um', async ({ page }) => {
    await page.goto('/add-blog');

    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fadd-blog$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Login');
  });

  // Im Review gefunden: der Resolver kannte beim Direktaufruf nur die Mock-Daten
  test('AK6: Detailseite funktioniert auch beim Direktaufruf (Reload)', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('app-blog-card mat-card-title a').first();
    const title = (await link.textContent())!.trim();
    const href = (await link.getAttribute('href'))!;

    await page.goto(href);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  });
});
