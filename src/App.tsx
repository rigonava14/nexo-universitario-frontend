import { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppStateProvider } from './app-state'
import { queryClient } from './hooks/query-client'
import AppRoutes from './routes/AppRoutes'
import { PageLoading } from './routes/PageLoading'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<PageLoading />}>
        <AppStateProvider>
          <AppRoutes />
        </AppStateProvider>
      </Suspense>
    </QueryClientProvider>
  )
}
