import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useAppStore } from '@/store/useAppStore'

function InitApp() {
  const initData = useAppStore((state) => state.initData)

  useEffect(() => {
    initData()
  }, [initData])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InitApp />
  </StrictMode>,
)
