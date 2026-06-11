import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { SubmitPage } from '@/pages/Submit';
import { ReviewPage } from '@/pages/Review';
import { SummaryPage } from '@/pages/Summary';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SubmitPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
