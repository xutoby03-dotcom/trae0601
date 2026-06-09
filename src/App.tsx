import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import Register from "@/pages/Register"
import Apply from "@/pages/Apply"
import MySpots from "@/pages/MySpots"
import Stats from "@/pages/Stats"
import BottomNav from "@/components/BottomNav"

export default function App() {
  return (
    <Router>
      <div className="max-w-lg mx-auto min-h-screen relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/apply/:spotId" element={<Apply />} />
          <Route path="/my-spots" element={<MySpots />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  )
}
