import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import MainLayout from './layouts/MainLayout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Ovens = lazy(() => import('./pages/Ovens'))
const Calibration = lazy(() => import('./pages/Calibration'))
const Recipes = lazy(() => import('./pages/Recipes'))
const Batches = lazy(() => import('./pages/Batches'))
const Employees = lazy(() => import('./pages/Employees'))

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
    <Spin size="large" />
  </div>
)

const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="ovens" element={<Ovens />} />
          <Route path="calibration" element={<Calibration />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="batches" element={<Batches />} />
          <Route path="employees" element={<Employees />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
