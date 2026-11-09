import { expect, Page } from '@playwright/test'

export const accounts = {
  institution: { label: 'Admin del instituto', url: /\/admin\/institucion$/ },
  admin: { label: 'Administración', url: /\/admin$/ },
  teacher: { label: 'Docente', url: /\/docentes\/inicio$/ },
  student: { label: 'Alumno', url: /\/alumnos\/inicio$/ },
} as const

export async function signInAs(page: Page, role: keyof typeof accounts) {
  await page.goto('/')
  await page.getByRole('button', { name: accounts[role].label, exact: true }).click()
  await page.getByRole('button', { name: 'Entrar a la plataforma' }).click()
  await expect(page).toHaveURL(accounts[role].url)
}

/** Ancho del documento contra el viewport: no debe haber desplazamiento horizontal. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}
