import { AppStateProvider } from './app-state'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <AppStateProvider>
      <AppRoutes />
    </AppStateProvider>
  )
}
