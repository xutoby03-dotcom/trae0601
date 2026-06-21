import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import SampleNew from "@/pages/SampleNew"
import SampleDetail from "@/pages/SampleDetail"
import Recommendations from "@/pages/Recommendations"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sample/new" element={<SampleNew />} />
        <Route path="/sample/:id" element={<SampleDetail />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </Router>
  )
}
