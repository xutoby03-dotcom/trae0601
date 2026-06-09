import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreContext } from './store/context'
import { useStore } from './hooks/useStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Maintenance from './pages/Maintenance'
import Faults from './pages/Faults'
import Statistics from './pages/Statistics'

export default function App() {
  const store = useStore()

  return (
    <StoreContext.Provider value={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/faults" element={<Faults />} />
            <Route path="/statistics" element={<Statistics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreContext.Provider>
  )
}
