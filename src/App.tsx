import { Routes, Route } from 'react-router-dom'
import { TrialHomePage } from './pages/TrialHomePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<TrialHomePage />} />
    </Routes>
  )
}

export default App
