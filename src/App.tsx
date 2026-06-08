import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Home from "@/pages/Home"
import Appliances from "@/pages/Appliances"
import Bills from "@/pages/Bills"
import Stats from "@/pages/Stats"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/appliances" element={<Appliances />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
