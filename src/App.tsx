import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store';
import Home from './pages/Home';
import CreateOrder from './pages/CreateOrder';
import OrderDetail from './pages/OrderDetail';
import Statistics from './pages/Statistics';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateOrder />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/stats" element={<Statistics />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
