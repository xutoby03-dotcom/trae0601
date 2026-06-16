import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { BadgeManagement } from './pages/BadgeManagement';

function App() {
  const [showVisitorForm, setShowVisitorForm] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50">
        <Header onNewVisitor={() => setShowVisitorForm(true)} />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  onNewVisitor={() => setShowVisitorForm(true)}
                  showVisitorForm={showVisitorForm}
                  onCloseVisitorForm={() => setShowVisitorForm(false)}
                />
              }
            />
            <Route path="/badges" element={<BadgeManagement />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
