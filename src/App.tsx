import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectSelector } from '@/components/project/ProjectSelector';
import { EditorPage } from '@/pages/EditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectSelector />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;