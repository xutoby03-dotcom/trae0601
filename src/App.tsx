import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { PageTransition } from '@/components/layout/PageTransition';
import { HomePage } from '@/pages/HomePage';
import { CreatePage } from '@/pages/CreatePage';
import { BrewingPage } from '@/pages/BrewingPage';
import { TastingPage } from '@/pages/TastingPage';
import { RevealPage } from '@/pages/RevealPage';

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-amber-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PageTransition>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/brewing/:id" element={<BrewingPage />} />
            <Route path="/tasting/:id" element={<TastingPage />} />
            <Route path="/reveal/:id" element={<RevealPage />} />
          </Routes>
        </PageTransition>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
