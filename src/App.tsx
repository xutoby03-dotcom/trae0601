import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Items from '@/pages/Items';
import ItemEdit from '@/pages/ItemEdit';
import ItemDetail from '@/pages/ItemDetail';
import PlanCreate from '@/pages/PlanCreate';
import PlanDetail from '@/pages/PlanDetail';
import Statistics from '@/pages/Statistics';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/new" element={<ItemEdit />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/items/:id/edit" element={<ItemEdit />} />
        <Route path="/plans/new/:itemId" element={<PlanCreate />} />
        <Route path="/plans/:id" element={<PlanDetail />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </Layout>
  );
}

export default App;
