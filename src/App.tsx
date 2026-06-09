import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import PolicyForm from '@/pages/PolicyForm'
import MemberList from '@/pages/MemberList'
import MemberDetail from '@/pages/MemberDetail'
import Statistics from '@/pages/Statistics'
import PolicyDetail from '@/pages/PolicyDetail'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/policy/new" element={<PolicyForm />} />
          <Route path="/policy/:id" element={<PolicyDetail />} />
          <Route path="/policy/:id/edit" element={<PolicyForm />} />
          <Route path="/members" element={<MemberList />} />
          <Route path="/members/:name" element={<MemberDetail />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  )
}
