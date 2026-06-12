import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import ScreeningDetail from "@/pages/ScreeningDetail"
import Dashboard from "@/pages/Dashboard"
import Navbar from "@/components/Navbar"

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream font-body">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/screening/:id" element={<ScreeningDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}
