import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initMockData } from './data/mock'
import { useMedicineStore } from './store/medicineStore'

initMockData()
useMedicineStore.getState().syncRestockItems()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
