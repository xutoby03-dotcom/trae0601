import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Dashboard from '@/pages/Dashboard'
import TodayTasks from '@/pages/TodayTasks'
import Plants from '@/pages/Plants'
import Duty from '@/pages/Duty'
import WaterRecords from '@/pages/WaterRecords'
import PestReports from '@/pages/PestReports'
import Holidays from '@/pages/Holidays'
import Employees from '@/pages/Employees'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/today-tasks" element={<TodayTasks />} />
        <Route path="/plants" element={<Plants />} />
        <Route path="/duty" element={<Duty />} />
        <Route path="/water-records" element={<WaterRecords />} />
        <Route path="/pest-reports" element={<PestReports />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/employees" element={<Employees />} />
      </Routes>
    </MainLayout>
  )
}

export default App
