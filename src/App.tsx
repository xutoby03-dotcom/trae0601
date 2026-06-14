import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard/Dashboard';
import ProductList from '@/pages/Products/ProductList';
import ProductForm from '@/pages/Products/ProductForm';
import TastingMonitor from '@/pages/Tasting/TastingMonitor';
import TastingForm from '@/pages/Tasting/TastingForm';
import Statistics from '@/pages/Statistics/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="tasting" element={<TastingMonitor />} />
          <Route path="tasting/new" element={<TastingForm />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
