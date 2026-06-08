import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Home from "@/pages/Home"
import AddCollection from "@/pages/AddCollection"
import Detail from "@/pages/Detail"
import Exchange from "@/pages/Exchange"
import Progress from "@/pages/Progress"
import Stats from "@/pages/Stats"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
        <Route path="/add" element={<AddCollection />} />
        <Route path="/edit/:id" element={<AddCollection />} />
      </Routes>
    </Router>
  )
}
