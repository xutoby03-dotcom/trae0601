import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import InitData from '@/components/InitData'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InitData />
    <App />
  </StrictMode>,
)
