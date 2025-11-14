
import { test, expect } from '@playwright/test';

test.describe('Application UI/UX Verification', () => {
  const EMAIL = 'jules.agent@example.com';
  const PASSWORD = 'M0tDeP@sseS3curis3!';

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/auth');
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/');
    await page.waitForSelector('h1:has-text("Tableau de bord")');
  });

  test('Vérification de la nouvelle page d\'accueil', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Tableau de bord');
    await expect(page.locator('[data-testid="stats-banner"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Ajouter du contenu"]')).toBeVisible();
    await page.screenshot({ path: '/home/jules/workspace/verification/01_homepage_after.png', fullPage: true });
  });

  test('Vérification du modal "Ajouter du contenu"', async ({ page }) => {
    await page.click('button[aria-label="Ajouter du contenu"]');
    await page.waitForSelector('h2:has-text("Que souhaitez-vous créer ?")');
    await expect(page.locator('button:has-text("Flashcard unique")')).toBeVisible();
    await expect(page.locator('button:has-text("Importer en masse")')).toBeVisible();
    await expect(page.locator('button:has-text("Nouveau cours")')).toBeVisible();
    await page.screenshot({ path: '/home/jules/workspace/verification/02_add_content_modal.png' });
    await page.click('button[aria-label="Fermer le modal"]');
    await expect(page.locator('h2:has-text("Que souhaitez-vous créer ?")')).not.toBeVisible();
  });

  test('Vérification de la page Flashcards et du basculement de vue', async ({ page }) => {
    await page.click('a[aria-label="Flashcards"]');
    await page.waitForURL('http://localhost:5173/flashcards');
    await page.waitForSelector('h1:has-text("Mes Flashcards")');

    // Default view is grid
    await expect(page.locator('[data-testid="flashcards-grid-view"]')).toBeVisible();
    await expect(page.locator('text=Aucune flashcard trouvée.')).toBeVisible();
    await page.screenshot({ path: '/home/jules/workspace/verification/03_flashcards_grid_view_empty.png', fullPage: true });

    // Switch to list view
    await page.click('button[aria-label="Afficher en liste"]');
    await expect(page.locator('[data-testid="flashcards-list-view"]')).toBeVisible();
    await expect(page.locator('text=Aucune flashcard trouvée.')).toBeVisible();
    await page.screenshot({ path: '/home/jules/workspace/verification/04_flashcards_list_view_empty.png', fullPage: true });
  });
});
