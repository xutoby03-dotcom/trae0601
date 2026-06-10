import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import FreezerMap from './pages/FreezerMap';
import AddItem from './pages/AddItem';
import ItemDetail from './pages/ItemDetail';
import ToEatList from './pages/ToEatList';
import RecipeLookup from './pages/RecipeLookup';
import Statistics from './pages/Statistics';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FreezerMap />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/edit/:id" element={<AddItem />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/to-eat" element={<ToEatList />} />
        <Route path="/recipes" element={<RecipeLookup />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
