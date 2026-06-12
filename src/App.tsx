import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { BatchList } from './pages/BatchList';
import { BatchEdit } from './pages/BatchEdit';
import { OrderList } from './pages/OrderList';
import { OrderNew } from './pages/OrderNew';
import { QueuePage } from './pages/Queue';
import { Display } from './pages/Display';
import { BatchForm } from './components/BatchForm';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/batches" element={<BatchList />} />
          <Route path="/batches/new" element={<BatchForm mode="create" />} />
          <Route path="/batches/:id/edit" element={<BatchEdit />} />
          <Route path="/batches/:batchId/orders" element={<OrderList />} />
          <Route path="/batches/:batchId/orders/new" element={<OrderNew />} />
          <Route path="/queue" element={<QueuePage />} />
        </Route>
        <Route path="/display" element={<Display />} />
      </Routes>
    </Router>
  );
}
