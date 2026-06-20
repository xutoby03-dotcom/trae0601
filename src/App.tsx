import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import MedicineBoxList from '@/pages/MedicineBoxList';
import MedicineBoxForm from '@/pages/MedicineBoxForm';
import InventoryList from '@/pages/InventoryList';
import InventoryForm from '@/pages/InventoryForm';
import BorrowList from '@/pages/BorrowList';
import BorrowForm from '@/pages/BorrowForm';
import ReminderList from '@/pages/ReminderList';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/medicine-boxes" element={<MedicineBoxList />} />
          <Route path="/medicine-boxes/new" element={<MedicineBoxForm />} />
          <Route path="/medicine-boxes/:id/edit" element={<MedicineBoxForm />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/new" element={<InventoryForm />} />
          <Route path="/inventory/:id/edit" element={<InventoryForm />} />
          <Route path="/borrows" element={<BorrowList />} />
          <Route path="/borrows/new" element={<BorrowForm />} />
          <Route path="/reminders" element={<ReminderList />} />
        </Route>
      </Routes>
    </Router>
  );
}
