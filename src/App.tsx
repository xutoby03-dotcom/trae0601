import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import RecordPage from "@/pages/RecordPage";
import ProfilePage from "@/pages/ProfilePage";
import TrendsPage from "@/pages/TrendsPage";
import NavBar from "@/components/NavBar";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <header className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">🐱</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">猫咪饮水观察</h1>
                  <p className="text-xs text-gray-500">科学监测，健康相伴</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block mt-4">
              <NavBar />
            </div>
          </header>
          
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/record" element={<RecordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/trends" element={<TrendsPage />} />
            </Routes>
          </main>
          
          <div className="md:hidden">
            <NavBar />
          </div>
        </div>
      </div>
    </Router>
  );
}
