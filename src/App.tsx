import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Home from "@/pages/Home"
import LoanForm from "@/pages/LoanForm"
import LoanDetail from "@/pages/LoanDetail"
import Stats from "@/pages/Stats"

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loan/new" element={<LoanForm />} />
          <Route path="/loan/:id" element={<LoanDetail />} />
          <Route path="/loan/:id/edit" element={<LoanForm />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Layout>
    </Router>
  )
}
