import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { ChordLookupPage } from "@/pages/ChordLookup";
import { PracticePage } from "@/pages/Practice";
import { ProgressionPage } from "@/pages/Progression";
import { RecognitionPage } from "@/pages/Recognition";
import { FavoritesPage } from "@/pages/Favorites";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<ChordLookupPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/progression" element={<ProgressionPage />} />
          <Route path="/recognition" element={<RecognitionPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </div>
    </Router>
  );
}
