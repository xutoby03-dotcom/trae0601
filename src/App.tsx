import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Samples from '@/pages/Samples'
import NewSample from '@/pages/Samples/NewSample'
import SampleDetail from '@/pages/Samples/Detail'
import Checkout from '@/pages/Checkout'
import Return from '@/pages/Return'
import Dashboard from '@/pages/Dashboard'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/samples" replace />} />
          <Route path="/samples" element={<Samples />} />
          <Route path="/samples/new" element={<NewSample />} />
          <Route path="/samples/:id" element={<SampleDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/return" element={<Return />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}
