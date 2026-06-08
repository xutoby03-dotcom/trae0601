import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './seed'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

document.body.style.margin = '0'
document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
document.body.style.background = '#f0f2f5'
