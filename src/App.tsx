import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components';
import Dashboard from '@/pages/Dashboard';
import RoomList from '@/pages/RoomList';
import RoomDetail from '@/pages/RoomDetail';
import BookingForm from '@/pages/BookingForm';
import Calendar from '@/pages/Calendar';
import ApprovalList from '@/pages/ApprovalList';
import CheckIn from '@/pages/CheckIn';
import RepairList from '@/pages/RepairList';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/booking/new" element={<BookingForm />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/approvals" element={<ApprovalList />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/repairs" element={<RepairList />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route
            path="*"
            element={
              <div className="py-20 text-center text-text-secondary">
                <p className="text-lg">页面不存在</p>
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
