import { Routes, Route } from 'react-router-dom'
import ProjectList from './pages/ProjectList'
import Editor from './pages/Editor'
import Preview from './pages/Preview'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectList />} />
      <Route path="/editor/:projectId" element={<Editor />} />
      <Route path="/preview/:projectId" element={<Preview />} />
    </Routes>
  )
}

export default App
