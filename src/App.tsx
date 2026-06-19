import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Posters from './pages/Posters';
import PosterForm from './pages/Posters/PosterForm';
import Applications from './pages/Applications';
import ApplicationForm from './pages/Applications/ApplicationForm';
import Audit from './pages/Audit';
import PostingList from './pages/PostingList';
import Execution from './pages/Execution';
import Exceptions from './pages/Exceptions';
import Reminders from './pages/Reminders';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/posters" element={<Posters />} />
          <Route path="/posters/new" element={<PosterForm />} />
          <Route path="/posters/:id/edit" element={<PosterForm />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/new" element={<ApplicationForm />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/posting-list" element={<PostingList />} />
          <Route path="/execution" element={<Execution />} />
          <Route path="/exceptions" element={<Exceptions />} />
          <Route path="/reminders" element={<Reminders />} />
        </Route>
      </Routes>
    </Router>
  );
}
