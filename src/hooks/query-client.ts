import { QueryClient } from '@tanstack/react-query'

/**
 * Los adaptadores locales no cambian solos: los datos se consideran frescos hasta que la app los guarda.
 * Los cambios de otra pestaña se detectan al guardar (versión) y se resuelven recargando.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, refetchOnWindowFocus: false, retry: false },
  },
})

export const queryKeys = {
  institution: ['institution'] as const,
  applicants: ['applicants'] as const,
  directory: (kind: string) => ['directory', kind] as const,
  operations: ['operations'] as const,
  school: ['school'] as const,
  documents: (ownerType: string, ownerId: string) => ['documents', ownerType, ownerId] as const,
}
