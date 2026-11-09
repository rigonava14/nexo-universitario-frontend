import { expect, test } from '@playwright/test'
import { accounts, expectNoHorizontalScroll, signInAs } from './helpers'

test.describe('Acceso por rol', () => {
  for (const role of Object.keys(accounts) as Array<keyof typeof accounts>) {
    test(`la cuenta de ${accounts[role].label} entra a su portal`, async ({ page }) => {
      await signInAs(page, role)
      await expectNoHorizontalScroll(page)
    })
  }

  test('una contraseña incorrecta muestra un error y no entra', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Contraseña').fill('incorrecta')
    await page.getByRole('button', { name: 'Entrar a la plataforma' }).click()
    await expect(page.getByRole('alert')).toContainText('Datos incorrectos')
    await expect(page).toHaveURL(/\/$/)
  })

  test('sin sesión, una ruta de administración regresa al inicio de sesión', async ({ page }) => {
    await page.goto('/admin/finanzas')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()
  })

  test('administración no puede abrir secciones exclusivas del instituto', async ({ page }) => {
    await signInAs(page, 'admin')
    await page.goto('/admin/usuarios-permisos')
    await expect(page).toHaveURL(/\/admin$/)
  })

  test('el alumno no puede abrir el panel de administración', async ({ page }) => {
    await signInAs(page, 'student')
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/alumnos\/inicio$/)
  })

  test('cerrar sesión regresa al inicio de sesión', async ({ page }) => {
    await signInAs(page, 'admin')
    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await expect(page).toHaveURL(/\/$/)
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/$/)
  })
})
