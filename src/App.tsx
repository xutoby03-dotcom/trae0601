import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import VehicleList from '@/pages/VehicleList'
import RequestList from '@/pages/RequestList'
import ReturnList from '@/pages/ReturnList'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/requests" element={<RequestList />} />
          <Route path="/returns" element={<ReturnList />} />
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary-200">404</div>
                  <div className="mt-2 text-slate-500">页面不存在</div>
                </div>
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  )
}
