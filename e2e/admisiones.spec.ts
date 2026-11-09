import { expect, test } from '@playwright/test'
import { expectNoHorizontalScroll, signInAs } from './helpers'

test('un aspirante se registra y administración lo ve en su lista', async ({ page }) => {
  const nombre = `Aspirante E2E ${Date.now()}`
  await page.goto('/aspirantes/registro')
  await expectNoHorizontalScroll(page)

  await page.getByPlaceholder('Nombre(s) y apellidos').fill(nombre)
  await page.getByPlaceholder('18 caracteres').fill('PEPJ900101HDFRRN09')
  await page.getByPlaceholder('10 dígitos').fill('5512345678')
  await page.getByPlaceholder('nombre@correo.com').fill('aspirante.e2e@correo.com')
  await page.locator('select[name="career"]').selectOption({ index: 1 })
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Enviar solicitud' }).click()

  await expect(page).toHaveURL(/\/aspirantes\/seguimiento\?folio=/)
  const folio = new URL(page.url()).searchParams.get('folio')
  expect(folio).toBeTruthy()

  await signInAs(page, 'admin')
  await page.goto('/admin/aspirantes')
  await page.getByPlaceholder('Buscar por nombre, folio o CURP').fill(folio!)
  await expect(page.getByText(nombre)).toBeVisible()
})
