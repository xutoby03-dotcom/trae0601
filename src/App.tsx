import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Dashboard from "@/pages/Dashboard"
import NewExpense from "@/pages/NewExpense"
import Transactions from "@/pages/Transactions"
import ExpenseDetail from "@/pages/ExpenseDetail"
import CoolZone from "@/pages/CoolZone"
import Stats from "@/pages/Stats"

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewExpense />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transaction/:id" element={<ExpenseDetail />} />
          <Route path="/cool-zone" element={<CoolZone />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Layout>
    </Router>
  )
}
