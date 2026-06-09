import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { initializeStore } from './store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Reserve from './pages/Reserve'
import Admin from './pages/Admin'
import Stats from './pages/Stats'
import './index.css'

initializeStore()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/reserve" element={<Reserve />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
