import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Apply from '@/pages/Apply'
import Review from '@/pages/Review'
import Boards from '@/pages/Boards'
import BoardDetail from '@/pages/BoardDetail'
import Dashboard from '@/pages/Dashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore(s => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/apply" element={<Apply />} />
          <Route path="/review" element={<Review />} />
          <Route path="/boards" element={<Boards />} />
          <Route path="/boards/:id" element={<BoardDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}
