import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DeviceList from './pages/DeviceList'
import DeviceDetail from './pages/DeviceDetail'
import DeviceForm from './pages/DeviceForm'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/devices" element={<DeviceList />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />
        <Route path="/devices/new" element={<DeviceForm />} />
        <Route path="/devices/:id/edit" element={<DeviceForm />} />
      </Routes>
    </Layout>
  )
}

export default App
