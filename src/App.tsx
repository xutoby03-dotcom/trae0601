import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import CreateActivity from "@/pages/CreateActivity"
import ActivityDetail from "@/pages/ActivityDetail"
import Record from "@/pages/Record"
import Stats from "@/pages/Stats"
import MyRuns from "@/pages/MyRuns"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateActivity />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/record/:id" element={<Record />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/my" element={<MyRuns />} />
      </Routes>
    </Router>
  )
}
