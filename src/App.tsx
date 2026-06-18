import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import BookList from './pages/BookList';
import BookForm from './pages/BookForm';
import BorrowList from './pages/BorrowList';
import BorrowForm from './pages/BorrowForm';
import ReturnForm from './pages/ReturnForm';
import Recommend from './pages/Recommend';

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/new" element={<BookForm />} />
          <Route path="/books/:id" element={<BookForm />} />
          <Route path="/borrow" element={<BorrowList />} />
          <Route path="/borrow/new" element={<BorrowForm />} />
          <Route path="/borrow/return/:id" element={<ReturnForm />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
