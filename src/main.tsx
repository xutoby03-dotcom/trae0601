import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useStore } from './store'

function AppInit() {
  const initData = useStore((s) => s.initData)

  useEffect(() => {
    initData()
  }, [initData])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppInit />
  </StrictMode>,
)
