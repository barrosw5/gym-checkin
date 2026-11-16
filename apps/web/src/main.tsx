import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/figtree'
import './index.css'
import App from './App.tsx'
import LocaleProvider from './components/LocaleProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Outermost: every page, including login, can be translated */}
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </StrictMode>,
)
