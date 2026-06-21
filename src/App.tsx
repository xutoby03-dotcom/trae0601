import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import BoardsPage from '@/pages/BoardsPage'
import TunesPage from '@/pages/TunesPage'
import FeedbackPage from '@/pages/FeedbackPage'
import RecommendPage from '@/pages/RecommendPage'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<BoardsPage />} />
          <Route path="/tunes" element={<TunesPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}
