import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import CreatePlan from '@/pages/CreatePlan'
import PlanDetail from '@/pages/PlanDetail'
import OrderTracking from '@/pages/OrderTracking'
import RefundBudget from '@/pages/RefundBudget'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen gradient-hero">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan/new" element={<CreatePlan />} />
          <Route path="/plan/:id" element={<PlanDetail />} />
          <Route path="/plan/:id/order" element={<OrderTracking />} />
          <Route path="/plan/:id/refund" element={<RefundBudget />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
    </Router>
  )
}
