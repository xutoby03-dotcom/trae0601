import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Review from './pages/Review';
import Summary from './pages/Summary';
import CommunityItems from './pages/CommunityItems';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/review" element={<Review />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/community-items" element={<CommunityItems />} />
      </Route>
    </Routes>
  );
}

export default App;
