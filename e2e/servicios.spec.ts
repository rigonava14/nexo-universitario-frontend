import { expect, Page, test } from '@playwright/test'
import { signInAs } from './helpers'

async function createAcademy(page: Page, name: string) {
  await page.getByRole('button', { name: 'Nueva academia' }).click()
  await page.getByLabel('Nombre de la academia').fill(name)
  await page.getByLabel('Área académica').fill('Ciencias básicas')
  await page.getByLabel('Responsable').selectOption({ index: 1 })
  await page.getByRole('button', { name: 'Guardar academia' }).click()
}

test.describe('Capa de servicios', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('una academia guardada persiste al recargar', async ({ page }) => {
    const name = `Academia E2E ${Date.now()}`
    await signInAs(page, 'institution')
    await page.goto('/admin/academias')
    await createAcademy(page, name)
    await expect(page.getByRole('status')).toContainText('Cambios guardados')
    await expect(page.getByRole('heading', { name: name })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: name })).toBeVisible()
  })

  test('un cambio guardado en otra pestaña bloquea el guardado y se revierte', async ({ page, context }) => {
    await signInAs(page, 'institution')
    await page.goto('/admin/academias')
    await expect(page.getByRole('heading', { name: 'Academias', level: 1 })).toBeVisible()

    // Otra pestaña con la misma sesión guarda primero.
    const other = await context.newPage()
    await signInAs(other, 'institution') // la sesión de demostración es por pestaña
    await other.goto('/admin/academias')
    const first = `Academia otra pestaña ${Date.now()}`
    await createAcademy(other, first)
    await expect(other.getByRole('heading', { name: first })).toBeVisible()

    // Esta pestaña tenía la versión anterior: el guardado se rechaza y la lista vuelve a como estaba.
    const second = `Academia en conflicto ${Date.now()}`
    await createAcademy(page, second)
    await expect(page.getByRole('alert')).toContainText('Los datos cambiaron en otra pestaña')
    await expect(page.getByRole('heading', { name: second })).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole('heading', { name: first })).toBeVisible()
    await expect(page.getByRole('heading', { name: second })).toHaveCount(0)
  })
})
