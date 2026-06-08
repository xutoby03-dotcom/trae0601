import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Home from "@/pages/Home"
import Publish from "@/pages/Publish"
import CarpoolDetail from "@/pages/CarpoolDetail"
import History from "@/pages/History"
import Calculator from "@/pages/Calculator"

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/carpool/:id" element={<CarpoolDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/calculator" element={<Calculator />} />
        </Routes>
      </Layout>
    </Router>
  )
}
