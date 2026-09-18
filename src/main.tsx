import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import './student.css'
import './teacher.css'
import './settings.css'
import './school-control.css'
import './academic-offer.css'
import './finance.css'
import './scholarships.css'
import './permissions.css'
import './theme.css'
import './design-system.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
