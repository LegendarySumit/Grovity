const { test, expect } = require('@playwright/test');

const pages = [
  { path: '/index.html', title: /Grovity/i },
  { path: '/login.html', title: /Login/i },
  { path: '/signup.html', title: /Sign Up/i },
  { path: '/health.html', title: /Health/i }
];

test.describe('public navigation smoke', () => {
  for (const pageMeta of pages) {
    test(`loads ${pageMeta.path}`, async ({ page }) => {
      await page.goto(pageMeta.path, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveTitle(pageMeta.title);
    });
  }

  test('home nav reaches auth pages', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    await page.getByRole('link', { name: 'Login' }).first().click();
    await expect(page).toHaveURL(/login\.html$/);

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await expect(page).toHaveURL(/signup\.html$/);
  });
});
