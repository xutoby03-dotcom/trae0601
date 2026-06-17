import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeMockData } from './services/storage'
import { umbrellaService } from './services/umbrellaService'

initializeMockData();
umbrellaService.forceCheckExpired();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
