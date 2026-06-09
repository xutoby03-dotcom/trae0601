import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Dashboard from "@/pages/Dashboard"
import Purifiers from "@/pages/Purifiers"
import Replacements from "@/pages/Replacements"
import WaterQuality from "@/pages/WaterQuality"
import Statistics from "@/pages/Statistics"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/purifiers" element={<Purifiers />} />
          <Route path="/replacements" element={<Replacements />} />
          <Route path="/water-quality" element={<WaterQuality />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  )
}
