import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './store/useStore'
import Layout from './components/Layout'
import HomePage from './pages/Home'
import PublishPage from './pages/Publish'
import StatsPage from './pages/Stats'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  )
}
