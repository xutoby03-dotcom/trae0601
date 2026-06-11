import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Dashboard from '@/pages/Dashboard';
import EventList from '@/pages/EventList';
import EventForm from '@/pages/EventForm';
import Booking from '@/pages/Booking';
import Appointments from '@/pages/Appointments';
import Statistics from '@/pages/Statistics';
import { useEventStore } from '@/store/eventStore';
import { useAppointmentStore } from '@/store/appointmentStore';

function App() {
  const initEvents = useEventStore(state => state.initEvents);
  const initAppointments = useAppointmentStore(state => state.initAppointments);

  useEffect(() => {
    initEvents();
    initAppointments();
  }, [initEvents, initAppointments]);

  return (
    <Router>
      <div className="min-h-screen bg-warm-50">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id/edit" element={<EventForm />} />
            <Route path="/events/:id/booking" element={<Booking />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
