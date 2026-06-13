import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PetDetailPage from "./pages/PetDetailPage";
import PetFormPage from "./pages/PetFormPage";
import DewormFormPage from "./pages/DewormFormPage";
import StatisticsPage from "./pages/StatisticsPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/pet/new" element={<PetFormPage />} />
            <Route path="/pet/:id" element={<PetDetailPage />} />
            <Route path="/pet/:id/edit" element={<PetFormPage />} />
            <Route path="/pet/:id/deworm/new" element={<DewormFormPage />} />
            <Route
              path="*"
              element={
                <div className="container py-20 text-center">
                  <h2 className="font-display text-2xl font-bold text-ink-700">
                    页面不存在
                  </h2>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
