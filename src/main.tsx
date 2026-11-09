import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { I18nProvider } from './i18n'
import { isTabId } from './routes'

const declaredPage = document.documentElement.dataset.page
const page = isTabId(declaredPage) ? declaredPage : 'home'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider page={page}>
      <App page={page} />
    </I18nProvider>
  </StrictMode>,
)