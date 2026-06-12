import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import ItemList from '@/pages/ItemList';
import ItemForm from '@/pages/ItemForm';
import ItemDetail from '@/pages/ItemDetail';
import RequestList from '@/pages/RequestList';
import RequestForm from '@/pages/RequestForm';
import PurchaseList from '@/pages/PurchaseList';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/items" element={<ItemList />} />
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/items/:id/edit" element={<ItemForm />} />
          <Route path="/requests" element={<RequestList />} />
          <Route path="/requests/new" element={<RequestForm />} />
          <Route path="/purchases" element={<PurchaseList />} />
          <Route path="/stats" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
