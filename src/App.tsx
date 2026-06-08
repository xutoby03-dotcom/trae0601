import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import MapRoute from '@/pages/MapRoute'
import Timeline from '@/pages/Timeline'
import Upload from '@/pages/Upload'
import Story from '@/pages/Story'
import Export from '@/pages/Export'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MapRoute />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/story" element={<Story />} />
          <Route path="/export" element={<Export />} />
        </Route>
      </Routes>
    </Router>
  )
}
