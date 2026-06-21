import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SubmitPage from './pages/SubmitPage';
import HostConsolePage from './pages/HostConsolePage';
import DisplayPage from './pages/DisplayPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/host" element={<HostConsolePage />} />
      <Route path="/display" element={<DisplayPage />} />
    </Routes>
  );
}
