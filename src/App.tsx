import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Register from '@/pages/Register';
import PickupSearch from '@/pages/PickupSearch';
import Pickup from '@/pages/Pickup';
import Resolve from '@/pages/Resolve';
import Stats from '@/pages/Stats';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pickup-search" element={<PickupSearch />} />
          <Route path="/pickup/:id" element={<Pickup />} />
          <Route path="/resolve/:id" element={<Resolve />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
