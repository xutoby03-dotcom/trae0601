import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Layout from "@/components/Layout"
import DeviceList from "@/pages/DeviceList"
import DeviceDetail from "@/pages/DeviceDetail"
import DeviceForm from "@/pages/DeviceForm"
import BorrowForm from "@/pages/BorrowForm"
import ReturnCheck from "@/pages/ReturnCheck"
import BorrowRecords from "@/pages/BorrowRecords"
import Alerts from "@/pages/Alerts"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="/devices" element={<DeviceList />} />
          <Route path="/devices/new" element={<DeviceForm />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/devices/:id/edit" element={<DeviceForm />} />
          <Route path="/borrow" element={<BorrowForm />} />
          <Route path="/borrow/return/:id" element={<ReturnCheck />} />
          <Route path="/records" element={<BorrowRecords />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </Router>
  )
}
