import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Products from '@/pages/Products';
import Order from '@/pages/Order';
import Kitchen from '@/pages/Kitchen';
import Stats from '@/pages/Stats';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/products" element={<Products />} />
          <Route path="/order" element={<Order />} />
          <Route path="/kitchen" element={<Kitchen />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/" element={<Navigate to="/products" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
