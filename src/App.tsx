import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import RadarHome from '@/pages/RadarHome';
import Courses from '@/pages/Courses';
import Assignments from '@/pages/Assignments';
import WeekView from '@/pages/WeekView';
import Stats from '@/pages/Stats';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RadarHome />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/week" element={<WeekView />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
