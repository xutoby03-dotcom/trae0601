import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Library from '@/pages/Library'
import Stats from '@/pages/Stats'
import Navigation from '@/components/Navigation'
import SeedData from '@/components/SeedData'

export default function App() {
  return (
    <Router>
      <SeedData />
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
      <Navigation />
    </Router>
  )
}
