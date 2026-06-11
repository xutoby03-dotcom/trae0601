import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Toast from '@/components/Toast';
import Home from '@/pages/Home';
import Publish from '@/pages/Publish';
import ActivityDetail from '@/pages/ActivityDetail';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/stats" element={<Statistics />} />
          <Route
            path="*"
            element={
              <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-center animate-fade-in">
                  <div className="text-8xl mb-6">🧭</div>
                  <h1 className="text-3xl font-bold text-ink-900 mb-2">页面走丢啦</h1>
                  <p className="text-ink-500 mb-6">找不到这个页面，回到首页看看吧~</p>
                  <a href="/" className="btn-primary inline-block">返回首页</a>
                </div>
              </div>
            }
          />
        </Routes>
      </Layout>
      <Toast />
    </Router>
  );
}
