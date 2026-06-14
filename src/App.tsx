import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TripList from "@/pages/TripList";
import TripEdit from "@/pages/TripEdit";
import ExpenseList from "@/pages/ExpenseList";
import ExpenseEdit from "@/pages/ExpenseEdit";
import Settlement from "@/pages/Settlement";
import { useTripStore } from '@/store/useTripStore';

function AppContent() {
  const loadTrips = useTripStore(state => state.loadTrips);
  const isLoaded = useTripStore(state => state.isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
    }
  }, [isLoaded, loadTrips]);

  return (
    <Routes>
      <Route path="/" element={<TripList />} />
      <Route path="/trip/new" element={<TripEdit />} />
      <Route path="/trip/:id" element={<ExpenseList />} />
      <Route path="/trip/:id/edit" element={<TripEdit />} />
      <Route path="/trip/:id/expense/new" element={<ExpenseEdit />} />
      <Route path="/trip/:id/expense/:expenseId" element={<ExpenseEdit />} />
      <Route path="/trip/:id/settlement" element={<Settlement />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
