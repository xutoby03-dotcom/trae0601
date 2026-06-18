import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { WeddingProvider } from './context/WeddingContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WeddingProvider>
      <App />
    </WeddingProvider>
  </React.StrictMode>,
)
