import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Navigation } from '@/components/Layout/Navigation';
import { Dashboard } from '@/pages/Dashboard';
import { RouteList } from '@/pages/RouteList';
import { RoutePublish } from '@/pages/RoutePublish';
import { RouteDetail } from '@/pages/RouteDetail';
import { OrderList } from '@/pages/OrderList';
import { useCarpoolStore } from '@/store/useCarpoolStore';

export default function App() {
  const initData = useCarpoolStore((state) => state.initData);

  useEffect(() => {
    initData();
  }, [initData]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/routes" element={<RouteList />} />
            <Route path="/routes/publish" element={<RoutePublish />} />
            <Route path="/routes/:id" element={<RouteDetail />} />
            <Route path="/orders" element={<OrderList />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </Router>
  );
}
