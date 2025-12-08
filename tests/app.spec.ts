import { test, expect } from '@playwright/test';

test.describe('EMDR Protokolle App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sollte die Startseite laden', async ({ page }) => {
    // Prüfe ob der Titel korrekt ist
    await expect(page).toHaveTitle(/EMDR/);
    
    // Prüfe ob der Header sichtbar ist
    await expect(page.getByRole('heading', { name: 'EMDR Protokolle' })).toBeVisible();
  });

  test('sollte die Hauptnavigation anzeigen', async ({ page }) => {
    // Prüfe ob die Tabs vorhanden sind (verwende Button-Rolle für Tab-Buttons)
    await expect(page.getByRole('button', { name: 'Protokollübersicht' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Protokoll bearbeiten' })).toBeVisible();
  });

  test('sollte den "Neues Protokoll" Button anzeigen', async ({ page }) => {
    // Prüfe ob der Button zum Erstellen eines neuen Protokolls sichtbar ist (exakter Name)
    const newButton = page.getByRole('button', { name: 'Neues Protokoll', exact: true });
    await expect(newButton).toBeVisible();
  });

  test('sollte zum Editor wechseln wenn "Neues Protokoll" geklickt wird', async ({ page }) => {
    // Klicke auf "Neues Protokoll" (exakter Name)
    await page.getByRole('button', { name: 'Neues Protokoll', exact: true }).click();
    
    // Prüfe ob der Editor sichtbar wird (Abbrechen-Button existiert nur im Editor)
    await expect(page.getByRole('button', { name: /Abbrechen/i })).toBeVisible();
  });

  test('sollte den Footer mit Copyright anzeigen', async ({ page }) => {
    // Prüfe ob der Footer sichtbar ist
    const currentYear = new Date().getFullYear().toString();
    await expect(page.getByText(new RegExp(`© ${currentYear}`))).toBeVisible();
  });

  test('sollte die Auto-Speichern Anzeige zeigen', async ({ page }) => {
    // Prüfe ob die Auto-Speichern Anzeige sichtbar ist
    await expect(page.getByText('Auto-Speichern aktiv')).toBeVisible();
  });
});

test.describe('Protokoll-Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Öffne den Editor (exakter Name)
    await page.getByRole('button', { name: 'Neues Protokoll', exact: true }).click();
  });

  test('sollte Formularfelder im Editor anzeigen', async ({ page }) => {
    // Prüfe ob grundlegende Formularelemente vorhanden sind
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('sollte einen Abbrechen-Button haben', async ({ page }) => {
    const cancelButton = page.getByRole('button', { name: /Abbrechen/i });
    await expect(cancelButton).toBeVisible();
  });

  test('sollte zur Liste zurückkehren wenn Abbrechen geklickt wird', async ({ page }) => {
    await page.getByRole('button', { name: /Abbrechen/i }).click();
    
    // Prüfe ob wir wieder in der Protokollübersicht sind (Heading)
    await expect(page.getByRole('heading', { name: 'Protokollübersicht' })).toBeVisible();
  });
});

