import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import CheckinPage from './pages/CheckinPage';
import UsingPage from './pages/UsingPage';
import CleanupPage from './pages/CleanupPage';
import ChairDetail from './pages/ChairDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const { user } = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const showNavbar = user && location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? 'pb-8' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <RequireAuth>
              <BookingPage />
            </RequireAuth>
          } />
          
          <Route path="/my-bookings" element={
            <RequireAuth>
              <MyBookings />
            </RequireAuth>
          } />
          
          <Route path="/checkin/:id" element={
            <RequireAuth>
              <CheckinPage />
            </RequireAuth>
          } />
          
          <Route path="/using/:id" element={
            <RequireAuth>
              <UsingPage />
            </RequireAuth>
          } />
          
          <Route path="/cleanup/:id" element={
            <RequireAuth>
              <CleanupPage />
            </RequireAuth>
          } />
          
          <Route path="/chair/:id" element={
            <RequireAuth>
              <ChairDetail />
            </RequireAuth>
          } />
          
          <Route path="/profile" element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          } />
          
          <Route path="/admin" element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ToastProvider>
  );
}
