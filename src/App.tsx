import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import CarouselScreen from "@/pages/CarouselScreen"
import PassengerManager from "@/pages/PassengerManager"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CarouselScreen />} />
        <Route path="/manage" element={<PassengerManager />} />
      </Routes>
    </Router>
  )
}
