import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '@/pages/Home';
import CableList from '@/pages/CableList';
import CableDetail from '@/pages/CableDetail';
import CableNew from '@/pages/CableNew';
import CableEdit from '@/pages/CableEdit';
import BorrowList from '@/pages/BorrowList';
import BorrowApply from '@/pages/BorrowApply';
import MyBorrow from '@/pages/MyBorrow';
import ReturnList from '@/pages/ReturnList';
import ReturnProcess from '@/pages/ReturnProcess';
import Statistics from '@/pages/Statistics';
import AdminLogin from '@/pages/AdminLogin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        <Route path="/cables" element={<CableList />} />
        <Route path="/cables/new" element={<CableNew />} />
        <Route path="/cables/:id" element={<CableDetail />} />
        <Route path="/cables/:id/edit" element={<CableEdit />} />
        
        <Route path="/borrow" element={<BorrowList />} />
        <Route path="/borrow/:id" element={<BorrowApply />} />
        <Route path="/my-borrow" element={<MyBorrow />} />
        
        <Route path="/return" element={<ReturnList />} />
        <Route path="/return/:id" element={<ReturnProcess />} />
        
        <Route path="/statistics" element={<Statistics />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
