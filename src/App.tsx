import { Routes, Route } from 'react-router-dom'
import EditorPage from './pages/EditorPage'
import FormulasPage from './pages/FormulasPage'
import DocumentPage from './pages/DocumentPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      <Route path="/formulas" element={<FormulasPage />} />
      <Route path="/document" element={<DocumentPage />} />
    </Routes>
  )
}
