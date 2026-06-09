import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Publish from '@/pages/Publish'
import Detail from '@/pages/Detail'
import Requests from '@/pages/Requests'
import PublishRequest from '@/pages/PublishRequest'
import Profile from '@/pages/Profile'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/uniform/:id" element={<Detail />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/publish" element={<PublishRequest />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}
