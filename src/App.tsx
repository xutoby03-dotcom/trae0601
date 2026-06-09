import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import Home from './pages/Home'
import TripDetail from './pages/TripDetail'
import AddExpense from './pages/AddExpense'
import Settlement from './pages/Settlement'
import Statistics from './pages/Statistics'
import SharedFund from './pages/SharedFund'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trip/:tripId" element={<TripDetail />} />
          <Route path="/trip/:tripId/add-expense" element={<AddExpense />} />
          <Route path="/trip/:tripId/settlement" element={<Settlement />} />
          <Route path="/trip/:tripId/statistics" element={<Statistics />} />
          <Route path="/trip/:tripId/shared-fund" element={<SharedFund />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
