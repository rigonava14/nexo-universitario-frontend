import { expect, test } from '@playwright/test'
import { expectNoHorizontalScroll, signInAs } from './helpers'

test('el instituto da de alta un alumno y lo encuentra en el directorio', async ({ page }) => {
  const matricula = `E2E-${Date.now()}`
  await signInAs(page, 'institution')
  await page.goto('/admin/alumnos')
  await expect(page.getByRole('heading', { name: 'Alumnos', level: 1 })).toBeVisible()

  await page.getByRole('button', { name: 'Nuevo alumno' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Matrícula').fill(matricula)
  await dialog.getByLabel('Nombre completo').fill('Alumna de Prueba Automatizada')
  await dialog.getByLabel('Correo electrónico').fill('prueba.e2e@universidad.edu.mx')
  await dialog.getByLabel('Programa académico').fill('Ingeniería en Sistemas')
  await dialog.getByLabel('Semestre').fill('1')
  await dialog.getByRole('button', { name: 'Guardar expediente' }).click()

  await page.getByLabel('Buscar alumnos').fill(matricula)
  await expect(page.getByRole('cell', { name: matricula })).toBeVisible()
  await expectNoHorizontalScroll(page)

  // Persiste al recargar.
  await page.reload()
  await page.getByLabel('Buscar alumnos').fill(matricula)
  await expect(page.getByRole('cell', { name: matricula })).toBeVisible()
})
