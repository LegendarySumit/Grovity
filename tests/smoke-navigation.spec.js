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

    const desktopLogin = page.locator('#navLoginBtn');
    if (await desktopLogin.isVisible()) {
      await desktopLogin.click();
    } else {
      await page.locator('#menuBtn').click();
      await page.locator('#sidebarLoginBtn').click();
    }
    await expect(page).toHaveURL(/login\.html$/);

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const desktopSignup = page.locator('#navSignupBtn');
    if (await desktopSignup.isVisible()) {
      await desktopSignup.click();
    } else {
      await page.locator('#menuBtn').click();
      await page.locator('#sidebarSignupBtn').click();
    }
    await expect(page).toHaveURL(/signup\.html$/);
  });
});
