import { expect, test } from '@playwright/test'

test.describe('Marketing homepage experience', () => {
  test('renders localized markdown content and switches language dynamically', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: '观 · 界' })).toBeVisible()
    await expect(page.getByText('影像为入口 · 文字为结构', { exact: false })).toBeVisible()

    // Use a more specific selector for the language toggle button
    await page.locator('div.flex.items-center.rounded-full.border >> button', { hasText: 'EN' }).click()

    await expect(page.getByRole('heading', { level: 1, name: 'Vision & World' })).toBeVisible()
    await expect(page.getByText('Images as the entry · Words as the structure', { exact: false })).toBeVisible()
  })
})
