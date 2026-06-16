import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import ElderList from '@/pages/Elders/ElderList';
import ElderForm from '@/pages/Elders/ElderForm';
import ElderDetail from '@/pages/Elders/ElderDetail';
import CourseList from '@/pages/Courses/CourseList';
import CourseForm from '@/pages/Courses/CourseForm';
import CourseDetail from '@/pages/Courses/CourseDetail';
import RegistrationList from '@/pages/Registrations/RegistrationList';
import RegistrationForm from '@/pages/Registrations/RegistrationForm';
import AttendanceList from '@/pages/Attendance/AttendanceList';
import AttendanceForm from '@/pages/Attendance/AttendanceForm';
import AttendanceDetail from '@/pages/Attendance/AttendanceDetail';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/elders" element={<ElderList />} />
          <Route path="/elders/new" element={<ElderForm />} />
          <Route path="/elders/:id" element={<ElderDetail />} />
          <Route path="/elders/:id/edit" element={<ElderForm />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/new" element={<CourseForm />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/courses/:id/edit" element={<CourseForm />} />
          <Route path="/registrations" element={<RegistrationList />} />
          <Route path="/registrations/new" element={<RegistrationForm />} />
          <Route path="/attendance" element={<AttendanceList />} />
          <Route path="/attendance/new" element={<AttendanceForm />} />
          <Route path="/attendance/:id" element={<AttendanceDetail />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
