import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Members from '@/pages/Members';
import Coupons from '@/pages/Coupons';
import ExpiredCoupons from '@/pages/ExpiredCoupons';
import CouponTypes from '@/pages/CouponTypes';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/coupons/expired" element={<ExpiredCoupons />} />
          <Route path="/coupon-types" element={<CouponTypes />} />
        </Routes>
      </Layout>
    </Router>
  );
}
